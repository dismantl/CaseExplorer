import sys
import os
import datetime
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

from .config import config

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from api import set_db_uri

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    db = SQLAlchemy(app)

    db.init_app(app)
    set_db_uri(config[config_name].SQLALCHEMY_DATABASE_URI)

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

    return app


app = create_app()
