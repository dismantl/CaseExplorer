import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api
from sqlalchemy import create_engine

from . import commands
from .config import config
from .utils import configure_logging
from .graphql import GraphQL
from .api import RESTAPI
from .service import DataService

db = SQLAlchemy()
graphql_service = GraphQL()
data_service = DataService()
rest_api = RESTAPI()

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    app.config.db_engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    app.config.bpdwatch_db_engine = create_engine(app.config['BPDWATCH_DATABASE_URI'])
    configure_logging(app)

    # Module initialization
    db.init_app(app)
    graphql_service.init_app(app)  # Must be after db initialization
    rest_api.init_app(app)
    data_service.init_app(app)

    # Commands
    app.cli.add_command(commands.print_graphql_schema)
    app.cli.add_command(commands.print_swagger_spec)
    app.cli.add_command(commands.export_column_metadata)
    app.cli.add_command(commands.import_column_metadata)
    app.cli.add_command(commands.update_metadata)

    return app


app = create_app(os.getenv('FLASK_ENV') or 'default')
