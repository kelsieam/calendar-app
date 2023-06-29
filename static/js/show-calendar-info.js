
// let allEvents = [];
// let allHolidays = [];
// let allDefaultSchedules = [];
let events = [];
let holidays = [];
let defaultSchedules = [];
let otherParentDefaultSchedules = [];
let holidayDict = {};

// document.getElementById('add-to-calendar').style.display = 'none';
// document.getElementById('add-to-calendarContent').style.display = 'none';
// document.getElementById('schedule-add-to-calendar').style.display = 'none';
// document.getElementById('schedule-add-to-calendarContent').style.display = 'none';

const parentingScheduleColumn = document.getElementById('parenting-schedule-column')
parentingScheduleColumn.style.display = 'none';

const eventHolidayColumn = document.getElementById('event-holiday-column')
eventHolidayColumn.style.display = 'none';


const parentingScheduleButton = document.getElementById('parenting-schedule-submit');
parentingScheduleButton.addEventListener(('click'), function(evt) {
  evt.preventDefault();
  const createPSFormData = new FormData(document.getElementById('parenting-schedule-form'));
  fetch(('/create-parenting-schedule'), {
    body: createPSFormData,
    method: 'POST'
  })
    .then((response) => {
        return response.json();
    })
    .then((responseJson) => {
        console.log(responseJson);
        location.reload();
    })
})

const eventButton = document.getElementById('event-submit');
eventButton.addEventListener(('click'), function(evt) {
  evt.preventDefault();
  const createEventFormData = new FormData(document.getElementById('event-form'));
  fetch(('/create-event'), {
    body: createEventFormData,
    method: 'POST'
  })
    .then((response) => {
      return response.json();
    })
    .then((responseJson) => {
      console.log(responseJson);
      location.reload();
    })

})

const holidayButton = document.getElementById('holiday-submit');
holidayButton.addEventListener(('click'), function(evt) {
  evt.preventDefault();
  const createHolidayFormData = new FormData(document.getElementById('holiday-form'));
  const changeDefSchedFormData = new FormData(document.getElementById('new-default-schedule-form'))
  fetch(('/create-holiday'), {
    body: createHolidayFormData,
    method: 'POST'
  })
    .then((holidayResponse) => {
      return holidayResponse.json();
    })
    .then((holidayResponseJson) => {
      console.log(holidayResponseJson);
      if (holidayResponseJson['change_default_schedule'] === true) {
        fetch(('/create-new-default-schedule'), {
          body: changeDefSchedFormData,
          method: 'POST'
        })
          .then((defSchedResponse) => {
            return defSchedResponse.json();
          })
          .then((defSchedResponseJson) => {
            console.log(defSchedResponseJson);
          })
      }
      // location.reload();
    })


})

// hiding and displaying change default schedule form based on which button is clicked
const changeDefaultScheduleInputs = document.getElementsByName('change-default-schedule')
const defaultScheduleSection = document.getElementById('change-default-schedule-section');
defaultScheduleSection.style.display = 'none';

changeDefaultScheduleInputs.forEach(radioInput => {
    radioInput.addEventListener('change', handleRadioChange);
});

function handleRadioChange(event) {
    console.log(event.target.id, event.target.value);
    console.log(defaultScheduleSection.querySelectorAll
      ('input, select, textarea'));
    
    if (this.value === 'true') {
      defaultScheduleSection.style.display = 'block';  // show
      defaultScheduleSection.querySelectorAll
        ('input, select, textarea').forEach(field => {
        field.setAttribute('required', true); // makes it required if yes button checked
      });

    } else {
      defaultScheduleSection.style.display = 'none';   // hide
      defaultScheduleSection.querySelectorAll
        ('input, select, textarea').forEach(field => {
        field.removeAttribute('required'); // not required otherwise
      });
    }
}


fetch('/api/sampledata')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // console.log(data)
    const allEvents = data.all_events;
    const allHolidays = data.all_holidays;
    const allDefaultSchedules = data.all_def_schedules;
    if (allDefaultSchedules.length === 0) {
      // document.getElementById('schedule-add-to-calendar').style.display = 'inline';
      // document.getElementById('schedule-add-to-calendarContent').style.display = 'inline';
      parentingScheduleColumn.style.display = 'inline';

      // document.getElementById('add-holiday').style.display = 'none';
      // document.getElementById('add-holiday-tab-tab').style.display = 'none';
    }
    
    console.log(allDefaultSchedules);
    console.log(allDefaultSchedules.length);
    if (allDefaultSchedules.length > 0) {
      console.log('in length if')
      console.log(eventHolidayColumn)
      // document.getElementById('add-to-calendar').style.display = 'block';
      // document.getElementById('add-to-calendarContent').style.display = 'block';
      eventHolidayColumn.style.display = 'inline';

    }
    // const allUsers = data.all_users;


    //$(document).ready(function() {
      
      events = allEvents.map(x => ({
        title: x.label,
        start: x.start,
        end: x.end,
        url: `/event/${x.event_id}`,
        description: x.description,
        extendedProps: {
          methods: ['DELETE', 'PATCH']
        }
      })
      )
      
      holidays = allHolidays.map(x => ({
        title: x.label,
        start: x.start,
        end: x.end,
        url: `/holiday/${x.holiday_id}`,
        description: x.description,
        extendedProps: {
          methods: ['DELETE', 'PATCH']
        }
      })
      )
      
      
      createHolidayDict(allHolidays);
      createDefaultScheduleEvents(allDefaultSchedules, holidayDict);
      // console.log(allEvents)
      $('#calendar').fullCalendar({
        editable: true,
        selectable: true,
        eventLimit: true,
        displayEventTime: true,
        displayEventEnd: true,
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        views: {
          agenda: {
            columnHeaderFormat: 'ddd'
          }
        },
        eventSources: [
        {
          editable: true,
          events: events,
          color: '#074297'
        },
        {
          events: holidays,
          editable: true,
          color: '#119da4'
        },
        {
          events: defaultSchedules,
          rendering: 'background',
          backgroundColor: '#fdc30d',
        },
        {
          events: otherParentDefaultSchedules,
          rendering: 'background',
          backgroundColor: '#fee082'
        }
        ],
        
        // eventMouseover: function (info) {
        //   console.log('mouseover', info);
        // },

        eventClick: function(info) {
          // console.log(info);
          $('#eventModal').modal('show');
          const modalTitle = document.getElementById('eventModalLabel');
          modalTitle.innerHTML = info.title;
          
          let url = info['url'];
          let eventOrHoliday = url.split('/').slice(-2, -1)[0]
          let id = url.split('/').pop(); // id is what's after the / in the url field

          let changeEventForm = document.getElementById('changeEventForm');

          const displayData = document.getElementById('show-event-data');
          const displayTime = document.getElementById('show-event-time');

          const dateOfEvent = new Date(info.start._i);
          const monthIndex = dateOfEvent.getMonth();
          const monthNames = ['January', 'February', 'March', 'April', 'May', 
                  'June', 'July', 'August', 'September', 'October', 'November', 'December']
          const monthOfEvent = monthNames[monthIndex];
          const dayOfEvent = dateOfEvent.getDate();
          const formattedDate = monthOfEvent + " " + dayOfEvent;

          displayTime.innerHTML = formattedDate;

          const displayDescription = document.getElementById('show-event-description');
          // displayDescription.innerHTML = `
          //           Event description:
          //           <br>${info.description}
          // `;
          displayDescription.innerHTML = info.description;
          
          const eventChangeSection = document.getElementById('event-change-section');
          const eventDeleteSection = document.getElementById('event-delete-section');
          if (data.current_user.is_child === true) {
            eventChangeSection.hidden = true;
            eventDeleteSection.hidden = true;
          }


          changeEventForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let changeEventFormData = new FormData(changeEventForm);
            let urlForChange;
            if (eventOrHoliday === 'event') {
              urlForChange = `/modify-event/${id}`;
            } else {
              urlForChange = `/modify-holiday/${id}`;
            }
            console.log(`urlForChange: ${urlForChange}`);
            fetch(urlForChange, {
              method: 'PATCH',
              body: changeEventFormData
            })
              .then(function(response) {
                return response.json();
              })
              .then(function(responseJson) {
                console.log(responseJson)
                if (responseJson['success']) {
                  $('#eventModal').modal('hide');
                  console.log(responseJson);
                  if (responseJson['new_title']) {
                    info.title = responseJson['new_title'];
                  } 
                  if (responseJson['new_start']) {
                    info.start = responseJson['new_start'];
                  } 
                  if (responseJson['new_end']) {
                    info.end = responseJson['new_end'];
                  }
                  $('#calendar').fullCalendar('updateEvent', info);
                  // location.reload();
                } else {
                  getErrorMessage(responseJson);
                }
              });
          });

          let deleteButton = document.getElementById('delete-button');
          const user = data.current_user
          if (user.is_child === true) {
            deleteButton.hidden = true;
          }
          deleteButton.addEventListener('click', function() {
            // const user = data.current_user;
            // if (user.is_child === true) {
            //     fetch('/child-profile')
            //       .then((response) => {
            //         return response.json()
            //       })
            //       .then((responseJson) => {
            //         alert(responseJson['message'])
            //       })
            // }
            let confirmed = confirm('Are you sure you want to delete this event?')
            if (confirmed) {
              let urlForDelete;
              if (eventOrHoliday === 'event') {
                urlForDelete = `/delete-event/${id}`;
              } else {
                urlForDelete = `/delete-holiday/${id}`;
              }
              console.log(urlForDelete);
              fetch(urlForDelete, {
                method: 'DELETE'
              })
              .then(function(response) {
                return response.json();
              })
              .then(function(responseJson) {
                console.log(responseJson);
                if (responseJson['success']) {
                  $('#eventModal').modal('hide');
                  // 'removeEvents'[info._id, idOrFilter];
                  $('#calendar').fullCalendar('removeEvents', info._id);
                } else {
                    getErrorMessage(responseJson);
                  }
                })
            }
          })
          return false;
        }
    })
  })

function getErrorMessage(data) {
  let errorMessage = data.message;
  $('#error-message').text(errorMessage);
  $('#error-message').show();
}

function createHolidayDict(allHolidays) {
  for (let holiday of allHolidays) {
    let holidayStart = new Date(holiday.start);
    let holidayEnd = new Date(holiday.end);
    let holidayStartFormatted = new Date(holiday.start).toDateString();
    let holidayEndFormatted = new Date(holiday.end).toDateString();
    if (holidayStartFormatted === holidayEndFormatted) {
      let holidayStartDate = holidayStart.toDateString();
      if (holidayStartDate in holidayDict) {
        holidayDict[holidayStartDate].push(holiday);
      } else {
        holidayDict[holidayStartDate] = [];
        holidayDict[holidayStartDate].push(holiday);
      }
    } else { 
        let holidayDate = new Date(holidayStart);
        while (holidayDate <= holidayEnd) {
          holidayDateString = new Date(holidayDate).toDateString();
          if (holidayDateString in holidayDict) {
            holidayDict[holidayDateString].push(holiday);
            
          } else {
            holidayDict[holidayDateString] = [];
            holidayDict[holidayDateString].push(holiday);
            
          }
          holidayDate.setDate(holidayDate.getDate() + 1);
        }     
    }
  }
  return holidayDict;
}


function createDefaultScheduleEvents(allDefaultSchedules, holidayDict) {
  for (let schedule of allDefaultSchedules) {
    let startDate = new Date(schedule.start);
    if (schedule.end == null) {
        const startDateCopy = new Date(startDate);
        const endDate = new Date(startDateCopy);
        endDate.setDate(startDateCopy.getDate() + 730);
        let loop = new Date(startDate);
        while (loop <= endDate) {
          let dayCounter = 0;
            while (dayCounter < (schedule.cycle_duration * 2)) {
              let dailyStartDate = new Date(loop);
              let dailyStartDateCopy = dailyStartDate.toDateString();
              if (dailyStartDateCopy in holidayDict) {
                const holidays = holidayDict[dailyStartDateCopy];
                for (let holiday of holidays) {
                  if (holiday.parent_with === 4) {
                    // show on other parent's calendar
                    
                      const loopCopy = new Date(loop);
                      const newDate = new Date(loop);
                      newDate.setDate(loop.getDate() + 1)
                      const newOtherParentDefaultSchedule = {
                        groupId: 'defaultSchedule',
                        title: 'parenting time',
                        start: loopCopy,
                        end: newDate,
                        allDay: true
                      } 
                      otherParentDefaultSchedules.push(newOtherParentDefaultSchedule);
                    
                  }
                }
              } else if (dayCounter < schedule.cycle_duration) {
                  const loopCopy = new Date(loop);
                  const newDate = new Date(loop);
                  newDate.setDate(loop.getDate() + 1);
                  const newDefaultSchedule = {
                      groupId: 'defaultSchedule',
                      title: 'parenting time',
                      start: loopCopy,
                      end: newDate,
                      allDay: true
                  };
                  defaultSchedules.push(newDefaultSchedule);
              } else if (dayCounter < (schedule.cycle_duration * 2) && 
                  dayCounter >= schedule.cycle_duration && 
                  loop < (endDate - schedule.cycle_duration)) {
                    const loopCopy = new Date(loop);
                    const newDate = new Date(loop);
                    newDate.setDate(loop.getDate() + 1);
                    const newOtherParentDefaultSchedule = {
                      groupId: 'defaultSchedule',
                      title: 'parenting time',
                      start: loopCopy,
                      end: newDate,
                      allDay: true
                  };
                otherParentDefaultSchedules.push(newOtherParentDefaultSchedule);
              }
              loop.setDate(loop.getDate() + 1);
              dayCounter++;
            
          }}
    } else {
        const endDate = new Date(schedule.end);
        let loop = new Date(startDate);
        while (loop <= endDate) {
           let dayCounter = 0;
            while (dayCounter < (schedule.cycle_duration * 2)) {
              let dailyStartDate = new Date(loop);
              let dailyStartDateCopy = dailyStartDate.toDateString();
              // check which parent has parenting time for holiday
              if (dailyStartDateCopy in holidayDict) {
                const holidays = holidayDict[dailyStartDateCopy];
                for (const holiday of holidays) {
                  if (holiday.with_parent === 4) { 
                    const loopCopy = new Date(loop);
                    const newDate = new Date(loop);
                    newDate.setDate(loop.getDate() + 1)
                    const newOtherParentDefaultSchedule = {
                      groupId: 'defaultSchedule',
                      title: 'parenting time',
                      start: loopCopy,
                      end: newDate,
                      allDay: true
                    } 
                    otherParentDefaultSchedules.push(newOtherParentDefaultSchedule);
                  } else if (holiday.with_parent === 3) {
                    const loopCopy = new Date(loop);
                    const newDate = new Date(loop);
                    newDate.setDate(loop.getDate() + 1);
                    const newDefaultSchedule = {
                        groupId: 'defaultSchedule',
                        title: 'parenting time',
                        start: loopCopy,
                        end: newDate,
                        allDay: true
                      }
                  defaultSchedules.push(newDefaultSchedule);
                  // console.log(newDefaultSchedule);
                  }
                }
              }

              else if (dayCounter < schedule.cycle_duration) {
                const loopCopy = new Date(loop);
                const newDate = new Date(loop);
                newDate.setDate(loop.getDate() + 1);
                const newDefaultSchedule = {
                  groupId: 'defaultSchedule',
                  title: 'parenting time',
                  start: loopCopy,
                  end: newDate,
                  allDay: true
                };
                defaultSchedules.push(newDefaultSchedule);
              } else if (dayCounter < (schedule.cycle_duration * 2) && 
                dayCounter >= schedule.cycle_duration && 
                (loop < (endDate - schedule.cycle_duration))) {
                const loopCopy = new Date(loop);
                const newDate = new Date(loop);
                newDate.setDate(loop.getDate() + 1);
                const newOtherParentDefaultSchedule = {
                  groupId: 'defaultSchedule',
                  title: 'parenting time',
                  start: loopCopy,
                  end: newDate,
                  allDay: true
                }
                otherParentDefaultSchedules.push(newOtherParentDefaultSchedule);
              }
              loop.setDate(loop.getDate() + 1);
              dayCounter++;
            }
        };
    };

  }
};

