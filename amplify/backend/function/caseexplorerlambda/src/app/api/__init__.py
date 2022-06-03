from .. import models
from ..service import DataService
from ..utils import get_case_model_list, get_root_model_list, snake_to_title
from ..officer import Officer
from .api_factory import api_factory
from .interface import QueryParams
from flask import Blueprint, current_app, request
from flask_restx import Api, Namespace, Resource
from flask_accepts import accepts
import json

class RESTAPI:
    def __init__(self, app=None, root=None):
        if app:
            return self.init_app(app, root)

    def init_app(self, app, root='api/v1'):
        from .schema_factory import schema_factory

        bp = Blueprint('api', __name__)
        self.bp = bp
        
        @bp.route(f'/{root}/metadata')
        def metadata():
            return json.dumps(DataService.fetch_metadata())
        
        @bp.route(f'/{root}/bpd/id/<int:id>')
        def seq_number_by_id(id):
            return json.dumps(DataService.fetch_seq_number_by_id(id))
        
        @bp.route(f'/{root}/bpd/label/<string:seq_number>')
        def label_by_seq_number(seq_number):
            return json.dumps(DataService.fetch_label_by_cop(seq_number))

        @bp.route(f'/{root}/html/<string:case_number>')
        def fetch_html(case_number):
            obj = current_app.config.case_details_bucket.Object(case_number).get()
            return json.dumps({'html': obj['Body'].read().decode('utf-8')})

        api = Api(bp, title='Case Explorer REST API', version='1.0')
        self.api = api
        self.api_schemas = schema_factory(api)

        all_models = get_case_model_list(models)
        root_models = {m.__tablename__: m for m in get_root_model_list(models)}
        for model in all_models:
            if model.__tablename__ == 'cases':
                desc = 'Cases'
            elif '_' in model.__tablename__:
                root_model = root_models[model.__tablename__.split('_')[0]]
                truncated_modelname = model.__tablename__.split('_',1)[1]
                desc = f'{root_model.__doc__}: {snake_to_title(truncated_modelname)}'
            else:
                desc = model.__doc__
            sub_api = api_factory(self.api_schemas, model, desc)
            self.cases_api = sub_api
            api.add_namespace(sub_api, path=f'/{root}')

        bail_namespace = Namespace('bail_stats')
        @bail_namespace.route('/bail_stats')
        class BailStatsResource(Resource):
            @accepts(schema=QueryParams, api=bail_namespace)
            def post(self):
                return DataService.fetch_bail_rows(request.parsed_obj)
        api.add_namespace(bail_namespace, path=f'/{root}')

        app.register_blueprint(bp)
