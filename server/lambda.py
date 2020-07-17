import re
import os
import sys
import json
from datetime import datetime, date, time

srcpath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(srcpath+"/.requirements")

from flask_restx import marshal
from app import app, rest_api
from app.service import DataService
from app.graphql import transform_filter_model
from app.utils import get_model_name_by_table_name, get_eager_query, get_orm_class_by_name
from app.api.dscr import get_case_numbers_by_officer_sequence_number


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
    print(event)
    if 'field' in event:  # GraphQL API
        table_name = event['field']
        args = event['arguments']
        with app.app_context():
            results = DataService.fetch_rows_orm_eager(
                table_name,
                {
                    'startRow': args['start_row'],
                    'endRow': args['end_row'],
                    'rowGroupCols': args['row_group_cols'],
                    'valueCols': args['value_cols'],
                    'pivotCols': args['pivot_cols'],
                    'pivotMode': args['pivot_mode'],
                    'groupKeys': args['group_keys'],
                    'sortModel': args['sort_model'],
                    'filterModel': transform_filter_model(args['filter_model'])
                }
            )
            model_name = get_model_name_by_table_name(table_name)
            results['rows'] = [marshal(row, rest_api.api_schemas[f'{model_name}Full']) for row in results['rows']]
        return results
    else:  # REST API
        with app.app_context():
            path = event['path']
            bpd_match = re.fullmatch(r'/api/bpd/(?P<sequence_number>\w\d\d\d)', path)
            case_match = re.fullmatch(r'/api/(?P<table_name>\w+)(/(?P<case_number>\w+))?(?P<full>/full)?', path)
            if bpd_match:
                seq_no = bpd_match.group('sequence_number')
                case_numbers = get_case_numbers_by_officer_sequence_number(seq_no)
                return gen_response(200, json.dumps(case_numbers))
            elif case_match:
                table_name = case_match.group('table_name')
                case_number = case_match.group('case_number')
                full = case_match.group('full')

                if event.get('body'):  # POST
                    model_name = get_model_name_by_table_name(table_name)
                    req = json.loads(json.loads(event['body']))
                    results = DataService.fetch_rows_orm(table_name, req)
                    results['rows'] = [marshal(row, rest_api.api_schemas[model_name]) for row in results['rows']]
                    return gen_response(200, json.dumps(results))
                else:  # GET
                    if case_number:
                        try:
                            model = get_orm_class_by_name(table_name)
                        except:
                            return gen_404(path)
                        if full:
                            requested_obj = get_eager_query(model).filter(model.case_number == case_number).one()
                            result = marshal(requested_obj, rest_api.api_schemas[f'{model.__name__}Full'])
                        else:
                            requested_obj = model.query.filter(model.case_number == case_number).one()
                            result = marshal(requested_obj, rest_api.api_schemas[model.__name__])
                        return gen_response(200, json.dumps(result))
            return gen_404(path)