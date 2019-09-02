import json
import re
from sqlalchemy import cast, Date, create_engine
from sqlalchemy.sql import select, func, and_, or_, text
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

from lib.mjcs.models import Case, DSCR, DSK8, CC, DSCIVIL, ODYCRIM, ODYTRAF


CASE_FIELDS = [
    'case_number',
    'court',
    'case_type',
    'filing_date_original',
    'status'
]

DSCR_FIELDS = [
    'case_number',
    'court_system',
    'case_status',
    'tracking_number',
    'case_type',
    'district_code',
    'location_code',
    'document_type',
    'issued_date_str',
    'case_disposition'
]

DSK8_FIELDS = [
    'case_number',
    'court_system',
    'case_status',
    'tracking_number',
    'complaint_number',
    'district_case_number',
    'status_date_str',
    'filing_date_str',
    'incident_date_str'
]

CC_FIELDS = [
    'case_number',
    'court_system',
    'case_status',
    'title',
    'case_type',
    'filing_date_str',
    'case_disposition',
    'disposition_date_str'
]

DSCIVIL_FIELDS = [
    'case_number',
    'court_system',
    'case_status',
    'claim_type',
    'district_code',
    'location_code',
    'filing_date_str'
]

ODYCRIM_FIELDS = [
    'case_number',
    'court_system',
    'case_status',
    'location',
    'case_title',
    'case_type',
    'filing_date_str',
    'tracking_numbers'
]

ODYTRAF_FIELDS = [
    'case_number',
    'court_system',
    'case_status',
    'location',
    'case_title',
    'case_type',
    'filing_date_str',
    'violation_date_str',
    'violation_time_str',
    'violation_county'
]

config = {
    'endpoints': {
        '/api/cases': (Case, CASE_FIELDS),
        '/api/cc': (CC, CC_FIELDS),
        '/api/dscivil': (DSCIVIL, DSCIVIL_FIELDS),
        '/api/dscr': (DSCR, DSCR_FIELDS),
        '/api/dsk8': (DSK8, DSK8_FIELDS),
        '/api/odycrim': (ODYCRIM, ODYCRIM_FIELDS),
        '/api/odytraf': (ODYTRAF, ODYTRAF_FIELDS)
    }
}


def set_db_uri(uri):
    config['DB_URI'] = uri


@contextmanager
def db_session():
    """Provide a transactional scope around a series of operations."""
    if 'DB_URI' not in config:
        raise Exception('Must initialize DB URI first')
    db_engine = create_engine(config['DB_URI'])
    db_factory = sessionmaker(bind = db_engine)
    db = db_factory()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()


def fetch_rows(endpoint, req):
    if endpoint not in config['endpoints']:
        raise Exception('Unknown API endpoint')
    return fetch_rows_from_model(
        config['endpoints'][endpoint][0],
        config['endpoints'][endpoint][1],
        req
    )


def fetch_rows_from_model(cls, fields, req):
    start_row = req['startRow']
    end_row = req['endRow']
    page_size = end_row - start_row
    table = cls.__table__

    query = build_select(table, req)
    query = build_where(query, table, req)
    query = build_limit(query, table, req)
    query = build_order_by(query, table, req)
    query = build_group_by(query, table, req)
    print(query)

    with db_session() as db:
        results = db.execute(query).fetchall()

    results_len = len(results)
    current_last_row = start_row + results_len
    last_row = current_last_row if current_last_row <= end_row else -1
    rows = [{field:getattr(row,field) for field in fields} for row in results[:page_size]]
    return {
        'rows': rows,
        'lastRow': last_row
    }


def build_select(table, req):
    row_group_cols = req['rowGroupCols']
    group_keys = req['groupKeys']
    value_cols = req['valueCols']

    if is_grouping(row_group_cols, group_keys):
        cols = [row_group_cols[len(group_keys)]['field']]
        for value_col in value_cols:
            agg_func = value_col['aggFunc']
            field = value_col['field']
            try:
                col = getattr(func, agg_func)(table.c[field]).label(field)
            except KeyError:
                raise Exception('Invalid column {}'.format(field))
            cols.append(col)
        return select(cols)
    else:
        return select([table])


def build_where(query, table, req):
    row_group_cols = req['rowGroupCols']
    group_keys = req['groupKeys']
    filter_model = req['filterModel']

    where_parts = []
    if len(group_keys) > 0:
        for idx, key in group_keys:
            field = row_group_cols[idx]['field']
            where_parts.append(table.c[field] == key)

    if filter_model:
        for field, model in filter_model.items():
            filter = create_filter_sql(table.c[field], model)
            if filter is not None:
                where_parts.append(filter)

    if where_parts:
        for condition in where_parts:
            query = query.where(condition)

    return query


def build_limit(query, table, req):
    start_row = req['startRow']
    end_row = req['endRow']
    page_size = end_row - start_row
    return query.limit(page_size + 1).offset(start_row)


def create_filter_sql(col, model):
    if 'operator' in model:
        op = model['operator']
        if op == 'AND':
            return and_(
                process_filter(col, model['condition1']),
                process_filter(col, model['condition2'])
            )
        elif op == 'OR':
            return or_(
                process_filter(col, model['condition1']),
                process_filter(col, model['condition2'])
            )
    elif 'filterType' in model:
        return process_filter(col, model)


def process_filter(col, model):
    filter_type = model['filterType']
    if filter_type == 'text':
        return process_text_filter(col, model)
    elif filter_type == 'number':
        return process_number_filter(col, model)
    elif filter_type == 'date':
        return process_date_filter(col, model)
    elif filter_type == 'set':
        return process_set_filter(col, model)
    raise Exception('Unknown filter type ' + filter_type)


def process_text_filter(col, model):
    op = model['type']
    filter = model['filter']
    if op == 'equals':
        return col == filter
    elif op == 'notEqual':
        return col != filter
    elif op == 'contains':
        return col.ilike('%{}%'.format(filter))
    elif op == 'notContains':
        return col.notilike('%{}%'.format(filter))
    elif op == 'startsWith':
        return col.ilike('{}%'.format(filter))
    elif op == 'endsWith':
        return col.ilike('%{}'.format(filter))
    raise Exception('Unknown text filter type ' + op)


def process_number_filter(col, model):
    op = model['type']
    filter = model['filter']
    if op == 'equals':
        return col == filter
    elif op == 'notEqual':
        return col != filter
    elif op == 'greaterThan':
        return col > filter
    elif op == 'greaterThanOrEqual':
        return col >= filter
    elif op == 'lessThan':
        return col < filter
    elif op == 'lessThanOrEqual':
        return col >= filter
    elif op == 'inRange':
        filter_to = model['filterTo']
        return and_(col >= filter, col <= filter_to)
    raise Exception('Unknown number filter type ' + op)


def process_date_filter(col, model):
    op = model['type']
    date_from = model['dateFrom']
    match = re.fullmatch(r'(\d\d\d\d)-(\d\d)-(\d\d)', date_from)
    if not match:
        raise Exception('Invalid date format ' + date_from)
    year = match.group(1)
    month = match.group(2)
    day = match.group(3)
    date_from = '{}/{}/{}'.format(month, day, year)
    if op == 'equals':
        return col == date_from
    elif op == 'notEqual':
        return col != date_from
    elif op == 'greaterThan':
        return text('((substring({} from \'%/%/#"%#"\' for \'#\')::integer > {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer > {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer = {} and substring({} from \'%/#"%#"/%\' for \'#\')::integer > {}))'\
                    .format(
                        col.name,
                        int(year),
                        col.name,
                        int(year),
                        col.name,
                        int(month),
                        col.name,
                        int(year),
                        col.name,
                        int(month),
                        col.name,
                        int(day)
                    ))
    elif op == 'lessThan':
        return text('((substring({} from \'%/%/#"%#"\' for \'#\')::integer < {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer < {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer = {} and substring({} from \'%/#"%#"/%\' for \'#\')::integer < {}))'\
                    .format(
                        col.name,
                        int(year),
                        col.name,
                        int(year),
                        col.name,
                        int(month),
                        col.name,
                        int(year),
                        col.name,
                        int(month),
                        col.name,
                        int(day)
                    ))
    elif op == 'inRange':
        date_to = model['dateTo']
        match = re.fullmatch(r'(\d\d\d\d)-(\d\d)-(\d\d)', date_to)
        if not match:
            raise Exception('Invalid date format ' + date_to)
        to_year = match.group(1)
        to_month = match.group(2)
        to_day = match.group(3)
        return and_(
            text('((substring({} from \'%/%/#"%#"\' for \'#\')::integer > {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer > {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer = {} and substring({} from \'%/#"%#"/%\' for \'#\')::integer >= {}))'\
                        .format(
                            col.name,
                            int(year),
                            col.name,
                            int(year),
                            col.name,
                            int(month),
                            col.name,
                            int(year),
                            col.name,
                            int(month),
                            col.name,
                            int(day)
                        )),
            text('((substring({} from \'%/%/#"%#"\' for \'#\')::integer < {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer < {}) or (substring({} from \'%/%/#"%#"\' for \'#\')::integer = {} and substring({} from \'#"%#"/%/%\' for \'#\')::integer = {} and substring({} from \'%/#"%#"/%\' for \'#\')::integer <= {}))'\
                        .format(
                            col.name,
                            int(to_year),
                            col.name,
                            int(to_year),
                            col.name,
                            int(to_month),
                            col.name,
                            int(to_year),
                            col.name,
                            int(to_month),
                            col.name,
                            int(to_day)
                        ))
        )
    raise Exception('Unknown date filter type ' + op)


def process_set_filter(col, model):
    filter = None
    vals = model['values']
    null = '' in vals
    if null:
        vals.remove('')
    if vals:
        filter = col.in_(vals)
        if null:
            filter = or_(
                filter,
                col == None
            )
    elif null:
        filter = col == None
    return filter


def build_order_by(query, table, req):
    sort_model = req['sortModel']
    row_group_cols = req['rowGroupCols']
    group_keys = req['groupKeys']
    grouping = is_grouping(row_group_cols, group_keys)

    if sort_model:
        sort_parts = []
        group_col_ids = [col['id'] for col in row_group_cols][:len(group_keys) + 1]
        for item in sort_model:
            col_id = item['colId']
            sort = item['sort']
            if not grouping or col_id in group_col_ids:
                if 'date_' in col_id:
                    if sort == 'asc':
                        query = query.order_by(cast(table.c[col_id], Date).asc())
                    elif sort == 'desc':
                        query = query.order_by(cast(table.c[col_id], Date).desc())
                    else:
                        raise Exception('Invalid sort ' + sort)
                else:
                    if sort == 'asc':
                        query = query.order_by(table.c[col_id].asc())
                    elif sort == 'desc':
                        query = query.order_by(table.c[col_id].desc())
                    else:
                        raise Exception('Invalid sort ' + sort)

    return query


def build_group_by(query, table, req):
    row_group_cols = req['rowGroupCols']
    group_keys = req['groupKeys']

    if is_grouping(row_group_cols, group_keys):
        field = row_group_cols[len(group_keys)]['field']
        query = query.group_by(t.c[field])

    return query


def is_grouping(row_group_cols, group_keys):
    return len(row_group_cols) > len(group_keys)
