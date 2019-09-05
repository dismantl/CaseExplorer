import json
from graphene import ObjectType, InputObjectType, List, Schema, Field, Int, Union, String
from graphene.types import Scalar
from graphene.types.scalars import MIN_INT, MAX_INT
from graphql.language import ast
from graphql.language.ast import BooleanValue, StringValue, IntValue, ListValue, ObjectValue, FloatValue
from graphene_sqlalchemy import SQLAlchemyObjectType

from app import models
from .api import fetch_rows_orm, defendant_redacted_fields


class Case(SQLAlchemyObjectType):
    class Meta:
        model = models.Case


class DSCR(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCR

class DSCRCharge(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCRCharge

class DSCRDefendant(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCRDefendant
        exclude_fields = tuple(defendant_redacted_fields)

class DSCRRelatedPerson(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCRRelatedPerson

class DSCREvent(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCREvent

class DSCRTrial(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCRTrial

class DSCRBailEvent(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCRBailEvent


class DSK8(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8

class DSK8Charge(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8Charge

class DSK8BailAndBond(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8BailAndBond

class DSK8Bondsman(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8Bondsman

class DSK8Defendant(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8Defendant
        exclude_fields = tuple(defendant_redacted_fields)

class DSK8RelatedPerson(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8RelatedPerson

class DSK8Event(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8Event

class DSK8Trial(SQLAlchemyObjectType):
    class Meta:
        model = models.DSK8Trial


class CC(SQLAlchemyObjectType):
    class Meta:
        model = models.CC

class CCDistrictCaseNumber(SQLAlchemyObjectType):
    class Meta:
        model = models.CCDistrictCaseNumber

class CCPlaintiff(SQLAlchemyObjectType):
    class Meta:
        model = models.CCPlaintiff

class CCDefendant(SQLAlchemyObjectType):
    class Meta:
        model = models.CCDefendant
        exclude_fields = ('name', )

class CCRelatedPerson(SQLAlchemyObjectType):
    class Meta:
        model = models.CCRelatedPerson

class CCPartyAlias(SQLAlchemyObjectType):
    class Meta:
        model = models.CCPartyAlias

class CCPartyAddress(SQLAlchemyObjectType):
    class Meta:
        model = models.CCPartyAddress

class CCAttorney(SQLAlchemyObjectType):
    class Meta:
        model = models.CCAttorney

class CCCourtSchedule(SQLAlchemyObjectType):
    class Meta:
        model = models.CCCourtSchedule

class CCDocument(SQLAlchemyObjectType):
    class Meta:
        model = models.CCDocument

class CCJudgment(SQLAlchemyObjectType):
    class Meta:
        model = models.CCJudgment

class CCJudgmentModification(SQLAlchemyObjectType):
    class Meta:
        model = models.CCJudgmentModification

class CCJudgmentAgainst(SQLAlchemyObjectType):
    class Meta:
        model = models.CCJudgmentAgainst

class CCJudgmentInFavor(SQLAlchemyObjectType):
    class Meta:
        model = models.CCJudgmentInFavor

class CCSupportOrder(SQLAlchemyObjectType):
    class Meta:
        model = models.CCSupportOrder


class DSCIVIL(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVIL

class DSCIVILComplaint(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVILComplaint
        exclude_fields = ('defendant', )

class DSCIVILHearing(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVILHearing

class DSCIVILJudgment(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVILJudgment

class DSCIVILRelatedPerson(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVILRelatedPerson

class DSCIVILEvent(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVILEvent

class DSCIVILTrial(SQLAlchemyObjectType):
    class Meta:
        model = models.DSCIVILTrial


class ODYCRIM(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIM

class ODYCRIMReferenceNumber(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMReferenceNumber

class ODYCRIMDefendant(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMDefendant
        exclude_fields = tuple(defendant_redacted_fields)

class ODYCRIMInvolvedParty(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMInvolvedParty

class ODYCRIMAttorney(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMAttorney

class ODYCRIMCourtSchedule(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMCourtSchedule

class ODYCRIMCharge(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMCharge

class ODYCRIMProbation(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMProbation

class ODYCRIMRestitution(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMRestitution

class ODYCRIMWarrant(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMWarrant

class ODYCRIMBailBond(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMBailBond

class ODYCRIMBondSetting(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMBondSetting

class ODYCRIMDocument(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMDocument

class ODYCRIMService(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYCRIMService


class ODYTRAF(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAF

class ODYTRAFReferenceNumber(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFReferenceNumber

class ODYTRAFDefendant(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFDefendant
        exclude_fields = tuple(defendant_redacted_fields)

class ODYTRAFInvolvedParty(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFInvolvedParty

class ODYTRAFAttorney(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFAttorney

class ODYTRAFCourtSchedule(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFCourtSchedule

class ODYTRAFCharge(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFCharge

class ODYTRAFWarrant(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFWarrant

class ODYTRAFBailBond(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFBailBond

class ODYTRAFBondSetting(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFBondSetting

class ODYTRAFDocument(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFDocument

class ODYTRAFService(SQLAlchemyObjectType):
    class Meta:
        model = models.ODYTRAFService


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


def transform_filter_model(filter_model):
    new_model = {}
    if filter_model.text_filters:
        for filter in filter_model.text_filters:
            if filter.filter_type != 'text':
                raise Exception('Bad text filter model')
            new_model[filter.field] = {
                'filterType': filter.filter_type,
                'type': filter.type
            }
            if hasattr(filter, 'filter'):
                new_model[filter.field]['filter'] = filter.filter
    if filter_model.number_filters:
        for filter in filter_model.number_filters:
            if filter.filter_type != 'number':
                raise Exception('Bad number filter model')
            new_model[filter.field] = {
                'filterType': filter.filter_type,
                'type': filter.type
            }
            if hasattr(filter, 'filter'):
                new_model[filter.field]['filter'] = filter.filter
            if hasattr(filter, 'filter_to'):
                new_model[filter.field]['filterTo'] = filter.filter_to
    if filter_model.date_filters:
        for filter in filter_model.date_filters:
            if filter.filter_type != 'date':
                raise Exception('Bad date filter model')
            new_model[filter.field] = {
                'filterType': filter.filter_type,
                'type': filter.type
            }
            if hasattr(filter, 'date_from'):
                new_model[filter.field]['dateFrom'] = filter.date_from
            if hasattr(filter, 'date_to'):
                new_model[filter.field]['dateTo'] = filter.date_to
    if filter_model.combo_filters:
        for filter in filter_model.combo_filters:
            new_model[filter.field] = {
                'filterType': filter.filter_type,
                'operator': filter.operator
            }
            if filter.filter_type == 'text':
                new_model[filter.field]['condition1'] = {
                    'filterType': filter.condition1.text_filter.filter_type,
                    'type': filter.condition1.text_filter.type
                }
                if hasattr(filter.condition1.text_filter, 'filter'):
                    new_model[filter.field]['condition1']['filter'] = filter.condition1.text_filter.filter
                new_model['condition2'] = {
                    'filterType': filter.condition2.text_filter.filter_type,
                    'type': filter.condition2.text_filter.type
                }
                if hasattr(filter.condition2.text_filter, 'filter'):
                    new_model[filter.field]['condition2']['filter'] = filter.condition2.text_filter.filter
            elif filter.filter_type == 'number':
                new_model[filter.field]['condition1'] = {
                    'filterType': filter.condition1.number_filter.filter_type,
                    'type': filter.condition1.number_filter.type
                }
                if hasattr(filter.condition1.number_filter, 'filter'):
                    new_model[filter.field]['condition1']['filter'] = filter.condition1.number_filter.filter
                if hasattr(filter.condition1.number_filter, 'filter_to'):
                    new_model[filter.field]['condition1']['filterTo'] = filter.condition1.number_filter.filter_to
                new_model['condition2'] = {
                    'filterType': filter.condition2.number_filter.filter_type,
                    'type': filter.condition2.number_filter.type
                }
                if hasattr(filter.condition2.number_filter, 'filter'):
                    new_model[filter.field]['condition2']['filter'] = filter.condition2.number_filter.filter
                if hasattr(filter.condition2.number_filter, 'filter_to'):
                    new_model[filter.field]['condition2']['filterTo'] = filter.condition2.number_filter.filter_to
            elif filter.filter_type == 'date':
                new_model[filter.field]['condition1'] = {
                    'filterType': filter.condition1.date_filter.filter_type,
                    'type': filter.condition1.date_filter.type
                }
                if hasattr(filter.condition1.date_filter, 'date_from'):
                    new_model[filter.field]['condition1']['dateFrom'] = filter.condition1.date_filter.date_from
                if hasattr(filter.condition1.date_filter, 'date_to'):
                    new_model[filter.field]['condition1']['dateTo'] = filter.condition1.date_filter.date_to
                new_model['condition2'] = {
                    'filterType': filter.condition2.date_filter.filter_type,
                    'type': filter.condition2.date_filter.type
                }
                if hasattr(filter.condition2.date_filter, 'date_from'):
                    new_model[filter.field]['condition2']['dateFrom'] = filter.condition2.date_filter.date_from
                if hasattr(filter.condition2.date_filter, 'date_to'):
                    new_model[filter.field]['condition2']['dateTo'] = filter.condition2.date_filter.date_to
            else:
                raise Exception('Bad combo filter model')

    return new_model


top_level_types = [Case]
second_level_types = [CC, DSCIVIL, DSCR, DSK8, ODYCRIM, ODYTRAF]
other_types = [
    DSCRCharge,
    DSCRDefendant,
    DSCRRelatedPerson,
    DSCREvent,
    DSCRTrial,
    DSCRBailEvent,
    DSK8Charge,
    DSK8BailAndBond,
    DSK8Bondsman,
    DSK8Defendant,
    DSK8RelatedPerson,
    DSK8Event,
    DSK8Trial,
    CCDistrictCaseNumber,
    CCPlaintiff,
    CCDefendant,
    CCRelatedPerson,
    CCPartyAlias,
    CCPartyAddress,
    CCAttorney,
    CCCourtSchedule,
    CCDocument,
    CCJudgment,
    CCJudgmentModification,
    CCJudgmentAgainst,
    CCJudgmentInFavor,
    CCSupportOrder,
    DSCIVILComplaint,
    DSCIVILHearing,
    DSCIVILJudgment,
    DSCIVILRelatedPerson,
    DSCIVILEvent,
    DSCIVILTrial,
    ODYCRIMReferenceNumber,
    ODYCRIMDefendant,
    ODYCRIMInvolvedParty,
    ODYCRIMAttorney,
    ODYCRIMCourtSchedule,
    ODYCRIMCharge,
    ODYCRIMProbation,
    ODYCRIMRestitution,
    ODYCRIMWarrant,
    ODYCRIMBailBond,
    ODYCRIMBondSetting,
    ODYCRIMDocument,
    ODYCRIMService,
    ODYTRAFReferenceNumber,
    ODYTRAFDefendant,
    ODYTRAFInvolvedParty,
    ODYTRAFAttorney,
    ODYTRAFCourtSchedule,
    ODYTRAFCharge,
    ODYTRAFWarrant,
    ODYTRAFBailBond,
    ODYTRAFBondSetting,
    ODYTRAFDocument,
    ODYTRAFService
]
all_types = top_level_types + second_level_types + other_types


class Row(Union):
    class Meta:
        types = tuple(all_types)


class ResultsResponse(ObjectType):
    rows = List(Row)
    last_row = Int()


class Query(ObjectType):
    row_data = Field(
        ResultsResponse,
        model=String(required=True),
        start_row=Int(default_value=0),
        end_row=Int(default_value=100),
        row_group_cols=List(ValueColumn),
        value_cols=List(ValueColumn),
        pivot_cols=List(ValueColumn),
        group_keys=List(String),
        sort_model=List(SortColumn),
        filter_model=FilterModel()
    )

    def resolve_row_data(parent, info, model, start_row, end_row, row_group_cols,
                     value_cols, pivot_cols, group_keys, filter_model, sort_model):
        results = fetch_rows_orm(
            model,
            {
                'startRow': start_row,
                'endRow': end_row,
                'rowGroupCols': row_group_cols,
                'valueCols': value_cols,
                'pivotCols': pivot_cols,
                'groupKeys': group_keys,
                'sortModel': sort_model,
                'filterModel': transform_filter_model(filter_model)
            }
        )
        print(results)
        return results


schema = Schema(query=Query, auto_camelcase=False)
