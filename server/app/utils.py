import logging
from logging.handlers import RotatingFileHandler
from sqlalchemy.orm import selectinload, lazyload

LOAD_STRATEGY = selectinload

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
    class_list = [cls for name, cls in module.__dict__.items() if isinstance(cls, type) and hasattr(cls, '__table__')]
    class_list = [x for x in set(class_list)]  # Remove duplicates
    return class_list

def get_root_model_list(module):
    model_list = get_model_list(module)
    return list(filter(lambda model: hasattr(model, 'is_root') and model.is_root, model_list))

def get_root_model_table_names(module):
    root_model_list = get_root_model_list(module)
    return [cls.__tablename__ for cls in root_model_list]

def get_orm_class_by_name(table_name):
    from app import models
    model_map = {cls.__table__.name: cls for name, cls in models.__dict__.items() if isinstance(cls, type) and hasattr(cls, '__table__')}
    try:
        return model_map[table_name]
    except KeyError:
        raise Exception(f'Unknown database table {table_name}')

def get_model_name_by_table_name(table_name):
    from app import models
    model_list = get_model_list(models)
    for model in model_list:
        if table_name == model.__tablename__:
            return model.__name__
    raise Exception(f'Invalid table name {table_name}')

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
