import sys
import os
import datetime
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_graphql import GraphQLView
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from .config import config
from .models.common import TableBase
from .schema import schema

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    db = SQLAlchemy(app)

    db.init_app(app)

    from .main import main as main_blueprint  # noqa
    app.register_blueprint(main_blueprint)

    max_log_size = 10 * 1024 * 1024  # start new log file after 10 MB
    num_logs_to_keep = 5
    file_handler = RotatingFileHandler('/tmp/caseexplorer.log', 'a',
                                       max_log_size, num_logs_to_keep)

    file_handler.setFormatter(
        logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
    )

    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('CaseExplorer startup')

    db_engine = create_engine(config[config_name].SQLALCHEMY_DATABASE_URI)
    db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=db_engine))
    TableBase.query = db_session.query_property()
    app.config['db_session'] = db_session

    return app


app = create_app()

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True # for having the GraphiQL interface
    )
)
