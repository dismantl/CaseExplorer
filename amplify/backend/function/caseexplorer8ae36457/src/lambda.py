import os
import sys
import json

srcpath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(srcpath+"/.requirements")

from api import set_db_uri, fetch_rows

def handler(event, context):
    # print(event)
    set_db_uri(os.environ['SQLALCHEMY_DATABASE_URI'])
    response = fetch_rows(event['path'], json.loads(json.loads(event['body'])))
    # print(response)
    return {
        'body': json.dumps(response),
        'headers': {
            "Access-Control-Allow-Origin": "*",
        },
        'statusCode': 200,
    }
