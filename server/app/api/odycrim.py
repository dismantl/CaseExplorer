from flask import request
from flask_accepts import accepts
from flask_restplus import Namespace, Resource

from app.api.interface import QueryParams
from app.models import ODYCRIM
from app.service import DataService
from app.utils import get_eager_query

def api_factory(schemas):
    api = Namespace('ODYCRIM', description='MD criminal cases')

    odycrim_schema = schemas['ODYCRIM']
    odycrim_schema_full = schemas['ODYCRIMFull']
    odycrim_schema_results = schemas['ODYCRIMResults']

    @api.route('/odycrim')
    class ODYCRIMResource(Resource):
        '''ODYCRIM'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(odycrim_schema_results, as_list=True)
        def post(self):
            '''Get a list of MD criminal cases'''

            return DataService.fetch_rows_orm('odycrim', request.parsed_obj)

    @api.route('/odycrim/<string:case_number>')
    class ODYCRIMResourceCaseNumber(Resource):
        '''ODYCRIM by case number'''

        @api.marshal_with(odycrim_schema)
        def get(self, case_number):
            return ODYCRIM.query.filter(ODYCRIM.case_number == case_number).one()

    @api.route('/odycrim/<string:case_number>/full')
    class ODYCRIMResourceCaseNumberFull(Resource):
        '''ODYCRIM full case details by case number'''

        @api.marshal_with(odycrim_schema_full)
        def get(self, case_number):
            return get_eager_query(ODYCRIM).filter(ODYCRIM.case_number == case_number).one()

    return api
