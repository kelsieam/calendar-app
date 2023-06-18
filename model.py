"""Models for movie ratings app."""

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

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
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    user = db.relationship('User', back_populates='default_schedule')

    def __repr__(self):
        return f'<DefaultSchedule def_sched_id={self.def_sched_id} start_time={self.start}>'


class Event(db.Model):
    """an event"""
    def as_dict(self):
        return {
            'event_id': self.event_id,
            'start': self.start,
            'end': self.end,
            'label': self.label,
            'description': self.description,
            'shared': self.shared,
            'with_parent': self.with_parent,
            'user_id': self.user_id
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
    ## 1 = curr parent, 2 = non curr parent 3 = parent a, 4 = parent b, 5 = both(event etc)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    user = db.relationship('User', back_populates='events')


    def __repr__(self):
        return f'<Event event_id={self.event_id} start={self.start}>'


class Holiday(db.Model):
    """a holiday - court ordered, can change default schedule"""
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    user = db.relationship('User', back_populates='holidays')

    def __repr__(self):
        return f'<Holiday holiday_id={self.holiday_id} start={self.start}>'


class User(db.Model):
    """a user"""
    def as_dict(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'password_hash': self.password_hash,
            'name': self.name,
            'family_id': self.family_id,
            'is_child': self.is_child
        }
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, 
                        autoincrement=True, 
                        primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(30), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('families.family_id'))
    is_child = db.Column(db.Boolean, nullable=False)

    ## setting up relationships
    family = db.relationship('Family', back_populates='user')
    events = db.relationship('Event', back_populates='user')
    holidays = db.relationship('Holiday', back_populates='user')
    default_schedule = db.relationship('DefaultSchedule', back_populates='user')
    files = db.relationship('File', back_populates='user')
    lists = db.relationship('List', back_populates='user')
    list_elements = db.relationship('ListElement', back_populates='user')

    def __repr__(self):
        return f'<User user_id={self.user_id} username={self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

class Family(db.Model):
    """stores family_id to group users together"""
    __tablename__ = 'families'
    family_id = db.Column(db.Integer,
                          autoincrement=True,
                          primary_key=True)
    ## family password?

    user = db.relationship('User', back_populates='family')
    
    def __repr__(self):
        return f'<Family family_id={self.family_id}>'


class File(db.Model):
    """stores uploaded files to share with family members"""
    def as_dict(self):
        return {
            'file_id': self.file_id,
            'location': self.file_id,
            'title': self.title,
            'comment': self.comment,
            'user_id': self.user_id
        }
    
    __tablename__ = 'files'
    file_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    location = db.Column(db.String,
                         unique=True,
                         nullable=False)
    title = db.Column(db.String(50),
                      nullable=False)
    comment = db.Column(db.String)

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    user = db.relationship('User', back_populates='files')

    def __repr__(self):
        return f'<File file_id={self.file_id}, location={self.location}>'
    

class List(db.Model):
    """stores lists created by family members"""
    __tablename__ = 'lists'

    list_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    title = db.Column(db.String,
                      unique=True,
                      nullable=False)
    user_id = db.Column(db.Integer, 
                        db.ForeignKey('users.user_id'), 
                        nullable=False)
    user = db.relationship('User', back_populates='lists')
    list_elements = db.relationship('ListElement', back_populates='lists')

    def __repr__(self):
        return f'<List list_id={self.list_id}, title={self.title}>'


class ListElement(db.Model):
    """stores elements of the lists from lists table"""
    __tablename__ = 'list_elements'
    list_element_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    content = db.Column(db.String,
                        nullable=False)
    list_id = db.Column(db.Integer,
                        db.ForeignKey('lists.list_id'))
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'))
    
    user = db.relationship('User', back_populates='list_elements')
    lists = db.relationship('List', back_populates='list_elements')
    
    def __repr__(self):
        return f'<ListElement list_element_id={self.list_element_id}, list_id={self.list_id}>'



def connect_to_db(flask_app, db_uri="postgresql:///calendar", echo=False):
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
