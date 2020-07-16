import datetime
import decimal
from flask_restx import fields

from app import models
from app.utils import get_root_model_list, get_orm_class_by_name

def generate_schema_dict(model):
    model_dict = {}
    for column in model.__table__.columns:
        if hasattr(model, 'private_fields') and column.name in model.private_fields:
            continue
        if column.type.python_type == int:
            model_dict[column.name] = fields.Integer
        elif column.type.python_type == str:
            model_dict[column.name] = fields.String
        elif column.type.python_type == datetime.datetime:
            model_dict[column.name] = fields.DateTime
        elif column.type.python_type == datetime.date:
            model_dict[column.name] = fields.Date
        elif column.type.python_type == datetime.time:
            model_dict[column.name] = fields.String
        elif column.type.python_type == bool:
            model_dict[column.name] = fields.Boolean
        elif column.type.python_type == decimal.Decimal:
            model_dict[column.name] = fields.Fixed(decimals=2)
        else:
            raise Exception(f'Unknown column type {column.type.python_type}')
    return model_dict

def generate_full_schema(api, model, path, schema_name=None):
    model_dict = {}

    # recursively build nested subtable schemas
    for rel_name, relationship in model.__mapper__.relationships.items():
        subtable_name = relationship.target.name
        if subtable_name not in path:
            submodel = get_orm_class_by_name(subtable_name)
            schema = generate_full_schema(api, submodel, path + (submodel.__tablename__, ))
            if hasattr(model, 'is_root') and model.is_root and subtable_name == 'cases':
                model_dict[rel_name] = fields.Nested(schema)  # one-to-one
            else:
                model_dict[rel_name] = fields.List(fields.Nested(schema))  # one-to-many

    base_model_dict = generate_schema_dict(model)
    model_dict.update(base_model_dict)
    schema = api.model(schema_name or model.__name__, model_dict)
    return schema

def schema_factory(api):
    root_models = get_root_model_list(models)

    schemas = {}
    for root_model in root_models:
        root_schema_dict = generate_schema_dict(root_model)
        schemas[root_model.__name__] = api.model(root_model.__name__, root_schema_dict)
        root_full_schema = generate_full_schema(api, root_model, (root_model.__tablename__, ), f'{root_model.__name__}Full')
        schemas[f'{root_model.__name__}Full'] = root_full_schema
    schemas['Case'] = api.model('Case', generate_schema_dict(models.Case))

    results_schemas = {}
    for schema_name, schema in schemas.items():
        if schema_name[-4:] != 'Full':
            results_schemas[f'{schema_name}Results'] = api.model(
                f'{schema_name}Results',
                {
                    'rows': fields.List(fields.Nested(schema)),
                    'lastRow': fields.Integer
                }
            )
    schemas.update(results_schemas)

    return schemas
