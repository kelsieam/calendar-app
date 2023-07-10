[Demo Video](https://youtu.be/xO7XyNHFJmM "CoParenting Calendar Demo")


The co-parenting calendar is a full stack web app that enables families to effectively organize and communicate. It offers a shared calendar for tracking parenting time, events, and holidays, with easy editing capabilities. It dynamically updates the parenting schedule when necessary, ensuring the schedule is accurate out into the future. The app allows family messaging, shared file uploads, and collaboratively created lists.  There is also the option to set a user as a child, which gives a more limited view of the app.


## Technology
Python
Flask
JavaScript
Jinja2
PostgreSQL
SQLAlchemy
fullcalendar.io


## Features
#### Calendar
The calendar is a collection of 3 types of events - events, holidays, and default schedules. 
##### Events -
things like appointments and games, and can be shared with a user's family group or not. Can be edited or deleted by the user who input them.
##### Holidays -
generally days that are laid out specifically in the parenting plan, that have the potential to change the parent the children are with. Can be edited or deleted by the user who input them. A long holiday that changes the parenting schedule (ie Spring Break) requires a new default schedule to be input.
##### Default schedules -
the basic parenting schedule. Can be affected by longer holidays, and are calculated by taking in a new starting date, which creates a new default schedule starting on that day and sets the end date for the previous one to that date.

#### Creating a family
Each new user has a empty family id in the database. When a user connects to another, if the other user has a family id, the user is assigned to the same one. If not, a new family id is created and assigned to both users. A user can only belong to one family.


#### Shared Lists
Shared lists are created by any user in the family group. Any user can add and delete list elements, but only the user who created the list can delete it - unless the user who created was a child account, and then any adult account in the family can delete it.


#### Shared File Uploads
Files can be uploaded by any user in the family group, and can be deleted by the user who uploaded it. The same rules for child accounts apply.


#### Family Messaging
The family messaging can be accessed by all users. Messages cannot be edited or deleted. They're tracked in the database by user id and the time they are input.


