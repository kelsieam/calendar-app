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


    db_holiday = crud.create_holiday(start, end, label, description, change_def_sched, with_parent)
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


    db_event = crud.create_event(start, end, label, description, shared, with_parent)
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


    db_def_sched = crud.create_def_sched(parent_start, start, end, cycle_duration)
    def_sched_in_db.append(db_def_sched)


model.db.session.add_all(def_sched_in_db)
model.db.session.commit()


