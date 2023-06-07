
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
    const allEvents = data.all_events;
    const allHolidays = data.all_holidays;
    const allDefaultSchedules = data.all_def_schedules;

    //$(document).ready(function() {
      
      createEventEvents(allEvents);
      createHolidayEvents(allHolidays);
      createHolidayDict(allHolidays);
      createDefaultScheduleEvents(allDefaultSchedules, holidayDict);
      
      $('#calendar').fullCalendar({
        editable: false,
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
          events: events
        },
        {
          events: holidays
        },
        {
          events: defaultSchedules,
          rendering: 'background',
          backgroundColor: '#c2c2d6'  
        }
        ]
      });
    });



function createEventEvents(allEvents) {
  for (let event of allEvents) {
    const newEvent = {
      title: event.label,
      start: event.start,
      end: event.end
    };
    events.push(newEvent);
  }
  return events
}

function createHolidayEvents(allHolidays) {
  for (let holiday of allHolidays) {
      const newHoliday = {
          title: holiday.label,
          start: holiday.start,
          end: holiday.end,
          // display: 'background'
      };
      holidays.push(newHoliday);
  }
  return holidays
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
                  console.log(newDefaultSchedule);
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
}

