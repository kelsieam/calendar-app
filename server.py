"""Server for movie ratings app."""

from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db, db
from flask_sqlalchemy import SQLAlchemy
import crud
from model import Event, Holiday, DefaultSchedule 
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


# holidays = Holiday.query.all()
# default_schedule = DefaultSchedule.query.all()


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
