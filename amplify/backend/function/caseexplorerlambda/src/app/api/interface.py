from marshmallow import Schema, fields

class RowGroupColumn(Schema):
    id = fields.String()
    displayName = fields.String()
    field = fields.String(required=True)

class ValueColumn(Schema):
    id = fields.String()
    displayName = fields.String()
    field = fields.String(required=True)
    aggFunc = fields.String(required=True)

class SortColumn(Schema):
    colId = fields.String(required=True)
    sort = fields.String()

class QueryParams(Schema):
    startRow = fields.Number(default=0)
    endRow = fields.Number(default=100)
    rowGroupCols = fields.List(fields.Nested(RowGroupColumn))
    valueCols = fields.List(fields.Nested(ValueColumn))
    pivotCols = fields.List(fields.Nested(RowGroupColumn))
    pivotMode = fields.Boolean(default=False)
    groupKeys = fields.List(fields.String())
    sortModel = fields.List(fields.Nested(SortColumn))
    filterModel = fields.Dict()
