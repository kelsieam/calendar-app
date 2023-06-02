"""Models for movie ratings app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class DefaultSchedule(db.Model):
    """default parenting schedule"""
    def as_dict(self):
        return {
            'def_sched_id': self.def_sched_id,
            'parent_start': self.parent_start,
            'start': self.start,
            'end': self.end,
            'cycle_duration': self.cycle_duration
        }
    __tablename__ = 'default_schedule'

    def_sched_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    parent_start = db.Column(db.Boolean, default=True) 
    ## True = user, False = other parent
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime)
    cycle_duration = db.Column(db.Integer, nullable=False)


    def __repr__(self):
        return f'<DefaultSchedule def_sched_id={self.def_sched_id} start_time={self.start}>'


class Event(db.Model):
    """a holiday or event"""
    def as_dict(self):
        return {
            'event_id': self.event_id,
            'start': self.start,
            'end': self.end,
            'label': self.label,
            'description': self.description,
            'shared': self.shared,
            'with_parent': self.with_parent
        }
    __tablename__ = 'events'

    event_id = db.Column(db.Integer,
                         autoincrement=True,
                         primary_key=True)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    label = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    shared = db.Column(db.Boolean, default=False)
    with_parent = db.Column(db.Integer) 
    ## 1 = curr parent, 2 = non curr parent 3 = parent a, 4 = parent b,  5 = both(event etc)


    def __repr__(self):
        return f'<Event event_id={self.event_id} start={self.start}>'


class Holiday(db.Model):
    """a holiday or event"""
    def as_dict(self):
        return {
            'holiday_id': self.holiday_id,
            'start': self.start,
            'end': self.end,
            'label': self.label,
            'description': self.description,
            'change_def_sched': self.change_def_sched,
            'with_parent': self.with_parent
        }
    __tablename__ = 'holidays'

    holiday_id = db.Column(db.Integer,
                         autoincrement=True,
                         primary_key=True)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    label = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    change_def_sched = db.Column(db.Boolean, default=False)
    with_parent = db.Column(db.Integer, default=1)
    ## 1 = curr parent, 2 = non curr parent 3 = parent a, 4 = parent b,  5 = both(event etc)


def connect_to_db(flask_app, db_uri="postgresql:///calendar", echo=True):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    flask_app.config["SQLALCHEMY_ECHO"] = echo
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)

    print("Connected to the db!")


if __name__ == "__main__":
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
