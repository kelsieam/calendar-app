
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

    //$(document).ready(function() {
      let events = [];
      for (let event of allEvents) {
        const newEvent = {
          title: event.label,
          start: event.start,
          end: event.end
        };
        events.push(newEvent);
      }

      let holidays = [];
      let holidayDict = {};
      for (let holiday of allHolidays) {
          const newHoliday = {
              title: holiday.label,
              start: holiday.start,
              end: holiday.end,
              // display: 'background'
          };
          holidays.push(newHoliday);
          let holidayStart = new Date(holiday.start);
          let holidayStartDate = holidayStart.toDateString();
          holidayDict[holidayStartDate] = holiday;

      }
      console.log(holidayDict);
      
      let defaultSchedules = [];
      for (let schedule of allDefaultSchedules) {
          // console.log(allDefaultSchedules);
          let startDate = new Date(schedule.start);
          if (schedule.end == null) {
              const startDateCopy = new Date(startDate);
              const endDate = new Date(startDateCopy);
              endDate.setDate(startDateCopy.getDate() + 730);
              let loop = new Date(startDate);
              // let loopCounter = 0;
              while (loop <= endDate) {
                let dayCounter = 0; 
                // console.log(loopCounter, 'a');
                  while (dayCounter < (schedule.cycle_duration * 2)) {
                    // console.log('b')
                    let dailyStartDate = new Date(loop);
                    let dailyStartDateCopy = dailyStartDate.toDateString();
                    // console.log(dailyStartDateCopy);
                    if (dailyStartDateCopy in holidayDict && 
                      holidayDict[dailyStartDateCopy].with_parent === 4) {
                        
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
                        // console.log(defaultSchedules);
                    }
                    loop.setDate(loop.getDate() + 1);
                    // console.log(loop)
                    dayCounter++;
                  };
                  // console.log("end", loop)
                  // loopCounter += 1;
                }


              } else {
              const endDate = new Date(schedule.end);
              let loop = new Date(startDate);
              
              while (loop <= endDate) {
                 let dayCounter = 0;
                // console.log('c')
                  while (dayCounter < (schedule.cycle_duration * 2)) {
                    // console.log('d');
                    let dailyStartDate = new Date(loop);
                    let dailyStartDateCopy = dailyStartDate.toDateString();
                    console.log(dailyStartDateCopy);
                    if (dailyStartDateCopy in holidayDict && 
                      holidayDict[dailyStartDateCopy].with_parent === 4) {
                        // draw schedule for other parent
                    }
                    else if (dailyStartDateCopy in holidayDict && 
                      holidayDict[dailyStartDateCopy].with_parent === 3) {
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
        // AFter you've built default schedules
        //Build a dictionary: {'2023-05-30': event}




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






