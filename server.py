"""Server for movie ratings app."""

from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db, db
from flask_sqlalchemy import SQLAlchemy
from crud import create_event, create_def_sched, create_holiday, create_user, create_family
from model import Event, Holiday, DefaultSchedule, User, Family, db
import psycopg2
from datetime import datetime

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "wowkelsielearnhowtodothislol"
app.jinja_env.undefined = StrictUndefined


def is_user_logged_in():
    return 'username' in session

@app.context_processor
def user_family_names():
    user_info = {}
    
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        
        user_info['username'] = current_user.username
        user_info['family_members'] = User.query.filter_by(
            family_id=current_user.family_id).all()

    return user_info

@app.route('/')
def homepage():
    """View homepage."""
    # if 'logged_in' in session and session['logged_in']:
    #     return render_template('homepage.html')
    # else:
    #     return redirect('/login')
    
    # this works and use this later but its annoying while I'm testing
    return render_template('homepage.html')


@app.route('/inputinfo')
def display_forms():
    return render_template('homepage.html')


@app.route('/login', methods=['GET', 'POST'])
def log_in():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            flash('Successfully logged in')
            session['username'] = username
            return redirect('/inputinfo')
        else:
            flash('Invalid username or password')
            return redirect('/login')
        
    return render_template('login.html')
        

@app.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('new-username')
    password = request.form.get('new-password')
    name = request.form.get('first-name')
    family_id = None
    is_child = 'is-child' in request.form

    existing_user = User.query.filter_by(username=username).first()
    
    if existing_user:
        flash('Username already exists')
        return render_template('login.html')
    else:
        user = create_user(username, password, name, family_id, is_child)
        db.session.add(user)
        db.session.commit()
        session['username'] = username
        flash('Account created successfully')
        return redirect('/inputinfo')


@app.route('/calendar')
def calendar():
    if not is_user_logged_in():
        flash('Please log in to access the calendar.')
        return redirect('/login')
    return render_template('calendar.html')


@app.route('/api/sampledata')
def sampledata():
    ## get events related to logged in user
    # lots of querying
    all_events = []
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
    else: 
        return redirect('/login')
    # events = Event.query.all()
    user_events = Event.query.filter_by(user_id=current_user.user_id).all()
    print(f'user_events {user_events}')
    family_events = Event.query.join(User).filter(
        User.family_id == current_user.family_id, Event.shared == True
        ).all()
    print(f'family_events {family_events}')
    all_user_events = user_events + [event for event in family_events 
                                if event not in user_events]
    for event in all_user_events:
        all_events.append(event.as_dict())
    

    all_holidays = []
    family_holidays = Holiday.query.join(User).filter(
        User.family_id == current_user.family_id).all()

    for holiday in family_holidays:    
        all_holidays.append(holiday.as_dict())


    all_def_schedules = []
    family_def_schedules = DefaultSchedule.query.join(User).filter(
        User.family_id == current_user.family_id).all()
    
    for def_schedule in family_def_schedules:
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
        

        if 'username' in session:
            current_username = session['username']
            current_user = User.query.filter_by(username=current_username).first()
            user_id = current_user.user_id
        else: 
            return redirect('/login')
        existing_event = Event.query.filter_by(start=event_start, end=event_end,
                                               label=event_label, description=event_description,
                                               shared=event_shared, with_parent=event_with_parent,
                                               user_id=user_id).first()
        if existing_event:
            # Handle the case where an identical event already exists (e.g., display an error message)
            return render_template('calendar.html')

        event = create_event(start=event_start, end=event_end, label=event_label, 
                             description=event_description, shared=event_shared,
                             with_parent=event_with_parent, user_id=user_id)
        
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

        if 'username' in session:
            current_username = session['username']
            current_user = User.query.filter_by(username=current_username).first()
            user_id = current_user.user_id
        else: 
            return redirect('/login')
        
        holiday = create_holiday(start=holiday_start, 
                            end=holiday_end, 
                            label=holiday_label, 
                            description=holiday_description, 
                            change_def_sched=change_default_schedule,
                            with_parent=holiday_with_parent, user_id=user_id)
        
        db.session.add(holiday)
        db.session.commit()
        return render_template('calendar.html')


@app.route('/create-parenting-schedule', methods = ['POST'])
def create_parenting_schedule():
    if request.method == 'POST':    
        parenting_schedule_start = request.form.get('parenting-schedule-start')
        parenting_schedule_parent_start = request.form.get('parenting-schedule-parent-start')
        if parenting_schedule_parent_start == 'true':
            parenting_schedule_parent_start = True
        else:
            parenting_schedule_parent_start = False
        parenting_schedule_cycle_duration = request.form.get('parenting-schedule-cycle-duration')
        parenting_schedule_end = None # I somehow need to check to see when the next default schedule starts and use that as the end date

        if 'username' in session:
            current_username = session['username']
            current_user = User.query.filter_by(username=current_username).first()
            user_id = current_user.user_id
        else: 
            return redirect('/login')

        parenting_schedule = create_def_sched(parent_start=parenting_schedule_parent_start, 
                                            start=parenting_schedule_start, 
                                            end=parenting_schedule_end, 
                                            cycle_duration=parenting_schedule_cycle_duration,
                                            user_id=user_id)
        
        db.session.add(parenting_schedule)
        db.session.commit()
        return render_template('calendar.html')


@app.route('/create-new-default-schedule', methods = ['POST'])
def create_change_default_schedule():
    if request.method == 'POST':
        changed_schedule_start = request.form.get('default-schedule-start')
        changed_schedule_start = datetime.strptime(changed_schedule_start, '%Y-%m-%d')
        changed_schedule_parent_start = request.form.get('default-schedule-parent')
        if changed_schedule_parent_start == 'true':
            changed_schedule_parent_start = True
        else:
            changed_schedule_parent_start = False
        
        all_schedules = DefaultSchedule.query.order_by(DefaultSchedule.start.desc()).all()
        
        def get_schedule_end(all_schedules):
            for schedule in all_schedules:
                if schedule.start >= changed_schedule_start:
                    continue
                else:
                    return schedule
                
        schedule_to_end = get_schedule_end(all_schedules)
        schedule_to_end.end = changed_schedule_start

        def get_schedule_for_end(all_schedules):
            for schedule in reversed(all_schedules):
                if schedule.start <= changed_schedule_start:
                    continue
                else:
                    return schedule
                
        schedule_end_is_from = get_schedule_for_end(all_schedules)
        if schedule_end_is_from == None:
            changed_schedule_end = None
        else:
            changed_schedule_end = schedule_end_is_from.start
        
        changed_schedule_cycle_duration = schedule_to_end.cycle_duration
        if 'username' in session:
            current_username = session['username']
            current_user = User.query.filter_by(username=current_username).first()
            user_id = current_user.user_id
        else: 
            return redirect('/login')

        new_default_schedule = create_def_sched(parent_start=changed_schedule_parent_start, 
                                            start=changed_schedule_start, 
                                            end=changed_schedule_end, 
                                            cycle_duration=changed_schedule_cycle_duration, 
                                            user_id=user_id)
        
        db.session.add(new_default_schedule)
        db.session.commit()
        return render_template('calendar.html')


@app.route('/create-family', methods=['POST'])
def create_family_table():
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        input_username = request.form.get('username-to-connect')
        user_to_connect_with = User.query.filter_by(username=input_username).first()
        
        if user_to_connect_with:
            if user_to_connect_with.family_id:
                current_user.family_id = user_to_connect_with.family_id
            else:
                new_family = create_family()
                
                current_user.family = new_family
                user_to_connect_with.family = new_family
                print(current_user.family_id, user_to_connect_with.family_id)
                ## want to figure out how to ask the user_to_connect_with if they'd like 
                ## to connect. I don't want anyone to be able to make a massive family 
                ## without permission
                db.session.add(new_family)
                db.session.commit()
                flash("successfully connected")

        else:
            flash('User not found. Please check their username and try again')

    else:
        return redirect('/login')
    
    return render_template('homepage.html')


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
