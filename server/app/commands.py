import json
import click
import csv
import logging
from flask.cli import with_appcontext
from sqlalchemy import distinct
from sqlalchemy.dialects.postgresql import insert
from .utils import db_session, get_model_list

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
        writer.writerow(['Table name', 'Column name', 'Description', 'Width in pixels'])
        rows = []
        if models.ColumnMetadata.query.count() > 0:
            for row in models.ColumnMetadata.query.all():
                rows.append([row.table, row.column_name, row.description, row.width_pixels])
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
                description = row[2]
                width_pixels = row[3]
                stmt = insert(models.ColumnMetadata).values(
                    table=table,
                    column_name=column_name,
                    description=description or None,
                    width_pixels=int(width_pixels) if width_pixels else None
                )
                upsert_stmt = stmt.on_conflict_do_update(
                    constraint='column_metadata_table_column_name_key',
                    set_=dict(
                        table=stmt.excluded.table,
                        column_name=stmt.excluded.column_name,
                        description=stmt.excluded.description,
                        width_pixels=stmt.excluded.width_pixels
                    )
                )
                db.execute(upsert_stmt)


@click.command()
@with_appcontext
def set_enums():
    '''Query all enum columns for distinct entries, storing results in column_metadata'''
    from . import models
    for model in get_model_list(models):
        for column in model.__table__.columns:
            if hasattr(column,'enum') and column.enum == True:
                with db_session() as db:
                    metadata = db.query(models.ColumnMetadata).filter_by(table=model.__table__.name, column_name=column.name).one_or_none()
                    if metadata:
                        results = db.query(distinct(column)).all()
                        logger.info(f'Setting {len(results)} enum values for {model.__table__.name}.{column.name}')
                        metadata.allowed_values = [_ for _, in results]
