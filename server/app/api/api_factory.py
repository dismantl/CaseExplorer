from flask import request
from flask_accepts import accepts
from flask_restx import Namespace, Resource

from .interface import QueryParams
from ..service import DataService
from ..utils import get_eager_query, db_session, get_model_name_by_table_name, get_orm_class_by_name

def api_factory(schemas, model, description=None):
    table_name = model.__tablename__
    model_name = model.__name__
    api = Namespace(table_name.upper(), description=description)

    model_name = get_model_name_by_table_name(table_name)
    model = get_orm_class_by_name(table_name)
    schema = schemas[model_name]
    schema_results = schemas[f'{model_name}Results']

    @api.route(f'/{table_name}')
    class APIResource(Resource):
        f'''{table_name.upper()}'''

        @accepts(schema=QueryParams, api=api)
        @api.marshal_with(schema_results)
        def post(self):
            f'''Get a list of {description}'''

            return DataService.fetch_rows_orm(table_name, request.parsed_obj)
        
    @api.route(f'/{table_name}/filtered/total')
    class APIResourceFiltered(Resource):
        f'''Total number of {table_name.upper()} cases based on search criteria'''
        @accepts(schema=QueryParams, api=api)
        def post(self):
            f'''Get total number of {table_name.upper()} cases based on search criteria'''

            return DataService.fetch_filtered_total(table_name, request.parsed_obj)

    @api.route(f'/{table_name}/<string:case_number>')
    class APIResourceCaseNumber(Resource):
        f'''{table_name.upper()} by case number'''

        @api.marshal_with(schema)
        def get(self, case_number):
            return model.query.filter(model.case_number == case_number).one()

    if table_name != 'cases' and hasattr(model,'is_root') and model.is_root == True:
        schema_full = schemas[f'{model_name}Full']
        @api.route(f'/{table_name}/<string:case_number>/full')
        class APIResourceCaseNumberFull(Resource):
            f'''{table_name.upper()} full case details by case number'''

            @api.marshal_with(schema_full)
            def get(self, case_number):
                return get_eager_query(model).filter(model.case_number == case_number).one()

    if table_name == 'dscr':
        @api.route('/bpd/seq/<string:seq_number>')
        class CasesByCop(Resource):
            '''DSCR cases by BPD officer sequence number'''

            @accepts(schema=QueryParams, api=api)
            @api.marshal_with(schema_results)
            def post(self, seq_number):
                '''Get a list of DSCR cases by BPD officer sequence number'''

                return DataService.fetch_cases_by_cop(seq_number, request.parsed_obj)

    @api.route(f'/{table_name}/total')
    class APITotal(Resource):
        f'''Total number of {description} (estimate)'''

        def get(self):
            with db_session() as db:
                results = db.execute(f"SELECT reltuples FROM pg_class WHERE oid = '{table_name}'::regclass").scalar()
            return int(results)

    return api
