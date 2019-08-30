import os
import sys
import json

srcpath = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, srcpath+"/.requirements")

from api import set_db_uri, fetch_rows

def handler(event, context):
    print(event)
    set_db_uri(os.environ['SQLALCHEMY_DATABASE_URI'])
    return fetch_rows(event['path'], json.loads(json.loads(event['body'])))
