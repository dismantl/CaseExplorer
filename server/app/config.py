import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


class BaseConfig(object):
    # DB SETUP
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True

    BPDWATCH_DATABASE_URI = os.getenv('BPDWATCH_DATABASE_URI')
    CASE_DETAILS_BUCKET = os.getenv('CASE_DETAILS_BUCKET')
    CASE_DETAILS_DIRECTORY = os.getenv('CASE_DETAILS_DIRECTORY')
    MINIO_URL = os.getenv('MINIO_URL')

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI_DEVELOPMENT')


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI_PRODUCTION')


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': ProductionConfig
}
