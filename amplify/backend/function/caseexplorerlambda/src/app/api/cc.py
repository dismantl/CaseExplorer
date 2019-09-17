from flask import request
from flask_accepts import accepts
from flask_restplus import Namespace, Resource

from app.api.interface import QueryParams
from app.models import CC
from app.service import DataService
from app.utils import get_eager_query

def api_factory(schemas):
    api = Namespace('CC', description='Baltimore City circuit court civil cases')

    cc_schema = schemas['CC']
    cc_schema_full = schemas['CCFull']
    cc_results_schema = schemas['CCResults']

    @api.route('/cc')
    class CCResource(Resource):
        '''CC'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(cc_results_schema)
        def post(self):
            '''Get a list of Baltimore City circuit court civil cases'''

            return DataService.fetch_rows_orm('cc', request.parsed_obj)

    @api.route('/cc/<string:case_number>')
    class CCResourceCaseNumber(Resource):
        '''CC by case number'''

        @accepts(dict(name='case_number', type=str), api=api)
        @api.marshal_with(cc_schema)
        def get(self, case_number):
            return CC.query.filter(CC.case_number == case_number).one()

    @api.route('/cc/<string:case_number>/full')
    class CCResourceCaseNumberFull(Resource):
        '''CC full case details by case number'''

        @accepts(dict(name='case_number', type=str), api=api)
        @api.marshal_with(cc_schema_full)
        def get(self, case_number):
            return get_eager_query(CC).filter(CC.case_number == case_number).one()

    return api
