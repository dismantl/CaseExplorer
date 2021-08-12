from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import DSCIVIL
from ..service import DataService
from ..utils import get_eager_query, db_session

def api_factory(schemas):
    api = Namespace('DSCIVIL', description='District Court Civil Cases')

    dscivil_schema = schemas['DSCIVIL']
    dscivil_schema_full = schemas['DSCIVILFull']
    dscivil_schema_results = schemas['DSCIVILResults']

    @api.route('/dscivil')
    class DSCIVILResource(Resource):
        '''DSCIVIL'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(dscivil_schema_results)
        def post(self):
            '''Get a list of District Court Civil Cases'''

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

    @api.route('/dscivil/total')
    class DSCIVILTotal(Resource):
        '''Total number of District Court Civil Cases (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'dscivil'::regclass").scalar()
            return int(results)

    return api
