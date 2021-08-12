from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..models import DSCR, DSCRRelatedPerson
from ..service import DataService
from ..utils import get_eager_query, db_session

def get_case_numbers_by_officer_sequence_number(sequence_number):
    related_persons = DSCRRelatedPerson.query.filter(DSCRRelatedPerson.officer_id == sequence_number).all()
    return list(dict.fromkeys([x.case_number for x in related_persons]))

def api_factory(schemas):
    api = Namespace('DSCR', description='District Court Criminal Cases')

    dscr_schema = schemas['DSCR']
    dscr_schema_full = schemas['DSCRFull']
    dscr_schema_results = schemas['DSCRResults']

    @api.route('/dscr')
    class DSCRResource(Resource):
        '''DSCR'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(dscr_schema_results)
        def post(self):
            '''Get a list of District Court Criminal Cases'''

            return DataService.fetch_rows_orm('dscr', request.parsed_obj)

    @api.route('/dscr/<string:case_number>')
    class DSCRResourceCaseNumber(Resource):
        '''DSCR by case number'''

        @api.marshal_with(dscr_schema)
        def get(self, case_number):
            return DSCR.query.filter(DSCR.case_number == case_number).one()

    @api.route('/dscr/<string:case_number>/full')
    class DSCRResourceCaseNumberFull(Resource):
        '''DSCR full case details by case number'''

        @api.marshal_with(dscr_schema_full)
        def get(self, case_number):
            return get_eager_query(DSCR).filter(DSCR.case_number == case_number).one()
    
    @api.route('/bpd/<string:sequence_number>')
    class BPD(Resource):
        '''Returns a list of case numbers involving the officer with the given Sequence Number'''

        def get(self, sequence_number):
            return get_case_numbers_by_officer_sequence_number(sequence_number)

    @api.route('/dscr/total')
    class DSCRTotal(Resource):
        '''Total number of District Court Criminal Cases (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute("SELECT reltuples FROM pg_class WHERE oid = 'dscr'::regclass").scalar()
            return int(results)

    return api
