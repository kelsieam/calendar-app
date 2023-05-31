"""Models for movie ratings app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# Replace this with your code!
class DefaultSchedule(db.Model):
    """default parenting schedule"""

    __tablename__ = 'defaultSchedule'

    def_sched_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    parent_start = db.Column(db.Boolean) 
    ## True = user, False = other parent
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    cycle_duration = db.Column(db.String)

    # ratings = db.relationship('Rating', back_populates ='user')

    def __repr__(self):
        return f'<defaultSchedule def_sched_id={self.def_sched_id} start_time={self.start_time}>'


class Event(db.Model):
    """a holiday or event"""

    __tablename__ = 'events'

    event_id = db.Column(db.Integer,
                         autoincrement=True,
                         primary_key=True)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    label = db.Column(db.String)
    description = db.column(db.String)
    shared = db.Column(db.Boolean)
    change_def_sched = db.Column(db.Boolean)
    with_parent = db.Column(db.Integer, default=1) 
    ## 1 = curr parent, 2 = non curr parent 3 = parent a, 4 = parent b,  5 = both(event etc)

    # ratings = db.relationship('Rating', back_populates='movie')

    def __repr__(self):
        return f'<Event event_id={self.event_id} start={self.start}>'




def connect_to_db(flask_app, db_uri="postgresql:///ratings", echo=True):
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
