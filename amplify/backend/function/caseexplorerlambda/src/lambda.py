import re
import os
import sys
import json
from datetime import datetime, date, time

srcpath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(srcpath+"/.requirements")

from flask_restplus import marshal
from app import app, rest_api
from app.service import DataService
from app.graphql import transform_filter_model
from app.utils import get_model_name_by_table_name, get_eager_query, get_orm_class_by_name


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
        print(results)
        return results
    else:  # REST API
        with app.app_context():
            path = event['path']
            matches = re.fullmatch(r'/api/(?P<table_name>\w+)(/(?P<case_number>\w+))?(?P<full>/full)?', path)
            if not matches:
                raise Exception(f'Invalid path: {path}')
            table_name = matches.group('table_name')
            case_number = matches.group('case_number')
            full = matches.group('full')

            if event.get('body'):  # POST
                model_name = get_model_name_by_table_name(table_name)
                req = json.loads(json.loads(event['body']))
                results = DataService.fetch_rows_orm(table_name, req)
                results['rows'] = [marshal(row, rest_api.api_schemas[model_name]) for row in results['rows']]
                return {
                    'body': json.dumps(results),
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                    },
                    'statusCode': 200,
                }
            else:  # GET
                if case_number:
                    model = get_orm_class_by_name(table_name)
                    if full:
                        requested_obj = get_eager_query(model).filter(model.case_number == case_number).one()
                        result = marshal(requested_obj, rest_api.api_schemas[f'{model.__name__}Full'])
                    else:
                        requested_obj = model.query.filter(model.case_number == case_number).one()
                        result = marshal(requested_obj, rest_api.api_schemas[model.__name__])
                    return {
                        'body': json.dumps(result),
                        'headers': {
                            "Access-Control-Allow-Origin": "*",
                        },
                        'statusCode': 200,
                    }
