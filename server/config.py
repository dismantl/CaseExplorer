import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI_PRODUCTION')
    BPDWATCH_DATABASE_URI = os.environ.get('BPDWATCH_DATABASE_URI')


config = BaseConfig
