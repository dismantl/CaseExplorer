from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import DSTRAF
from ..service import DataService
from ..utils import get_eager_query, db_session

def api_factory(schemas):
    api = Namespace('DSTRAF', description='District Court Traffic Cases')

    dstraf_schema = schemas['DSTRAF']
    dstraf_schema_full = schemas['DSTRAFFull']
    dstraf_schema_results = schemas['DSTRAFResults']

    @api.route('/dstraf')
    class DSTRAFResource(Resource):
        '''DSTRAF'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(dstraf_schema_results)
        def post(self):
            '''Get a list of District Court Traffic Cases'''

            return DataService.fetch_rows_orm('dstraf', request.parsed_obj)

    @api.route('/dstraf/<string:case_number>')
    class DSTRAFResourceCaseNumber(Resource):
        '''DSTRAF by case number'''

        @api.marshal_with(dstraf_schema)
        def get(self, case_number):
            return DSTRAF.query.filter(DSTRAF.case_number == case_number).one()

    @api.route('/dstraf/<string:case_number>/full')
    class DSTRAFResourceCaseNumberFull(Resource):
        '''DSTRAF full case details by case number'''

        @api.marshal_with(dstraf_schema_full)
        def get(self, case_number):
            return get_eager_query(DSTRAF).filter(DSTRAF.case_number == case_number).one()

    @api.route('/dstraf/total')
    class DSTRAFTotal(Resource):
        '''Total number of District Court Traffic Cases (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'dstraf'::regclass").scalar()
            return int(results)

    return api
