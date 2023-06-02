"""CRUD operations."""

from model import db, Event, DefaultSchedule, Holiday, connect_to_db


# Functions start here!
def create_event(start, end, label, description, shared, with_parent):
    """Create and return an event."""

    event = Event(start=start, end=end, label=label, 
                  description=description, shared=shared, with_parent=with_parent)

    return event

def create_def_sched(parent_start, start, end, cycle_duration):

    def_sched = DefaultSchedule(parent_start=parent_start, start=start, 
                                       end=end, cycle_duration=cycle_duration)


    return def_sched

def create_holiday(start, end, label, description, change_def_sched, with_parent):
   
    holiday = Holiday(start=start, end=end, label=label, 
                  description=description, change_def_sched=change_def_sched, with_parent=with_parent)

    return holiday


if __name__ == '__main__':
    from server import app
    connect_to_db(app)