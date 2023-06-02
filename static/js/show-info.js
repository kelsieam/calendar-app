
let allEvents = [];
let allHolidays = [];
let allDefaultSchedules = [];


fetch('/api/sampledata')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    allEvents = data.all_events;
    allHolidays = data.all_holidays;
    allDefaultSchedules = data.all_def_schedules;

    $(document).ready(function() {
        let events = []
        for (let event of allEvents) {
          const newEvent = {
            title: event.label,
            start: event.start,
            end: event.end
          };
          events.push(newEvent);
        }
      
        let holidays = []
        for (let holiday of allHolidays) {
            const newHoliday = {
                title: holiday.label,
                start: holiday.start,
                end: holiday.end
            };
            holidays.push(newHoliday);
        }
        
        let defaultSchedules = []
        for (let schedule of allDefaultSchedules) {
            let startDate = new Date(schedule.start);
            let endDate = new Date(schedule.end);
            let loop = new Date(startDate);

            let cycleDurationCounter = 0;
            while (loop <= endDate) {
                if (cycleDurationCounter % 2 === 0){
                    const newDate = new Date(loop);
                    newDate.setDate(loop.getDate() + schedule.cycle_duration)
                    const newDefaultSchedule = {
                        title: 'parenting time',
                        start: loop,
                        end: newDate
                    };
                    defaultSchedules.push(newDefaultSchedule);
                    console.log(defaultSchedules);
                }
                loop.setDate(loop.getDate() + schedule.cycle_duration)
                cycleDurationCounter++;

            }  
        }

        $('#calendar').fullCalendar({
          editable: true,
          selectable: true,
          eventLimit: true,
          eventSources: [
            {
                events: [
                    {
                      title: 'Event 1',
                      startRecur: '2023-06-01',
                      endRecur: '2023-06-08'
                    //   daysOfWeek: [0, 1, 2],

                    },
                ]
            },
          {
            events: events
          },
          {
            events: holidays
          },
          {
            events: defaultSchedules
          }
          ]
        });
      });


    });









// const eventButton = document.getElementById('event-button');
// const eventList = document.getElementById('event-list')

// eventButton.addEventListener(('click'), () => {
//     eventList.innerHTML = '';
    
//     for (let event of allEvents) {
//         const eventLabel = event.label;
//         const eventStart = new Date(event.start);
//         const formattedEventStart = eventStart.toLocaleString('en-US', {
//             month: 'numeric',
//             day: 'numeric',
//             hour: 'numeric',
//             year: '2-digit',
//             hour12: true
//         });
//         const eventEnd = event.end;
//         const eventShared = event.shared;
//         const eventDescription = event.description;
//         const eventWithParent = event.with_parent;
//         const eventListItem = document.createElement('li');
//         eventListItem.textContent = `${eventLabel}: ${formattedEventStart}`;
//         eventList.appendChild(eventListItem);
//     }

// });

// const holidayButton = document.getElementById('holiday-button');
// const holidayList = document.getElementById('holiday-list')

// holidayButton.addEventListener(('click'), () => {
//     holidayList.innerHTML = '';
    
//     for (let holiday of allHolidays) {
//         const holidayLabel = holiday.label;
//         const holidayStart = new Date(holiday.start);
//         const formattedHolidayStart = holidayStart.toLocaleString('en-US', {
//             month: 'numeric',
//             day: 'numeric',
//             hour: 'numeric',
//             hour12: true
//         });
//         const holidayEnd = holiday.end;
       
//         const holidayDescription = holiday.description;
//         const holidayWithParent = holiday.with_parent;
//         const holidayListItem = document.createElement('li');
//         holidayListItem.textContent = `${holidayLabel}: ${formattedHolidayStart}`;
//         eventList.appendChild(holidayListItem);
//     }

// });

// const defaultScheduleButton = document.getElementById('default-schedule-button');
// const defaultScheduleList = document.getElementById('default-schedule-list')

// defaultScheduleButton.addEventListener(('click'), () => {
//     defaultScheduleList.innerHTML = '';
    
//     for (let schedule of allDefaultSchedules) {
//         const scheduleParentStart = schedule.parent_start ? "Parent A": "Parent B";
//         const scheduleStart = new Date(schedule.start);
//         const formattedScheduleStart = scheduleStart.toLocaleString('en-US', {
//             month: 'numeric',
//             day: 'numeric',
//             hour: 'numeric',
//             hour12: true
//         });
//         const scheduleEnd = schedule.end;
//         const scheduleCycleDuration = schedule.cycle_duration;
//         const defaultScheduleListItem = document.createElement('li');
//         defaultScheduleListItem.textContent = `default schedule: 
//             ${scheduleParentStart} - ${formattedScheduleStart}`;
//         eventList.appendChild(defaultScheduleListItem);
//     }

// });


//     const eventList = document.getElementById('eventList');
    
//     events.all_events.forEach((event) => {
//         const label = event.label;
//         const listItem = document.createElement('li');
//         listItem.textContent = label;
//         eventList.appendChild(listItem);

//         });
//         });
