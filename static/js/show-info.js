
// let allEvents = [];
// let allHolidays = [];
// let allDefaultSchedules = [];
let events = [];
let holidays = [];
let defaultSchedules = [];
let otherParentDefaultSchedules = [];
let holidayDict = {};

fetch('/api/sampledata')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // console.log(data)
    const allEvents = data.all_events;
    const allHolidays = data.all_holidays;
    const allDefaultSchedules = data.all_def_schedules;
    const allUsers = data.all_users;

    //$(document).ready(function() {
      
      events = allEvents.map(x => ({
        title: x.label,
        start: x.start,
        end: x.end,
        url: `/event/${x.event_id}`,
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
        extendedProps: {
          methods: ['DELETE', 'PATCH']
        }
      })
      )
      
      // createEventEvents(allEvents);
      // createHolidayEvents(allHolidays);
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
          events: events
        },
        {
          events: holidays,
          editable: true,
          color: '#378006'
        },
        {
          events: defaultSchedules,
          rendering: 'background',
          backgroundColor: '#c2c2d6',
        },
        {
          events: otherParentDefaultSchedules,
          rendering: 'background',
          backgroundColor: '#ffcc99'
        }
        ],
        
        eventClick: function(info) {
          // console.log(info);
          $('#eventModal').modal('show');
          let url = info['url'];
          // console.log(url);
          let eventOrHoliday = url.split('/').slice(-2, -1)[0]
          // console.log(eventOrHoliday)
          let id = url.split('/').pop(); // id is what's after the / in the url field
          // console.log(id);
          let changeEventForm = document.getElementById('changeEventForm');
          
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
                if (responseJson.success) {
                  $('#eventModal').modal('hide');
                } else {
                  getErrorMessage(responseJson);
                }
              });
          });

          let deleteButton = document.getElementById('delete-button');
          deleteButton.addEventListener('click', function() {
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
              }
              loop.setDate(loop.getDate() + 1);
              dayCounter++;
            };
          }
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

