"""Server for movie ratings app."""

from flask import (Flask, render_template, request, flash, session, redirect, url_for)
from model import connect_to_db, db
from flask_sqlalchemy import SQLAlchemy
from crud import create_event, create_def_sched, create_holiday, create_user, create_family, get_calendar_event_by_id, get_calendar_holiday_by_id, create_list, create_list_element, create_file, create_message, get_db_list_by_id, get_db_list_element_by_id, get_db_file_by_id, get_db_message_by_id
from model import Event, Holiday, DefaultSchedule, User, Family, List, ListElement, File, Message, db
from werkzeug.utils import secure_filename
import psycopg2
# import openai
import os
from datetime import datetime
from math import trunc

from jinja2 import StrictUndefined

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.secret_key = "wowkelsielearnhowtodothislol"
app.jinja_env.undefined = StrictUndefined
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_user_logged_in():
    return 'username' in session

def current_user():
    current_username = session['username']
    current_user = User.query.filter_by(username=current_username).first()
    return current_user

@app.context_processor
def user_family_names():
    user_info = {}
    
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        
        user_info['username'] = current_user.username
        if current_user.family_id is not None:
            user_info['family_members'] = User.query.filter_by(
                family_id=current_user.family_id).all()
        else:
            user_info['family_members'] = []
    return user_info

@app.route('/user-family-info', methods=['GET', 'POST'])
def user_family_info():
    # user_info = {}
    
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        
        # user_info['user'] = current_user
        if current_user.family_id is not None:
            family_members = User.query.filter_by(
                family_id=current_user.family_id).all()
        else:
            family_members = []
    
    return {'user': current_user, 'family': family_members}


@app.route('/')
def homepage():
    """View homepage."""
    if 'username' in session and session['username']:
        return render_template('homepage.html')
    else:
        return redirect('/login')
    
    # this works and use this later but its annoying while I'm testing
    # return render_template('homepage.html')


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
            # flash('Successfully logged in')
            session['username'] = username
            return redirect('/')
        else:
            flash('Invalid username or password')
            return redirect('/login')
        
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')


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


# @app.route('/calendar')
# def calendar():
#     if not is_user_logged_in():
#         flash('Please log in to access the calendar.')
#         return redirect('/login')
#     return render_template('calendar.html')


@app.route('/api/sampledata')
def sampledata():
    all_events = []
    all_holidays = []
    all_def_schedules = []

    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user = current_user.as_dict()
        # print(current_user.username, '********current_user')
    else: 
        return redirect('/login')
    
    if current_user.family_id:
        user_events = Event.query.filter_by(user_id=current_user.user_id).all()
        family_events = Event.query.join(User).filter(
            User.family_id == current_user.family_id, Event.shared == True
            ).all()
        
        """user's and family's events to send to calendar"""
        all_user_events = user_events + [event for event in family_events 
                                    if event not in user_events]
        for event in all_user_events:
            all_events.append(event.as_dict())

        """user's and family's holidays to send to calendar"""
        family_holidays = Holiday.query.join(User).filter(
            User.family_id == current_user.family_id).all()

        for holiday in family_holidays:    
            all_holidays.append(holiday.as_dict())

        """user's and family's default schedules to send to calendar"""
        family_def_schedules = DefaultSchedule.query.join(User).filter(
        User.family_id == current_user.family_id).all()
    
        for def_schedule in family_def_schedules:
            all_def_schedules.append(def_schedule.as_dict())


    else:
        """user's events to send to calendar"""
        user_events = Event.query.filter_by(user_id=current_user.user_id).all()
        for event in user_events:
            all_events.append(event.as_dict())

        """user's holidays to send to calendar"""
        user_holidays = Holiday.query.filter_by(user_id=current_user.user_id).all()
        for holiday in user_holidays:
            all_holidays.append(holiday.as_dict())

        """user's default schedules to send to calendar"""
        user_def_schedules = DefaultSchedule.query.filter_by(user_id=current_user.user_id).all()
        for def_schedule in user_def_schedules:
            all_def_schedules.append(def_schedule.as_dict())
    

    # all_users = User.query.all()
    # for user in all_users:
    #     user = user.as_dict()

    return {'all_events': all_events, 'all_holidays': all_holidays, 
            'all_def_schedules': all_def_schedules, 'current_user': user}
# 'all_users': all_users


@app.route('/child-profile')
def cannot_change_things():
    return {'success': False, 'message': 'You cannot edit or delete events in a child profile'}


@app.route('/event/<id>')
def get_calendar_event_by_id_for_json(id):
    return Event.query.filter_by(event_id=id).first().as_dict()


@app.route('/holiday/<id>')
def get_calendar_holiday_by_id_for_json(id):
    return Holiday.query.filter_by(holiday_id=id).first().as_dict()


@app.route('/delete-event/<int:id>', methods=['DELETE'])
def delete_calendar_event(id):
    # print(f'{id} *******************************')
    event = get_calendar_event_by_id(id)
    # print(event)
    username = session['username']
    current_user = User.query.filter_by(username=username).first()
    # print(event.user_id, current_user.user_id)
    if event.user_id == current_user.user_id:
        db.session.delete(event)
        db.session.commit()
        return {'success': True}
    else:
        ## ooh maybe could send a request to creator to delete?
        return {'success': False, 'message': "you cannot delete another user's event"}
    

@app.route('/delete-holiday/<int:id>', methods=['DELETE'])
def delete_calendar_holiday(id):
    holiday = get_calendar_holiday_by_id(id)
    username = session['username']
    current_user = User.query.filter_by(username=username).first()
    # print(holiday.user_id, current_user.user_id)
    if holiday.user_id == current_user.user_id:
        db.session.delete(holiday)
        db.session.commit()
        return {'success': True}
    else:
        return {'success': False, 'message': "You cannot delete another user's event"}
    

@app.route('/modify-event/<int:id>', methods=['PATCH']) # PATCH
def modify_calendar_event(id):
    event = get_calendar_event_by_id(id)
    new_title = request.form.get('eventTitle')
    new_start = request.form.get('eventStart')
    new_end = request.form.get('eventEnd')
    print(f'new_title: {new_title}, new_start: {new_start}, new_end: {new_end}')
    if new_title:
        event.label = new_title
    if new_start:
        event.start = new_start
    if new_end:
        event.end = new_end
    username = session['username']
    current_user = User.query.filter_by(username=username).first()
    if event.user_id == current_user.user_id:
        db.session.add(event)
        db.session.commit()
        return {'success': True, 'message': "Event successfully updated", 
                'new_title': new_title, 'new_start': new_start, 'new_end': new_end}
    else:
        return {'success': False, 'message': "You cannot modify another user's event"}


@app.route('/modify-holiday/<int:id>', methods=['PATCH']) # PATCH
def modify_calendar_holiday(id):
    holiday = get_calendar_holiday_by_id(id)
    new_title = request.form.get('eventTitle')
    new_start = request.form.get('eventStart')
    new_end = request.form.get('eventEnd')
    print(f'new_title: {new_title}, new_start: {new_start}, new_end: {new_end}')
    if new_title:
        holiday.label = new_title
    if new_start:
        holiday.start = new_start
    if new_end:
        holiday.end = new_end
    username = session['username']
    current_user = User.query.filter_by(username=username).first()
    if holiday.user_id == current_user.user_id:
        db.session.add(holiday)
        db.session.commit()
        return {'success': True, 'message': "Holiday successfully updated", 
                'new_title': new_title, 'new_start': new_start, 'new_end': new_end}
    else:
        return {'success': False, 'message': "You cannot modify another user's holiday"}



@app.route('/create-event', methods = ['POST'])
def create_calendar_event():
    # if request.method == 'POST':
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user_id = current_user.user_id
        
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
        
        existing_event = Event.query.filter_by(start=event_start, end=event_end,
                                               label=event_label, description=event_description,
                                               shared=event_shared, with_parent=event_with_parent,
                                               user_id=user_id).first()
        if existing_event:
            return {'success': False, 'message': 'That event already exists'}

        event = create_event(start=event_start, end=event_end, label=event_label, 
                             description=event_description, shared=event_shared,
                             with_parent=event_with_parent, user_id=user_id)
        
        db.session.add(event)
        db.session.commit()
        return {'success': True, 'message': 'Event added'}
    
    else: 
            return redirect('/login')


@app.route('/create-holiday', methods = ['POST'])
def create_calendar_holiday():
    # if request.method == 'POST':
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user_id = current_user.user_id
        
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
        
        holiday = create_holiday(start=holiday_start, 
                            end=holiday_end, 
                            label=holiday_label, 
                            description=holiday_description, 
                            change_def_sched=change_default_schedule,
                            with_parent=holiday_with_parent, user_id=user_id)
        
        db.session.add(holiday)
        db.session.commit()
        return {'success': True, 'message': 'Holiday added', 
                'change_default_schedule': change_default_schedule}

    else: 
        return redirect('/login')


@app.route('/create-parenting-schedule', methods = ['POST'])
def create_parenting_schedule():
    if request.method == 'POST':    
        start = request.form.get('parenting-schedule-start')
        parent_start = request.form.get('parenting-schedule-parent-start')
        if parent_start == 'true':
            parent_start = True
        else:
            parent_start = False
        cycle_duration = request.form.get('parenting-schedule-cycle-duration')
        parenting_schedule_end = None # I somehow need to check to see when the next default schedule starts and use that as the end date

        if 'username' in session:
            current_username = session['username']
            current_user = User.query.filter_by(username=current_username).first()
            user_id = current_user.user_id
        else: 
            return redirect('/login')

        parenting_schedule = create_def_sched(parent_start=parent_start, 
                                            start=start, 
                                            end=parenting_schedule_end, 
                                            cycle_duration=cycle_duration,
                                            user_id=user_id)
        
        db.session.add(parenting_schedule)
        db.session.commit()
        return {'success': True, 'message': 'Parenting schedule added'}


@app.route('/create-new-default-schedule', methods = ['POST'])
def create_change_default_schedule():
    # if request.method == 'POST':
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user_id = current_user.user_id
        
        changed_schedule_start = request.form.get('default-schedule-start')
        changed_schedule_start = datetime.strptime(changed_schedule_start, '%Y-%m-%d')
        changed_schedule_parent_start = request.form.get('default-schedule-parent')
        if changed_schedule_parent_start == 'true':
            changed_schedule_parent_start = True
        else:
            changed_schedule_parent_start = False
        
        all_schedules = DefaultSchedule.query\
            .filter_by(user_id=user_id)\
            .order_by(DefaultSchedule.start.desc())\
            .all()
        
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

        new_default_schedule = create_def_sched(parent_start=changed_schedule_parent_start, 
                                            start=changed_schedule_start, 
                                            end=changed_schedule_end, 
                                            cycle_duration=changed_schedule_cycle_duration, 
                                            user_id=user_id)
        
        db.session.add(new_default_schedule)
        db.session.commit()
        return {'success': True, 'message': 'Parenting schedule updated'}

    return redirect('/login')


@app.route('/create-family', methods=['POST'])
def create_family_table():
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        input_username = request.form.get('username-to-connect')
        user_to_connect_with = User.query.filter_by(username=input_username).first()
        
        if user_to_connect_with:
            if user_to_connect_with.family_id:
                if current_user.family_id:
                    # flash("user already has a family")
                    return {'success': False, 'message': 'User is already in a family group'}
                else:
                    current_user.family_id = user_to_connect_with.family_id
            
            elif current_user.family_id:
                user_to_connect_with.family_id = current_user.family_id
            
            else:
                new_family = create_family()
                
                current_user.family = new_family
                user_to_connect_with.family = new_family
                print(current_user.family_id, user_to_connect_with.family_id)
                ## want to figure out how to ask the user_to_connect_with if they'd like 
                ## to connect. I don't want anyone to be able to make a massive family 
                ## without permission
                # db.session.add(new_family)
                # db.session.commit()
                # flash("successfully connected")
            db.session.add_all([current_user, user_to_connect_with])
            db.session.commit()

        else:
            return {'success': False, 'message': 'User not found. Please check their username and try again'}

    else:
        return redirect('/login')
    
    return redirect('/')


@app.route('/uploads')
def uploads_page():

    return render_template('uploads.html')


@app.route('/api/uploads')
def lists_and_files():
    if 'username' in session and session['username']:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        current_user_json = current_user.as_dict()
    else: 
        return redirect('/login')
    
    all_lists_json = []
    all_list_elements_json = []
    all_files_json = []
    all_messages_json = []

    # finding whole family files, lists, messages
    if current_user.family_id:
        user_lists = List.query.filter_by(user_id=current_user.user_id).all()
        family_lists = List.query.join(User).filter(
            User.family_id == current_user.family_id).all()
        all_user_lists = user_lists + [list for list in family_lists
                                    if list not in user_lists]
        for list in all_user_lists:
            all_lists_json.append(list.as_dict())
        # print(all_lists_json)
        
        # list of list_ids so we can query for which list 
        # elements belong to the family group
        list_ids = [list.list_id for list in all_user_lists]
        
        list_elements = db.session.query(ListElement)\
            .join(List, ListElement.list_id.in_(list_ids)).all()
        for list_element in list_elements:
            all_list_elements_json.append(list_element.as_dict())
        # print(all_list_elements_json)
        
        user_files = File.query.filter_by(user_id=current_user.user_id).all()
        family_files = File.query.join(User).filter(
            User.family_id == current_user.family_id).all()
        all_user_files = user_files + [file for file in family_files if 
                                    file not in user_files]
        for file in all_user_files:
            all_files_json.append(file.as_dict())
        # print(all_files_json)

        user_messages = Message.query.filter_by(user_id=current_user.user_id).all()
        family_messages = Message.query.join(User).filter(
            User.family_id == current_user.family_id).all()
        all_user_messages = user_messages + [message for message in family_messages 
                                                if message not in user_messages]
        # message_usernames = db.session.query(User.username, Message.user_id, 
        #                                         Message.content).join(Message).all()
        # print(message_usernames)
        for message in all_user_messages:
            all_messages_json.append(message.as_dict())
        # print('**********583********', all_messages_json)


    # finding just user lists for users with no family
    else:
        user_lists = List.query.filter_by(user_id=current_user.user_id).all()
        for list in user_lists:
            all_lists_json.append(list.as_dict())


        list_ids = [list.list_id for list in user_lists]
        
        list_elements = db.session.query(ListElement).join(List).filter(
            db.or_(List.list_id.in_(list_ids), List.user_id == 
                current_user.user_id)).all()       
        for list_element in list_elements:
            all_list_elements_json.append(list_element.as_dict())


        user_files = File.query.filter_by(user_id=current_user.user_id).all()
        for file in user_files:
            all_files_json.append(file.as_dict())


        user_messages = Message.query.filter_by(user_id=current_user.user_id).all()
        for message in user_messages:
            all_messages_json.append(message.as_dict())
    

    return {
            'all_lists_json': all_lists_json,
            'all_list_elements_json': all_list_elements_json,
            'all_files_json': all_files_json,
            'all_messages_json': all_messages_json,
            'current_user': current_user_json
            }


@app.route('/create-message/<int:submit_time>', methods=['POST'])
def create_new_message(submit_time):
    if 'username' in session and session['username']:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user = current_user.as_dict()
        user_id = current_user.user_id
        username = current_user.username
        content = request.form.get('inputMessage')
        print(content)
        submit_time = int(submit_time)
        # print('632****************', submit_time)
        new_message = create_message(content, user_id, submit_time)

        db.session.add(new_message)
        db.session.commit()

        return {'success': True, 'message': 'Message added', 
                'username': username, 'content': new_message.content}


@app.route('/create-file', methods=['POST'])
def create_new_file():
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user = current_user.as_dict()
        user_id = current_user.user_id
        username = current_user.username
        title = request.form.get('file-title')
        # print(f'title: {title}')
        comment = request.form.get('file-comment')
        # print(f'comment: {comment}')
        # print(request.files)

        if 'file' not in request.files:
            # print('line 558')
            return {'success': False, 'message': 'You must select a file'}
        
        file = request.files['file']
        
        if file.filename == '':
            # print('line 564')
            return {'success': False, 'message': 'You must select a file'}
        
        if file and allowed_file(file.filename):
            print('********* in save line 568 **********')
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # file.save(f'/static/uploads/{filename}')
            # return redirect(f'/static/uploads/{filename}')
            new_file = create_file(f'/static/uploads/{filename}', title, comment, user_id)
            print(new_file)

            db.session.add(new_file)
            db.session.commit()

            new_file_in_db = File.query.filter_by(title=title, user_id=user_id).first()
            file_id = new_file_in_db.file_id
            file_location = new_file_in_db.location
            file_title = new_file_in_db.title

            return {'success': True, 'message': 'File saved', 'file_id': file_id, 
                    'file_location': file_location, 'file_title': file_title, 'user': user}
    
    return redirect('/')


@app.route('/delete-file/<int:id>', methods=['DELETE'])
def delete_file(id):
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        file_to_delete = get_db_file_by_id(id)
        title = file_to_delete.title
        location = file_to_delete.location
        # print(f'************{location}**************')
        # print(file_to_delete.user_id)
        # child_created_file = File.query.join(User).filter(File.file_id == id, )
        child_created_file = db.session.query(User)\
            .filter(User.user_id == file_to_delete.user_id, User.is_child == True)\
            .join(User.files)\
            .filter(File.file_id == file_to_delete.file_id)\
            .first()
        print('child_created_file', child_created_file)
        if file_to_delete.user_id == current_user.user_id or child_created_file:
            # os.remove(location)
            db.session.delete(file_to_delete)
            db.session.commit()

            return {'success': True, 'message': f"File '{title}' deleted"}
        
        return {'success': False, 'message': 'You can only delete files you have created'}


@app.route('/create-list', methods=['POST'])
def create_new_list():

    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        user_json = current_user.as_dict()
        user_id = current_user.user_id
        username = current_user.username
        title = request.form.get('list-title')

        new_list = create_list(title, user_id)

        db.session.add(new_list)
        db.session.commit()

        new_list_in_db = List.query.filter_by(title=title, user_id=user_id).first()
        list_id = new_list_in_db.list_id
        # username = 
        

        return {'success': True, 'message': 'List created', 'list_id': list_id, 
                'user_id': user_id, 'username': username, 'user': user_json}
    
    return redirect('/')


@app.route('/add-to-list/<int:id>', methods=['POST'])
def add_to_list(id):
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        username = current_user.username
        user_id = current_user.user_id
        content = request.form.get('list-element')
        print(content)
        list_id = id

        new_list_element = create_list_element(content, list_id, user_id)
        
        db.session.add(new_list_element)
        db.session.commit()

        new_list_element_in_db = db.session.query(ListElement) \
            .order_by(db.desc(ListElement.list_element_id)).first()
        # print(new_list_element_in_db)
        # print(f'580: {new_list_element_in_db.list_element_id}')
        list_element_id = new_list_element_in_db.list_element_id

        return {'success': True, 'message': 'Added to list', 'list_id': list_id, 
                'user_id': user_id, 'username': username, 'content': content, 
                'list_element_id': list_element_id}


@app.route('/delete-list/<int:id>', methods=['DELETE'])
def delete_list(id):
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        list_to_delete = get_db_list_by_id(id)
        title = list_to_delete.title
        print('*************', list_to_delete.user_id, current_user.user_id)
        child_created_list = db.session.query(User)\
            .filter(User.user_id == list_to_delete.user_id, User.is_child == True)\
            .join(User.lists)\
            .filter(List.list_id == list_to_delete.list_id)\
            .first()
        print('child_created_list', child_created_list)
        if list_to_delete.user_id == current_user.user_id or child_created_list:    
            db.session.delete(list_to_delete)
            db.session.commit()

            return {'success': True, 'message': f"List '{title}' deleted"}
        
        return {'success': False, 'message': 'You can only delete lists you have created'}


@app.route('/delete-list-element/<int:id>', methods=['DELETE'])
def delete_list_element(id):
    if 'username' in session:
        current_username = session['username']
        current_user = User.query.filter_by(username=current_username).first()
        list_element_to_delete = get_db_list_element_by_id(id)
        list_element_title = list_element_to_delete.content
        list_ID = list_element_to_delete.list_id
        
        list = List.query.filter_by(list_id=list_ID).first()
        list_title = list.title

        # if list.user_id != current_user.user_id:
        #     return {'success': False, 'message': ''}

        db.session.delete(list_element_to_delete)
        db.session.commit()

        return {'success': True, 'message': f" '{list_element_title}' deleted from list '{list_title}' "}


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
