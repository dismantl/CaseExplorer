from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from app.api.interface import QueryParams
from app.models import DSCIVIL
from app.service import DataService
from app.utils import get_eager_query

def api_factory(schemas):
    api = Namespace('DSCIVIL', description='Baltimore City district court civil cases')

    dscivil_schema = schemas['DSCIVIL']
    dscivil_schema_full = schemas['DSCIVILFull']
    dscivil_schema_results = schemas['DSCIVILResults']

    @api.route('/dscivil')
    class DSCIVILResource(Resource):
        '''DSCIVIL'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(dscivil_schema_results)
        def post(self):
            '''Get a list of Baltimore City district court civil cases'''

            return DataService.fetch_rows_orm('dscivil', request.parsed_obj)

    @api.route('/dscivil/<string:case_number>')
    class DSCIVILResourceCaseNumber(Resource):
        '''DSCIVIL by case number'''

        @api.marshal_with(dscivil_schema)
        def get(self, case_number):
            return DSCIVIL.query.filter(DSCIVIL.case_number == case_number).one()

    @api.route('/dscivil/<string:case_number>/full')
    class DSCIVILResourceCaseNumberFull(Resource):
        '''DSCIVIL full case details by case number'''

        @api.marshal_with(dscivil_schema_full)
        def get(self, case_number):
            return get_eager_query(DSCIVIL).filter(DSCIVIL.case_number == case_number).one()

    return api
