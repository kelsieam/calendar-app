"""Server for movie ratings app."""

from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db, db
from flask_sqlalchemy import SQLAlchemy
from crud import create_event, create_def_sched, create_holiday
from model import Event, Holiday, DefaultSchedule, db
import psycopg2

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined




@app.route('/')
def homepage():
    """View homepage."""

    return render_template('homepage.html')

@app.route('/calendar')
def calendar():
    """view calendar page"""

    return render_template('calendar.html')

@app.route('/api/sampledata')
def sampledata():
    all_events = []
    events = Event.query.all()
    for event in events:
        all_events.append(event.as_dict())
    all_holidays = []
    holidays = Holiday.query.all()
    for holiday in holidays:
        all_holidays.append(holiday.as_dict())

    all_def_schedules = []
    def_schedules = DefaultSchedule.query.all()
    for def_schedule in def_schedules:
        all_def_schedules.append(def_schedule.as_dict())

    return {'all_events': all_events, 'all_holidays': all_holidays, 'all_def_schedules': all_def_schedules}


@app.route('/create-event', methods = ['POST'])
def create_calendar_event():
    if request.method == 'POST':
        event_start = request.form.get('event-start')
        event_end = request.form.get('event-end')
        event_label = request.form.get('event-label')
        event_description = request.form.get('event-description')
        event_shared = request.form.get('event-shared')
        if event_shared == 'true':
            event_shared = True
        else:
            event_shared = False
        event_with_parent = request.form.get('event-with-parent')
        if event_with_parent == 'parent-a':
            event_with_parent = 3
        elif event_with_parent == 'parent-b':
            event_with_parent = 4
        elif event_with_parent == 'both-parents':
            event_with_parent = 5
        elif event_with_parent == 'neither-parent':
            event_with_parent = 6

        event = create_event(start=event_start, end=event_end, label=event_label, 
                             description=event_description, shared=event_shared,
                             with_parent=event_with_parent)
        
        db.session.add(event)
        db.session.commit()
        return render_template('calendar.html')

@app.route('/create-holiday', methods = ['POST'])
def create_calendar_holiday():
    if request.method == 'POST':
        holiday_start = request.form.get('holiday-start')
        holiday_end = request.form.get('holiday-end')
        holiday_label = request.form.get('holiday-label')
        holiday_description = request.form.get('holiday-description')
        holiday_with_parent = request.form.get('holiday-with-parent')
        if holiday_with_parent == 'current-parent':
            holiday_with_parent = 1
        elif holiday_with_parent == 'non-current-parent':
            holiday_with_parent = 2
        elif holiday_with_parent == 'parent-a':
            holiday_with_parent = 3
        elif holiday_with_parent == 'parent-b':
            holiday_with_parent = 4
        elif holiday_with_parent == 'both-parents':
            holiday_with_parent = 5
        elif holiday_with_parent == 'neither-parent':
            holiday_with_parent = 6
        change_default_schedule = request.form.get('change-default-schedule')
        if change_default_schedule == 'true':
            change_default_schedule = True
        else:
            change_default_schedule = False
        holiday = create_holiday(start=holiday_start, end=holiday_end, label=holiday_label, 
                             description=holiday_description, change_def_sched=change_default_schedule,
                             with_parent=holiday_with_parent)
        
        db.session.add(holiday)
        db.session.commit()
        return render_template('calendar.html')






if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
