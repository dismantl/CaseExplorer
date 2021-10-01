import os
import json
import click
import csv
import logging
from flask.cli import with_appcontext
from sqlalchemy import distinct, create_engine
from sqlalchemy.sql import and_, or_
from sqlalchemy.dialects.postgresql import insert
from multiprocessing import Pool, set_start_method
from os import getpid, cpu_count
from .utils import db_session, get_case_model_list
from .models import Case, DSTRAF, DSCRRelatedPerson, DSK8RelatedPerson
from .officer import Officer, CopCache

logger = logging.getLogger(__name__)


@click.command()
@click.argument('output')
@with_appcontext
def print_graphql_schema(output):
    from graphql.utils import schema_printer
    from . import graphql_service
    schema = graphql_service.get_schema()
    schema_str = schema_printer.print_schema(schema)
    with open(output, 'w') as schemafile:
        schemafile.write(schema_str)


@click.command()
@click.argument('output')
@with_appcontext
def print_swagger_spec(output):
    from flask_restx import Swagger
    from . import app, rest_api
    with app.test_request_context(), open(output, 'w') as specfile:
        spec = Swagger(rest_api.api).as_dict()
        spec['schemes'] = ['https']
        spec['host'] = 'api.mdcaseexplorer.com'
        specfile.write(
            json.dumps(
                spec,
                sort_keys=True,
                indent=4,
                separators=(',', ': ')
            )
        )


@click.command()
@click.argument('output')
@with_appcontext
def export_column_metadata(output):
    from . import models
    with open(output, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(['Table name', 'Column name', 'Label', 'Description', 'Width in pixels'])
        rows = []
        if models.ColumnMetadata.query.count() > 0:
            for row in models.ColumnMetadata.query.all():
                rows.append([row.table, row.column_name, row.label, row.description, row.width_pixels])
        else:
            for table in models.Case.metadata.sorted_tables:
                for col in table.columns:
                    rows.append([table.name, col.name])
        rows = sorted(rows)
        for row in rows:
            writer.writerow(row)


@click.command()
@click.argument('input')
@with_appcontext
def import_column_metadata(input):
    from . import models
    with open(input, newline='') as infile:
        reader = csv.reader(infile)
        next(reader)  # skip header row
        with db_session() as db:
            for row in reader:
                table = row[0]
                column_name = row[1]
                label = row[2]
                description = row[3]
                width_pixels = row[4]
                stmt = insert(models.ColumnMetadata).values(
                    table=table,
                    column_name=column_name,
                    label=label,
                    description=description or None,
                    width_pixels=int(width_pixels) if width_pixels else None
                )
                upsert_stmt = stmt.on_conflict_do_update(
                    constraint='column_metadata_table_column_name_key',
                    set_=dict(
                        table=stmt.excluded.table,
                        column_name=stmt.excluded.column_name,
                        label=stmt.excluded.label,
                        description=stmt.excluded.description,
                        width_pixels=stmt.excluded.width_pixels
                    )
                )
                db.execute(upsert_stmt)


@click.command()
@with_appcontext
def update_metadata():
    '''Query for redacted and enum columns, storing results in column_metadata'''
    from . import models
    with db_session() as db:
        for model in get_case_model_list(models):
            order = 1
            for column in model.__table__.columns:
                metadatum = db.query(models.ColumnMetadata).filter_by(table=model.__table__.name, column_name=column.name).one_or_none()
                if not metadatum:
                    continue
                if column.enum == True:
                    results = db.query(distinct(column)).all()
                    logger.info(f'Setting {len(results)} enum values for {model.__table__.name}.{column.name}')
                    metadatum.allowed_values = [_ for _, in results]
                if column.redacted == True:
                    logger.info(f'Setting redacted=True for {model.__table__.name}.{column.name}')
                    metadatum.redacted = True
                else:
                    if column.name == 'case_number':
                        metadatum.order = 0
                    else:
                        metadatum.order = order
                        order += 1

@click.command()
@with_appcontext
def cache_cops():
    '''Update cops_cache table with matches between officer sequence numbers and case numbers'''
    write_db_uri = os.environ.get('MJCS_DATABASE_URL')
    if not write_db_uri:
        raise Exception('Must specify MJCS_DATABASE_URL environment variable with write-enabled credentials')

    from . import app
    with db_session(app.config.bpdwatch_db_engine) as bpdwatch_db:
        db_officers = bpdwatch_db.query(Officer).all()
        officers = []
        for officer in db_officers:
            if officer.department_id != 1:  # BPD only
                continue
            if not officer.unique_internal_identifier:
                continue
            officers.append({
                'unique_internal_identifier': officer.unique_internal_identifier,
                'first_name': officer.first_name,
                'last_name': officer.last_name,
                'middle_initial': officer.middle_initial,
                'suffix': officer.suffix
            })

    cpus = cpu_count()
    set_start_method('fork')  # multiprocessing logging won't work with the spawn method
    with Pool() as worker_pool:
        jobs = []
        while True:
            slice = officers[:cpus]
            officers = officers[cpus:]
            if not slice:
                logger.info('No more officers to process')
                break
            for officer in slice:
                # logger.info(f'Dispatching officer {officer.full_name()} ({officer.unique_internal_identifier}) to worker')
                job = worker_pool.apply_async(cache_cop, (officer, write_db_uri))
                jobs.append((job, officer))
            while len(jobs) > cpus:
                for job, officer in jobs:
                    try:
                        if job.ready():
                            try:
                                job.get()  # To re-raise exceptions from child process
                            except Exception as e:
                                logger.error(f'Error caching officer {officer.unique_internal_identifier}: {e}', exc_info=True)
                                raise
                            jobs.remove((job, officer))
                    except ValueError:
                        # Job not finished, let it keep running
                        pass
        logger.info('Wait for remaining jobs to complete before exiting')
        for job,_ in jobs:
            job.wait(timeout=60)

def cache_cop(officer, write_db_uri):
    write_engine = create_engine(write_db_uri)
    with db_session(write_engine) as db:
        logger.info(f'Updating cache for officer {officer["unique_internal_identifier"]}')
        last_name = officer['last_name'].upper()
        first_name = officer['first_name'].upper()
        middle_initial = officer['middle_initial'].upper() if officer['middle_initial'] else None
        suffix = officer['suffix'].upper() if officer['suffix'] else None
        seq_number = officer['unique_internal_identifier']
        if suffix and middle_initial:
            name_perms = [
                f'{last_name}, {first_name}',
                f'{last_name}, {first_name[0]}',
                f'{last_name}, {first_name} {suffix}',
                f'{last_name}, {first_name[0]} {suffix}',
                f'{last_name}, {first_name} {middle_initial[0]}',
                f'{last_name}, {first_name[0]} {middle_initial[0]}',
                f'{last_name}, {first_name} {middle_initial[0]} {suffix}',
                f'{last_name}, {first_name[0]} {middle_initial[0]} {suffix}',
                f'{last_name}, {first_name} {middle_initial[0]}.',
                f'{last_name}, {first_name[0]} {middle_initial[0]}.',
                f'{last_name}, {first_name} {middle_initial[0]}. {suffix}',
                f'{last_name}, {first_name[0]} {middle_initial[0]}. {suffix}'
            ]
        elif middle_initial:
            name_perms = [
                f'{last_name}, {first_name}',
                f'{last_name}, {first_name[0]}',
                f'{last_name}, {first_name} {middle_initial[0]}',
                f'{last_name}, {first_name[0]} {middle_initial[0]}',
                f'{last_name}, {first_name} {middle_initial[0]}.',
                f'{last_name}, {first_name[0]} {middle_initial[0]}.'
            ]
        elif suffix:
            name_perms = [
                f'{last_name}, {first_name}',
                f'{last_name}, {first_name[0]}',
                f'{last_name}, {first_name} {suffix}',
                f'{last_name}, {first_name[0]} {suffix}'
            ]
        else:
            name_perms = [
                f'{last_name}, {first_name}',
                f'{last_name}, {first_name[0]}'
            ]
        dscr_clause = and_(
            DSCRRelatedPerson.connection.like('%POLICE%'),
            DSCRRelatedPerson.agency_code == 'AD',
            or_(
                DSCRRelatedPerson.officer_id == seq_number,
                *[DSCRRelatedPerson.name == name_perm for name_perm in name_perms]
            )
        )
        dstraf_clause = or_(
            DSTRAF.officer_id == seq_number,
            *[and_(DSTRAF.officer_name == name_perm, DSTRAF.officer_id == None)
                for name_perm in name_perms]
        )
        dsk8_clause = and_(
            DSK8RelatedPerson.connection.like('%POLICE%'),
            or_(*[DSK8RelatedPerson.name.like(name_perm) for name_perm in name_perms])
        )

        q1 = db.query(Case.case_number)\
            .join(DSCRRelatedPerson, Case.case_number == DSCRRelatedPerson.case_number)\
            .filter(dscr_clause)
        q2 = db.query(Case.case_number)\
            .join(DSTRAF, Case.case_number == DSTRAF.case_number)\
            .filter(dstraf_clause)
        q3 = db.query(Case.case_number)\
            .join(DSK8RelatedPerson, Case.case_number == DSK8RelatedPerson.case_number)\
            .filter(dsk8_clause)
        query = q1.union(q2).union(q3)

        results = query.all()
        for case_number, in results:
            stmt = insert(CopCache).values(
                case_number=case_number,
                officer_seq_no=officer['unique_internal_identifier']
            )
            upsert_stmt = stmt.on_conflict_do_nothing(
                'cops_cache_pkey'
            )
            db.execute(upsert_stmt)