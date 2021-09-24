from sqlalchemy import String, Integer, Date, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import date
from .models.common import TableBase, MetaColumn as Column


class Officer(TableBase):
    __tablename__ = 'officers'
    id = Column(Integer, primary_key=True)
    last_name = Column(String)
    first_name = Column(String)
    middle_initial = Column(String)
    suffix = Column(String)
    unique_internal_identifier = Column(String, unique=True)
    department_id = Column(Integer)
    # assignments = relationship('Assignment', backref='officer', lazy='dynamic')
    assignments_lazy = relationship('Assignment')


    def full_name(self):
        if self.middle_initial:
            middle_initial = self.middle_initial + '.' if len(self.middle_initial) == 1 else self.middle_initial
            if self.suffix:
                return '{} {} {} {}'.format(self.first_name, middle_initial, self.last_name, self.suffix)
            else:
                return '{} {} {}'.format(self.first_name, middle_initial, self.last_name)
        if self.suffix:
            return '{} {} {}'.format(self.first_name, self.last_name, self.suffix)
        return '{} {}'.format(self.first_name, self.last_name)
    

    def job_title(self):
        if self.assignments_lazy:
            return max(self.assignments_lazy, key=lambda x: x.star_date or date.min).job.job_title


class Assignment(TableBase):
    __tablename__ = 'assignments'

    id = Column(Integer, primary_key=True)
    officer_id = Column(Integer, ForeignKey('officers.id', ondelete='CASCADE'))
    # baseofficer = relationship('Officer')
    star_no = Column(String(120), index=True, unique=False, nullable=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    job = relationship('Job')
    star_date = Column(Date, index=True, unique=False, nullable=True)
    resign_date = Column(Date, index=True, unique=False, nullable=True)


class Job(TableBase):
    __tablename__ = 'jobs'

    id = Column(Integer, primary_key=True)
    job_title = Column(String(255), index=True, unique=False, nullable=False)
    is_sworn_officer = Column(Boolean, index=True, default=True)
    order = Column(Integer, index=True, unique=False, nullable=False)


class CopCache(TableBase):
    __tablename__ = 'cops_cache'
    __table_args__ = (Index('ixh_cops_cache_officer_seq_no', 'officer_seq_no', postgresql_using='hash'),)

    officer_seq_no = Column(String, ForeignKey('officers.unique_internal_identifier'), primary_key=True)
    case_number = Column(String, ForeignKey('cases.case_number'), primary_key=True)