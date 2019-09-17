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
from app.utils import get_model_name_by_table_name


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
            if event['body']:  # POST
                path = event['path']
                table_name = path[5:]  # remove /api/
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
