from ..service import DataService
from flask import Blueprint
from flask_restx import Api, Resource
import json

class RESTAPI:
    def __init__(self, app=None, root=None):
        if app:
            return self.init_app(app, root)

    def init_app(self, app, root='api'):
        from .schema_factory import schema_factory

        bp = Blueprint('api', __name__)
        self.bp = bp
        
        @bp.route(f'/{root}/metadata')
        def metadata():
            return json.dumps(DataService.fetch_column_metadata())

        api = Api(bp, title='CaseExplorer REST API', version='0.1.0')
        self.api = api
        self.api_schemas = schema_factory(api)

        from .cases import api_factory
        sub_api = api_factory(self.api_schemas)
        self.cases_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .cc import api_factory
        sub_api = api_factory(self.api_schemas)
        self.cc_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .dscivil import api_factory
        sub_api = api_factory(self.api_schemas)
        self.dscivil_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .dscr import api_factory
        sub_api = api_factory(self.api_schemas)
        self.dscr_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .dsk8 import api_factory
        sub_api = api_factory(self.api_schemas)
        self.dsk8_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .dstraf import api_factory
        sub_api = api_factory(self.api_schemas)
        self.dstraf_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .odycrim import api_factory
        sub_api = api_factory(self.api_schemas)
        self.odycrim_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .odytraf import api_factory
        sub_api = api_factory(self.api_schemas)
        self.odytraf_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .odycvcit import api_factory
        sub_api = api_factory(self.api_schemas)
        self.odycvcit_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        from .odycivil import api_factory
        sub_api = api_factory(self.api_schemas)
        self.odycivil_api = sub_api
        api.add_namespace(sub_api, path=f'/{root}')

        app.register_blueprint(bp)
