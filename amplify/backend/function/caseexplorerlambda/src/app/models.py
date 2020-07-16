from app.base_models import *
from app import base_models

Case.private_fields = ['query_court']

for cls in [CC, DSCIVIL, DSCR, DSK8, ODYCRIM, ODYTRAF]:
    cls.is_root = True

DSCRDefendant.private_fields = [
    'name',
    'DOB',
    'DOB_str',
    '_DOB_str',
    'address_1',
    'address_2'
]

DSK8Defendant.private_fields = [
    'name',
    'DOB',
    'DOB_str',
    '_DOB_str',
    'address_1',
    'address_2'
]

CCDefendant.private_fields = ['name']

DSCIVILComplaint.private_fields = ['defendant']

ODYCRIMDefendant.private_fields = [
    'name',
    'DOB',
    'DOB_str',
    '_DOB_str',
    'address_1',
    'address_2'
]

ODYTRAFDefendant.private_fields = [
    'name',
    'DOB',
    'DOB_str',
    '_DOB_str',
    'address_1',
    'address_2'
]
