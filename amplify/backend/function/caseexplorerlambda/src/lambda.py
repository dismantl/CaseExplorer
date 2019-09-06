import os
import sys
import json
from datetime import datetime, date, time

srcpath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(srcpath+"/.requirements")

from app import app
from app.api import fetch_rows, get_orm_class_by_name
from app.schema import transform_filter_model #, Query

def handler(event, context):
    print(event)
    if 'field' in event:  # GraphQL API
        if event['field'] == 'row_data':
            args = event['arguments']
            model = args['model']
            cls = get_orm_class_by_name(model)
            with app.app_context():
                results = fetch_rows(
                    model,
                    {
                        'startRow': args['start_row'],
                        'endRow': args['end_row'],
                        'rowGroupCols': args['row_group_cols'],
                        'valueCols': args['value_cols'],
                        'pivotCols': args['pivot_cols'],
                        'groupKeys': args['group_keys'],
                        'sortModel': args['sort_model'],
                        'filterModel': transform_filter_model(args['filter_model'])
                    }
                )
                for row in results['rows']:
                    row['__typename'] = cls.__name__
                    for col, val in row.items():
                        if type(val) == date or type(val) == time or type(val) == datetime:
                            print('date or time or datetime', str(col), str(val))
                            row[col] = val.isoformat()
                        if type(val) == datetime and '+' not in row[col]:
                                row[col] += 'Z'
            print(results)
            return results
    else:  # REST API
        model = event['path'][5:]  # remove "/api/"
        response = fetch_rows(model, json.loads(json.loads(event['body'])))
        print(response)
        return {
            'body': json.dumps(response),
            'headers': {
                "Access-Control-Allow-Origin": "*",
            },
            'statusCode': 200,
        }
