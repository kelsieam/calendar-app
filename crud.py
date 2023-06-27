"""CRUD operations."""

from model import db, Event, DefaultSchedule, Holiday, User, Family, List, ListElement, File, Message,connect_to_db


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


def create_list(title, user_id):
    list = List(title=title, user_id=user_id)

    return list


def create_list_element(content, list_id, user_id):
    list_element = ListElement(content=content, list_id=list_id, user_id=user_id)

    return list_element


def create_file(location, title, comment, user_id):
    file = File(location=location, title=title, comment=comment, user_id=user_id)

    return file


def create_message(content, user_id, submit_time):
    message = Message(content=content, user_id=user_id, submit_time=submit_time)

    return message


def get_calendar_event_by_id(id):
    return Event.query.filter_by(event_id=id).first()

def get_calendar_holiday_by_id(id):
    return Holiday.query.filter_by(holiday_id=id).first()

def get_db_list_by_id(id):
    return List.query.filter_by(list_id=id).first()

def get_db_list_element_by_id(id):
    return ListElement.query.filter_by(list_element_id=id).first()

def get_db_file_by_id(id):
    return File.query.filter_by(file_id=id).first()

def get_db_message_by_id(id):
    return Message.query.filter_by(message_id=id).first()

if __name__ == '__main__':
    from server import app
    connect_to_db(app)

