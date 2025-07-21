import os
import boto3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api
from sqlalchemy import create_engine

from . import commands
from .config import config
from .utils import configure_logging
from .graphqlapi import GraphQL
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
    if app.config['BPDWATCH_DATABASE_URI']:
        app.config.bpdwatch_db_engine = create_engine(app.config['BPDWATCH_DATABASE_URI'])
    app.config.case_details_bucket = None
    if app.config['CASE_DETAILS_BUCKET']:
        if app.config['MINIO_URL']:
            s3 = boto3.resource('s3',
                endpoint_url=app.config['MINIO_URL'],
                aws_access_key_id=os.environ.get('MINIO_ACCESS_KEY'),
                aws_secret_access_key=os.environ.get('MINIO_SECRET_KEY'),
                aws_session_token=None,
                config=boto3.session.Config(signature_version='s3v4'),
                verify=False
            )
        elif app.config['CASE_DETAILS_BUCKET']:
            s3 = boto3.resource('s3')
        app.config.case_details_bucket = s3.Bucket(app.config['CASE_DETAILS_BUCKET'])
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
    app.cli.add_command(commands.cache_cops)

    return app


app = create_app('default')
