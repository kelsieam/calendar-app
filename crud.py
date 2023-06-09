"""CRUD operations."""

from model import db, Event, DefaultSchedule, Holiday, User, Family, connect_to_db


# Functions start here!
def create_event(start, end, label, description, shared, with_parent, user_id):
    """Create and return an event."""

    event = Event(start=start, end=end, label=label, 
                  description=description, shared=shared, 
                  with_parent=with_parent, user_id=user_id)

    return event

def create_def_sched(parent_start, start, end, cycle_duration, user_id):

    def_sched = DefaultSchedule(parent_start=parent_start, start=start, end=end, 
                                cycle_duration=cycle_duration, user_id=user_id)

    return def_sched


def create_holiday(start, end, label, description, change_def_sched, with_parent, user_id):
   
    holiday = Holiday(start=start, end=end, label=label, 
                  description=description, change_def_sched=change_def_sched, 
                  with_parent=with_parent, user_id=user_id)

    return holiday


def create_user(username, password, name, family_id, is_child):
    user = User(username=username, name=name, 
                family_id=family_id, is_child=is_child)
    user.set_password(password)
    
    return user


def create_family():
    family = Family()

    return family


if __name__ == '__main__':
    from server import app
    connect_to_db(app)

