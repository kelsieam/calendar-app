
// let allEvents = [];
// let allHolidays = [];
// let allDefaultSchedules = [];
let events = [];
let holidays = [];
let defaultSchedules = [];
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
          editable: true,
          events: holidays,
          color: '#378006'
        },
        {
          events: defaultSchedules,
          rendering: 'background',
          backgroundColor: '#c2c2d6'  
        }
        ],
        eventClick: function(info) {
          console.log(info);
          if (confirm("Do you want to delete this event?")) {
            fetch(info.url, {
              method: 'DELETE'
              
            })
            $('#calendar').fullCalendar('removeEvents', info._id);
          } else {
            alert('Edit event: ' + info.title);
          } 
          return false;
        }
    })
  })



// function mapEventsToFullCalendar(events) {
//   return events.map(x => ({
//     title: x.label,
//     start: x.start,
//     end: x.end,
//     url: `/delete-event/${x.event_id}`
//   }) 
//   )
// }

// function createEventEvents(allEvents) {
//   for (let event of allEvents) {
//       const newEvent = {
//           title: event.label,
//           start: event.start,
//           end: event.end,
//           url: `/delete-event/${event.event_id}`
//       };
//       events.push(newEvent);
//   }
//   return events;
// }

// function createHolidayEvents(allHolidays) {
//   for (let holiday of allHolidays) {
//       const newHoliday = {
//           title: holiday.label,
//           start: holiday.start,
//           end: holiday.end,
//           url: `/delete-holiday/${holiday.holiday_id}`
//           // display: 'background'
//       };
//       holidays.push(newHoliday);
//   }
//   return holidays;
// }

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
                    // share with other parent's calender
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
              };
              loop.setDate(loop.getDate() + 1);
              dayCounter++;
            }
        };
    };

  }
};

