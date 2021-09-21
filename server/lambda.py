import re
import os
import sys
import json
import logging

# srcpath = os.path.dirname(os.path.abspath(__file__))
# sys.path.append(srcpath+"/.requirements")

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__),'env'))

from sqlalchemy.orm.exc import NoResultFound
from .service import DataService
from .utils import (get_model_name_by_table_name, get_eager_query,
                       get_orm_class_by_name, TableNotFound, db_session)


logger = logging.getLogger(__name__)


def gen_response(status_code, body):
    return {
        'body': body,
        'headers': {
            "Access-Control-Allow-Origin": "*",
        },
        'statusCode': status_code,
    }


def gen_404(path):
    return gen_response(404, json.dumps({'message': f'Not found: {path}'}))


def handler(event, context):
    # if 'field' in event:  # GraphQL API
    #     from app.graphql import transform_filter_model
    #     from .schema_factory import schema_factory
    #     api_schemas = schema_factory()
    #     table_name = event['field']
    #     args = event['arguments']
    #     results = DataService.fetch_rows_orm_eager(
    #         table_name,
    #         {
    #             'startRow': args['start_row'],
    #             'endRow': args['end_row'],
    #             'rowGroupCols': args['row_group_cols'],
    #             'valueCols': args['value_cols'],
    #             'pivotCols': args['pivot_cols'],
    #             'pivotMode': args['pivot_mode'],
    #             'groupKeys': args['group_keys'],
    #             'sortModel': args['sort_model'],
    #             'filterModel': transform_filter_model(args['filter_model'])
    #         }
    #     )
    #     model_name = get_model_name_by_table_name(table_name)
    #     results['rows'] = [api_schemas[f'{model_name}Full'].dump(row) for row in results['rows']]
    #     return results
    # else:  # REST API
    path = event['path']
    bpd_match = re.fullmatch(r'/api/bpd/seq/(?P<sequence_number>\w\d\d\d)', path)
    bpd_total_match = re.fullmatch(r'/api/bpd/seq/(?P<sequence_number>\w\d\d\d)/total', path)
    bpd_id_match = re.fullmatch(r'/api/bpd/id/(?P<id>\d+)', path)
    bpd_label_match = re.fullmatch(r'/api/bpd/label/(?P<sequence_number>\w\d\d\d)', path)
    case_match = re.fullmatch(r'/api/(?P<table_name>\w+)(/(?P<case_number>\w+))?(?P<full>/full)?', path)
    total_match = re.fullmatch(r'/api/(?P<table_name>\w+)/total', path)
    total_filtered_match = re.fullmatch(r'/api/(?P<table_name>\w+)/filtered/total', path)
    if path == '/api/metadata':
        return gen_response(200, json.dumps(DataService.fetch_metadata()))
    elif bpd_match:
        from .schema_factory import schema_factory
        api_schemas = schema_factory()
        seq_no = bpd_match.group('sequence_number')
        req = json.loads(json.loads(event['body']))
        results = DataService.fetch_cases_by_cop(seq_no, req)
        schema = api_schemas['Case']()
        results['rows'] = [schema.dump(row) for row in results['rows']]
        return gen_response(200, json.dumps(results))
    elif bpd_total_match:
        seq_no = bpd_total_match.group('sequence_number')
        if event.get('body'):  # POST
            req = json.loads(event['body'])
            total = DataService.fetch_filtered_total_by_cop(seq_no, req)
            return gen_response(200, total)
        else:  # GET
            total = DataService.fetch_filtered_total_by_cop(seq_no)
            return gen_response(200, total)
    elif bpd_id_match:
        id = bpd_id_match.group('id')
        return gen_response(200, json.dumps(DataService.fetch_seq_number_by_id(id)))
    elif bpd_label_match:
        seq_no = bpd_label_match.group('sequence_number')
        return gen_response(200, json.dumps(DataService.fetch_label_by_cop(seq_no)))
    elif total_filtered_match:
        table_name = total_filtered_match.group('table_name')
        req = json.loads(event['body'])
        total = DataService.fetch_filtered_total(table_name, req)
        return gen_response(200, total)
    elif total_match:
        table_name = total_match.group('table_name')
        total = DataService.fetch_total(table_name)
        return gen_response(200, total)
    elif path == '/api/cases/count':  # only used by Case Harvester README badge
        total = DataService.fetch_total('cases')
        return gen_response(200, json.dumps({'count': total}))
    elif case_match:
        from .schema_factory import schema_factory
        api_schemas = schema_factory()
        table_name = case_match.group('table_name')
        case_number = case_match.group('case_number')
        full = case_match.group('full')

        if event.get('body'):  # POST
            try:
                model_name = get_model_name_by_table_name(table_name)
            except TableNotFound:
                return gen_404(path)
            req = json.loads(json.loads(event['body']))
            with db_session() as db:
                results = DataService.fetch_rows_orm(db, table_name, req)
                schema = api_schemas[model_name]()
                results['rows'] = [schema.dump(row) for row in results['rows']]
            return gen_response(200, json.dumps(results))
        else:  # GET
            if case_number:
                try:
                    model = get_orm_class_by_name(table_name)
                except TableNotFound:
                    return gen_404(path)
                with db_session() as db:
                    if full:
                        try:
                            requested_obj = get_eager_query(model, db).filter(model.case_number == case_number).one()
                        except NoResultFound:
                            return gen_404(path)
                        result = api_schemas[f'{model.__name__}Full']().dump(requested_obj)
                    else:
                        try:
                            requested_obj = db.query(model).filter(model.case_number == case_number).one()
                        except NoResultFound:
                            return gen_404(path)
                        result = api_schemas[model.__name__]().dump(requested_obj)
                return gen_response(200, json.dumps(result))

    return gen_404(path)