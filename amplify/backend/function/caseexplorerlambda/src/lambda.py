import re
import os
import sys
import json
import logging

srcpath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(srcpath+"/lib")

from sqlalchemy.orm.exc import NoResultFound
from flask_restx import marshal
from app import app, rest_api
from app.service import DataService
from app.graphql import transform_filter_model
from app.utils import get_model_name_by_table_name, get_eager_query, get_orm_class_by_name, TableNotFound


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
            bpd_match = re.fullmatch(r'/api/v1/bpd/seq/(?P<sequence_number>\w\d\d\d)', path)
            bpd_total_match = re.fullmatch(r'/api/v1/bpd/seq/(?P<sequence_number>\w\d\d\d)/total', path)
            bpd_id_match = re.fullmatch(r'/api/v1/bpd/id/(?P<id>\d+)', path)
            bpd_label_match = re.fullmatch(r'/api/v1/bpd/label/(?P<sequence_number>\w\d\d\d)', path)
            case_match = re.fullmatch(r'/api/v1/(?P<table_name>\w+)(/(?P<case_number>\w+))?(?P<full>/full)?', path)
            html_match = re.fullmatch(r'/api/v1/html/(?P<case_number>\w+)', path)
            total_match = re.fullmatch(r'/api/v1/(?P<table_name>\w+)/total', path)
            total_filtered_match = re.fullmatch(r'/api/v1/(?P<table_name>\w+)/filtered/total', path)
            if path == '/api/v1/metadata':
                return gen_response(200, json.dumps(DataService.fetch_metadata()))
            elif bpd_match:
                seq_no = bpd_match.group('sequence_number')
                req = json.loads(event['body'])
                results = DataService.fetch_cases_by_cop(seq_no, req)
                results['rows'] = [marshal(row, rest_api.api_schemas['Case']) for row in results['rows']]
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
            elif path == '/api/v1/cases/count':  # only used by Case Harvester README badge
                total = DataService.fetch_total('cases')
                return gen_response(200, json.dumps({'count': total}))
            elif html_match:
                case_number = html_match.group('case_number')
                obj = app.config.case_details_bucket.Object(case_number).get()
                return gen_response(200, json.dumps({'html': obj['Body'].read().decode('utf-8')}))
            elif case_match:
                table_name = case_match.group('table_name')
                case_number = case_match.group('case_number')
                full = case_match.group('full')

                if event.get('body'):  # POST
                    try:
                        model_name = get_model_name_by_table_name(table_name)
                    except TableNotFound:
                        return gen_404(path)
                    req = json.loads(event['body'])
                    results = DataService.fetch_rows_orm(table_name, req)
                    results['rows'] = [marshal(row, rest_api.api_schemas[model_name]) for row in results['rows']]
                    return gen_response(200, json.dumps(results))
                else:  # GET
                    if case_number:
                        try:
                            model = get_orm_class_by_name(table_name)
                        except TableNotFound:
                            return gen_404(path)
                        if full:
                            try:
                                requested_obj = get_eager_query(model).filter(model.case_number == case_number).one()
                            except NoResultFound:
                                return gen_404(path)
                            result = marshal(requested_obj, rest_api.api_schemas[f'{model.__name__}Full'])
                        else:
                            try:
                                requested_obj = model.query.filter(model.case_number == case_number).one()
                            except NoResultFound:
                                return gen_404(path)
                            result = marshal(requested_obj, rest_api.api_schemas[model.__name__])
                        return gen_response(200, json.dumps(result))

            return gen_404(path)