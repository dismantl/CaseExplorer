from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from app.api.interface import QueryParams
from app.models import ODYTRAF
from app.service import DataService
from app.utils import get_eager_query

def api_factory(schemas):
    api = Namespace('ODYTRAF', description='MD traffic cases')

    odytraf_schema = schemas['ODYTRAF']
    odytraf_schema_full = schemas['ODYTRAFFull']
    odytraf_schema_results = schemas['ODYTRAFResults']

    @api.route('/odytraf')
    class ODYTRAFResource(Resource):
        '''ODYTRAF'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(odytraf_schema_results)
        def post(self):
            '''Get a list of MD traffic cases'''

            return DataService.fetch_rows_orm('odytraf', request.parsed_obj)

    @api.route('/odytraf/<string:case_number>')
    class ODYTRAFResourceCaseNumber(Resource):
        '''ODYTRAF by case number'''

        @api.marshal_with(odytraf_schema)
        def get(self, case_number):
            return ODYTRAF.query.filter(ODYTRAF.case_number == case_number).one()

    @api.route('/odytraf/<string:case_number>/full')
    class ODYTRAFResourceCaseNumberFull(Resource):
        '''ODYTRAF full case details by case number'''

        @api.marshal_with(odytraf_schema_full)
        def get(self, case_number):
            return get_eager_query(ODYTRAF).filter(ODYTRAF.case_number == case_number).one()

    return api
