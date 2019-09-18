from flask import request
from flask_accepts import accepts
from flask_restplus import Namespace, Resource

from app.api.interface import QueryParams
from app.models import Case
from app.service import DataService

def api_factory(schemas):
    api = Namespace('Cases', description='Information common to all MD court cases')

    case_results_schema = schemas['CaseResults']
    case_schema = schemas['Case']

    @api.route('/cases')
    class CaseResource(Resource):
        '''Cases'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(case_results_schema)
        def post(self):
            '''Get a list of cases'''

            return DataService.fetch_rows_orm('cases', request.parsed_obj)

    @api.route('/cases/<string:case_number>')
    class CaseResourceCaseNumber(Resource):
        '''Case by case number'''

        @api.marshal_with(case_schema)
        def get(self, case_number):
            return Case.query.get(case_number)

    return api
