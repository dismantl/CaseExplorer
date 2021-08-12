from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import ODYCRIM
from ..service import DataService
from ..utils import get_eager_query, db_session

def api_factory(schemas):
    api = Namespace('ODYCRIM', description='MDEC Criminal Cases')

    odycrim_schema = schemas['ODYCRIM']
    odycrim_schema_full = schemas['ODYCRIMFull']
    odycrim_schema_results = schemas['ODYCRIMResults']

    @api.route('/odycrim')
    class ODYCRIMResource(Resource):
        '''ODYCRIM'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(odycrim_schema_results, as_list=True)
        def post(self):
            '''Get a list of MDEC Criminal Cases'''

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

    @api.route('/odycrim/total')
    class ODYCRIMTotal(Resource):
        '''Total number of MDEC Criminal Cases (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'odycrim'::regclass").scalar()
            return int(results)

    return api
