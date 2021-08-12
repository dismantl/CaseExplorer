from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import DSK8
from ..service import DataService
from ..utils import get_eager_query, db_session

def api_factory(schemas):
    api = Namespace('DSK8', description='Baltimore City Criminal Cases')

    dsk8_schema = schemas['DSK8']
    dsk8_schema_full = schemas['DSK8Full']
    dsk8_schema_results = schemas['DSK8Results']

    @api.route('/dsk8')
    class DSK8Resource(Resource):
        '''DSK8'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(dsk8_schema_results)
        def post(self):
            '''Get a list of Baltimore City Criminal Cases'''

            return DataService.fetch_rows_orm('dsk8', request.parsed_obj)

    @api.route('/dsk8/<string:case_number>')
    class DSK8ResourceCaseNumber(Resource):
        '''DSK8 by case number'''

        @api.marshal_with(dsk8_schema)
        def get(self, case_number):
            return DSK8.query.filter(DSK8.case_number == case_number).one()

    @api.route('/dsk8/<string:case_number>/full')
    class DSK8ResourceCaseNumberFull(Resource):
        '''DSK8 full case details by case number'''

        @api.marshal_with(dsk8_schema_full)
        def get(self, case_number):
            return get_eager_query(DSK8).filter(DSK8.case_number == case_number).one()

    @api.route('/dsk8/total')
    class DSK8Total(Resource):
        '''Total number of Baltimore City Criminal Cases (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'dsk8'::regclass").scalar()
            return int(results)

    return api
