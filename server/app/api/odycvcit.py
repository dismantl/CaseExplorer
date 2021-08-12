from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import ODYCVCIT
from ..service import DataService
from ..utils import get_eager_query, db_session

def api_factory(schemas):
    api = Namespace('ODYCVCIT', description='MDEC Civil Citations')

    odycvcit_schema = schemas['ODYCVCIT']
    odycvcit_schema_full = schemas['ODYCVCITFull']
    odycvcit_schema_results = schemas['ODYCVCITResults']

    @api.route('/odycvcit')
    class ODYCVCITResource(Resource):
        '''ODYCVCIT'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(odycvcit_schema_results)
        def post(self):
            '''Get a list of MDEC Civil Citations'''

            return DataService.fetch_rows_orm('odycvcit', request.parsed_obj)

    @api.route('/odycvcit/<string:case_number>')
    class ODYCVCITResourceCaseNumber(Resource):
        '''ODYCVCIT by case number'''

        @api.marshal_with(odycvcit_schema)
        def get(self, case_number):
            return ODYCVCIT.query.filter(ODYCVCIT.case_number == case_number).one()

    @api.route('/odycvcit/<string:case_number>/full')
    class ODYCVCITResourceCaseNumberFull(Resource):
        '''ODYCVCIT full case details by case number'''

        @api.marshal_with(odycvcit_schema_full)
        def get(self, case_number):
            return get_eager_query(ODYCVCIT).filter(ODYCVCIT.case_number == case_number).one()

    @api.route('/odycvcit/total')
    class ODYCVCITTotal(Resource):
        '''Total number of MDEC Civil Citations (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'odycvcit'::regclass").scalar()
            return int(results)

    return api
