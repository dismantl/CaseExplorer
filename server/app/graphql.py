import datetime
import decimal
from graphene import ObjectType, InputObjectType, List, Schema, Field, Int, Union, String, Boolean, Float
from graphene.types.datetime import Date, DateTime, Time

from ..utils import get_root_model_list, get_orm_class_by_name

class ValueColumn(InputObjectType):
    id = String()
    display_name = String()
    field = String(required=True)
    agg_func = String(required=True)

class SortColumn(InputObjectType):
    col_id = String(required=True)
    sort = String()

class BaseFilterModel(InputObjectType):
    field = String(required=True)
    filter_type = String(required=True)

class TextFilterModel(BaseFilterModel):
    type = String(required=True)
    filter = String()

class NumberFilterModel(BaseFilterModel):
    type = String(required=True)
    filter = Int()
    filter_to = Int()

class DateFilterModel(BaseFilterModel):
    type = String(required=True)
    date_from = String()
    date_to = String()

class FilterCondition(InputObjectType):
    text_filter = TextFilterModel()
    number_filter = NumberFilterModel()
    date_filter = DateFilterModel()

class ComboFilterModel(BaseFilterModel):
    operator = String(required=True)
    condition1 = FilterCondition()
    condition2 = FilterCondition()

class FilterModel(InputObjectType):
    text_filters = List(TextFilterModel)
    number_filters = List(NumberFilterModel)
    date_filters = List(DateFilterModel)
    combo_filters = List(ComboFilterModel)


class GraphQL:
    schema = None

    def __init__(self, app=None):
        if app:
            return self.init_app(app)

    def init_app(self, app):
        # from . import db
        from flask_sqlalchemy import SQLAlchemy
        db = SQLAlchemy()
        from ..models.common import TableBase
        TableBase.query = db.session.query_property()
        self.generate_schema()
        self.register_view(app)

    def register_view(self, app):
        from flask_graphql import GraphQLView
        app.add_url_rule(
            '/graphql',
            view_func=GraphQLView.as_view(
                'graphql',
                schema=self.schema,
                graphiql=True # for having the GraphiQL interface
            )
        )

    def get_schema(self):
        return self.generate_schema()

    def generate_schema(self):
        from .. import models
        if not self.schema:
            all_types = {}
            root_types = {}
            query_attrs = {}

            def register_type(graphql_type, model_name, table_name, resolver=None):
                root_types[table_name] = graphql_type
                all_types[table_name] = graphql_type
                ResultsResponse = type(
                    f'{model_name}ResultsResponse',
                    (ObjectType, ),
                    {
                        'rows': List(root_types[table_name]),
                        'last_row': Int()
                    }
                )
                query_attrs[table_name] = Field(
                    ResultsResponse,
                    start_row=Int(default_value=0),
                    end_row=Int(default_value=100),
                    row_group_cols=List(ValueColumn),
                    value_cols=List(ValueColumn),
                    pivot_cols=List(ValueColumn),
                    pivot_mode=Boolean(default_value=False),
                    group_keys=List(String),
                    sort_model=List(SortColumn),
                    filter_model=FilterModel()
                )
                query_attrs[f'resolve_{table_name}'] = resolver or resolver_factory(table_name)

            def type_factory(model, path):
                type_dict = {}

                for rel_name, relationship in model.__mapper__.relationships.items():
                    subtable_name = relationship.target.name
                    if subtable_name not in path and subtable_name != 'cases':
                        submodel = get_orm_class_by_name(subtable_name)
                        if submodel.__tablename__ not in all_types:
                            subtype = type_factory(submodel, path + (submodel.__tablename__, ))
                            all_types[submodel.__tablename__] = subtype
                        else:
                            subtype = all_types[submodel.__tablename__]
                        if hasattr(model, 'is_root') and model.is_root and subtable_name == 'cases':
                            type_dict[rel_name] = Field(subtype)  # one-to-one
                        else:
                            type_dict[rel_name] = List(subtype)  # one-to-many

                base_type_dict = generate_type_dict(model)
                type_dict.update(base_type_dict)
                return type(
                    model.__name__,
                    (ObjectType, ),
                    type_dict
                )

            root_models = get_root_model_list(models)
            for root_model in root_models:
                root_type = type_factory(root_model, (root_model.__tablename__, ))
                register_type(root_type, root_model.__name__, root_model.__tablename__)

            case_type_dict = generate_type_dict(models.Case)
            for type_name, root_type in root_types.items():
                case_type_dict[type_name] = Field(root_type)
            CaseType = type(
                models.Case.__name__,
                (ObjectType, ),
                case_type_dict
            )
            register_type(CaseType, models.Case.__name__, models.Case.__tablename__)

            Query = type('Query', (ObjectType, ), query_attrs)
            self.schema = Schema(query=Query, auto_camelcase=False)

        return self.schema


def generate_type_dict(model):
    type_dict = {}
    for column in model.__table__.columns:
        if hasattr(column, 'redacted') and column.redacted == True:
            continue
        if column.type.python_type == int:
            type_dict[column.name] = Int()
        elif column.type.python_type == str:
            type_dict[column.name] = String()
        elif column.type.python_type == datetime.datetime:
            type_dict[column.name] = DateTime()
        elif column.type.python_type == datetime.date:
            type_dict[column.name] = Date()
        elif column.type.python_type == datetime.time:
            type_dict[column.name] = Time()
        elif column.type.python_type == bool:
            type_dict[column.name] = Boolean()
        elif column.type.python_type == decimal.Decimal:
            type_dict[column.name] = Float()
        else:
            raise Exception(f'Unknown column type {column.type.python_type}')
    return type_dict


def resolver_factory(model):
    def resolve_row_data(parent, info, start_row, end_row, row_group_cols,
                         value_cols, pivot_cols, pivot_mode, group_keys,
                         filter_model, sort_model):
        from ..service import DataService
        results = DataService.fetch_rows_orm(
            model,
            {
                'startRow': start_row,
                'endRow': end_row,
                'rowGroupCols': row_group_cols,
                'valueCols': value_cols,
                'pivotCols': pivot_cols,
                'pivotMode': pivot_mode,
                'groupKeys': group_keys,
                'sortModel': sort_model,
                'filterModel': transform_filter_model(filter_model)
            }
        )
        return results

    return resolve_row_data


def transform_filter_model(filter_model):
    new_model = {}
    if 'text_filters' in filter_model:
        for filter in filter_model['text_filters']:
            if filter['filter_type'] != 'text':
                raise Exception('Bad text filter model')
            new_model[filter['field']] = {
                'filterType': filter['filter_type'],
                'type': filter['type']
            }
            if 'filter' in filter:
                new_model[filter['field']]['filter'] = filter['filter']
    if 'number_filters' in filter_model:
        for filter in filter_model['number_filters']:
            if filter['filter_type'] != 'number':
                raise Exception('Bad number filter model')
            new_model[filter['field']] = {
                'filterType': filter['filter_type'],
                'type': filter['type']
            }
            if 'filter' in filter:
                new_model[filter['field']]['filter'] = filter['filter']
            if 'filter_to' in filter:
                new_model[filter['field']]['filterTo'] = filter['filter_to']
    if 'date_filters' in filter_model:
        for filter in filter_model['date_filters']:
            if filter['filter_type'] != 'date':
                raise Exception('Bad date filter model')
            new_model[filter['field']] = {
                'filterType': filter['filter_type'],
                'type': filter['type']
            }
            if 'date_from' in filter:
                new_model[filter['field']]['dateFrom'] = filter['date_from']
            if 'date_to' in filter:
                new_model[filter['field']]['dateTo'] = filter['date_to']
    if 'combo_filters' in filter_model:
        for filter in filter_model['combo_filters']:
            new_model[filter['field']] = {
                'filterType': filter['filter_type'],
                'operator': filter['operator']
            }
            if filter['filter_type'] == 'text':
                new_model[filter['field']]['condition1'] = {
                    'filterType': filter['condition1']['text_filter']['filter_type'],
                    'type': filter['condition1']['text_filter']['type']
                }
                if 'filter' in filter['condition1']['text_filter']:
                    new_model[filter['field']]['condition1']['filter'] = filter['condition1']['text_filter']['filter']
                new_model['condition2'] = {
                    'filterType': filter['condition2']['text_filter']['filter_type'],
                    'type': filter['condition2']['text_filter']['type']
                }
                if 'filter' in filter['condition2']['text_filter']:
                    new_model[filter['field']]['condition2']['filter'] = filter['condition2']['text_filter']['filter']
            elif filter['filter_type'] == 'number':
                new_model[filter['field']]['condition1'] = {
                    'filterType': filter['condition1']['number_filter']['filter_type'],
                    'type': filter['condition1']['number_filter']['type']
                }
                if 'filter' in filter['condition1']['number_filter']:
                    new_model[filter['field']]['condition1']['filter'] = filter['condition1']['number_filter']['filter']
                if 'filter_to' in filter['condition1']['number_filter']:
                    new_model[filter['field']]['condition1']['filterTo'] = filter['condition1']['number_filter']['filter_to']
                new_model['condition2'] = {
                    'filterType': filter['condition2']['number_filter']['filter_type'],
                    'type': filter['condition2']['number_filter']['type']
                }
                if 'filter' in filter['condition2']['number_filter']:
                    new_model[filter['field']]['condition2']['filter'] = filter['condition2']['number_filter']['filter']
                if 'filter_to' in filter['condition2']['number_filter']:
                    new_model[filter['field']]['condition2']['filterTo'] = filter['condition2']['number_filter']['filter_to']
            elif filter['filter_type'] == 'date':
                new_model[filter['field']]['condition1'] = {
                    'filterType': filter['condition1']['date_filter']['filter_type'],
                    'type': filter['condition1']['date_filter']['type']
                }
                if 'date_from' in filter['condition1']['date_filter']:
                    new_model[filter['field']]['condition1']['dateFrom'] = filter['condition1']['date_filter']['date_from']
                if 'date_to' in filter['condition1']['date_filter']:
                    new_model[filter['field']]['condition1']['dateTo'] = filter['condition1']['date_filter']['date_to']
                new_model['condition2'] = {
                    'filterType': filter['condition2']['date_filter']['filter_type'],
                    'type': filter['condition2']['date_filter']['type']
                }
                if 'date_from' in filter['condition2']['date_filter']:
                    new_model[filter['field']]['condition2']['dateFrom'] = filter['condition2']['date_filter']['date_from']
                if 'date_to' in filter['condition2']['date_filter']:
                    new_model[filter['field']]['condition2']['dateTo'] = filter['condition2']['date_filter']['date_to']
            else:
                raise Exception('Bad combo filter model')

    return new_model
