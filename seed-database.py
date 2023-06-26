"""Script to seed database."""

import os
import json
from datetime import datetime

import crud
import model
import server

# os.system("dropdb calendar")
# # More code will go here

os.system('dropdb calendar')
os.system('createdb calendar')

model.connect_to_db(server.app)
model.db.create_all()


users = [
    crud.create_user('kelsie1', 'password', 'Bob', None, False),
    crud.create_user('kelsie2', 'password', 'Art', None, False),
    crud.create_user('kelsie3', 'password', 'Somebodys name', None, False),
    crud.create_user('kelsie4', 'password', 'Rutteger', None, False),
    crud.create_user('kelsie5', 'password', 'Bort', None, True),
    crud.create_user('kelsie6', 'password', 'Borty', None, True),
    crud.create_user('kelsie7', 'password', 'Bortimer', None, False),
    crud.create_user('kelsie8', 'password', 'Bortward', None, False),
    crud.create_user('kelsie9', 'password', 'Bortifer', None, True),
    crud.create_user('kelsie10', 'password', 'Borticia', None, False)
    ]


model.db.session.add_all(users)
model.db.session.commit()


messages = [
    crud.create_message("hi I'm writing in a message box", 1, 1687677141),
    crud.create_message("no me", 5, 1687677020),
    crud.create_message("no u", 1, 1687677100)
]

model.db.session.add_all(messages)
model.db.session.commit()



lists = [
    crud.create_list('groceries to buy', 1),
    crud.create_list('things to remember', 1)
]

model.db.session.add_all(lists)
model.db.session.commit()

list_elements = [
    crud.create_list_element('cereal', 1, 1),
    crud.create_list_element('apples', 1, 1),
    crud.create_list_element('cleats', 2, 1),
    crud.create_list_element('sunscreen', 2, 1)
]
    
model.db.session.add_all(list_elements)
model.db.session.commit()


files = [
    crud.create_file('https://images.sampletemplates.com/wp-content/uploads/2016/04/26175856/Medical-New-Patient-Consultation-Form.jpg',
                     'doctor form', 'finish before appt', 1)
]
model.db.session.add_all(files)
model.db.session.commit()




with open('sample-data/holidays.json') as f:
    holiday_data = json.loads(f.read())

holidays_in_db = []
for holiday in holiday_data:

    start = holiday['start']
    end = holiday['end']
    label = holiday['label']
    description = holiday['description']
    change_def_sched = holiday['change_def_sched']
    with_parent = holiday['with_parent']
    user_id = holiday['user_id']

    db_holiday = crud.create_holiday(start, end, label, description, 
                                     change_def_sched, with_parent, user_id)
    holidays_in_db.append(db_holiday)


model.db.session.add_all(holidays_in_db)
model.db.session.commit()



with open('sample-data/events.json') as f:
    event_data = json.loads(f.read())

events_in_db = []
for event in event_data:

    start = event['start']
    end = event['end']
    label = event['label']
    description = event['description']
    shared = event['shared']
    with_parent = event['with_parent']
    user_id = event['user_id']


    db_event = crud.create_event(start, end, label, description, shared, with_parent, user_id)
    events_in_db.append(db_event)

model.db.session.add_all(events_in_db)
model.db.session.commit()


with open('sample-data/def-sched.json') as f:
    def_sched_data = json.loads(f.read())

def_sched_in_db = []
for def_sched in def_sched_data:
    ## parent_start, start, end, cycle_duration
    parent_start = def_sched['parent_start']
    start = def_sched['start']
    end = def_sched['end']
    cycle_duration = def_sched['cycle_duration']
    user_id = def_sched['user_id']


    db_def_sched = crud.create_def_sched(parent_start, start, end, cycle_duration, user_id)
    def_sched_in_db.append(db_def_sched)


model.db.session.add_all(def_sched_in_db)
model.db.session.commit()

