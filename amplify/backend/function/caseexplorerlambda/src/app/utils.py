from .models import DSCRRelatedPerson
import logging
from logging.handlers import RotatingFileHandler
from sqlalchemy.orm import relation, selectinload, lazyload, sessionmaker
from contextlib import contextmanager
from flask import current_app

LOAD_STRATEGY = selectinload

class TableNotFound(Exception):
    pass

def configure_logging(app):
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

def get_model_list(module):
    model_list = [cls for name, cls in module.__dict__.items() if isinstance(cls, type) and hasattr(cls, '__table__')]
    model_list = [x for x in set(model_list)]  # Remove duplicates
    return model_list

def get_root_model_list(module):
    model_list = get_model_list(module)
    return list(filter(lambda model: hasattr(model, 'is_root') and model.is_root, model_list))

def get_case_model_list(module):
    model_list = [module.Case]
    for root_model in get_root_model_list(module):
        model_list.append(root_model)
        for rel_name, relationship in root_model.__mapper__.relationships.items():
            model = get_orm_class_by_name(relationship.target.name)
            if model not in model_list:
                model_list.append(model)
    return model_list

def get_root_model_table_names(module):
    root_model_list = get_root_model_list(module)
    return [cls.__tablename__ for cls in root_model_list]

def get_orm_class_by_name(table_name):
    from . import models
    model_map = {cls.__table__.name: cls for name, cls in models.__dict__.items() if isinstance(cls, type) and hasattr(cls, '__table__')}
    try:
        return model_map[table_name]
    except KeyError:
        raise TableNotFound(f'Unknown database table {table_name}')

def get_model_name_by_table_name(table_name):
    from . import models
    model_list = get_model_list(models)
    for model in model_list:
        if table_name == model.__tablename__:
            return model.__name__
    raise TableNotFound(f'Invalid table name {table_name}')

def get_eager_query(model):
    query = model.query
    visited_models = [model]

    def apply_load_strategy(query, parent_model, path=()):
        for rel_name, relationship in parent_model.__mapper__.relationships.items():
            table = relationship.target
            child_model = get_orm_class_by_name(table.name)
            if child_model in visited_models:
                continue
            visited_models.append(child_model)
            query = query.options(LOAD_STRATEGY(*(path + (rel_name, ))))
            query = apply_load_strategy(query, child_model, path + (rel_name, ))
        return query

    return apply_load_strategy(query, model)

@contextmanager
def db_session():
    """Provide a transactional scope around a series of operations."""
    db_factory = sessionmaker(bind = current_app.config.db_engine)
    db = db_factory()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()

def get_case_numbers_by_officer_sequence_number(sequence_number):
    related_persons = DSCRRelatedPerson.query.filter(DSCRRelatedPerson.officer_id == sequence_number).all()
    return list(dict.fromkeys([x.case_number for x in related_persons]))