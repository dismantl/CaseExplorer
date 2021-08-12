from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import ODYCIVIL
from ..service import DataService
from ..utils import get_eager_query, db_session

def api_factory(schemas):
    api = Namespace('ODYCIVIL', description='MDEC Civil Cases')

    odycivil_schema = schemas['ODYCIVIL']
    odycivil_schema_full = schemas['ODYCIVILFull']
    odycivil_schema_results = schemas['ODYCIVILResults']

    @api.route('/odycivil')
    class ODYCIVILResource(Resource):
        '''ODYCIVIL'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(odycivil_schema_results)
        def post(self):
            '''Get a list of MDEC Civil Cases'''

            return DataService.fetch_rows_orm('odycivil', request.parsed_obj)

    @api.route('/odycivil/<string:case_number>')
    class ODYCIVILResourceCaseNumber(Resource):
        '''ODYCIVIL by case number'''

        @api.marshal_with(odycivil_schema)
        def get(self, case_number):
            return ODYCIVIL.query.filter(ODYCIVIL.case_number == case_number).one()

    @api.route('/odycivil/<string:case_number>/full')
    class ODYCIVILResourceCaseNumberFull(Resource):
        '''ODYCIVIL full case details by case number'''

        @api.marshal_with(odycivil_schema_full)
        def get(self, case_number):
            return get_eager_query(ODYCIVIL).filter(ODYCIVIL.case_number == case_number).one()

    @api.route('/odycivil/total')
    class ODYCIVILTotal(Resource):
        '''Total number of MDEC Civil Cases (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'odycivil'::regclass").scalar()
            return int(results)

    return api
