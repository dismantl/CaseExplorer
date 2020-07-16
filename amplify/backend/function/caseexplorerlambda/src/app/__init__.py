import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api

from app.config import config
from app.utils import configure_logging
from app.graphql import GraphQL
from app.commands import print_schema, print_swagger_spec
from app.api import RESTAPI
from app.service import DataService

db = SQLAlchemy()
graphql_service = GraphQL()
data_service = DataService()
rest_api = RESTAPI()

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    configure_logging(app)

    # Module initialization
    db.init_app(app)
    graphql_service.init_app(app)  # Must be after db initialization
    rest_api.init_app(app)
    data_service.init_app(app)

    # Commands
    app.cli.add_command(print_schema)
    app.cli.add_command(print_swagger_spec)

    return app


app = create_app(os.getenv('FLASK_ENV') or 'default')
