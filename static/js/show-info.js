
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
                end: holiday.end,
                // display: 'background'
            };
            holidays.push(newHoliday);
        }
        
        let defaultSchedules = []
        for (let schedule of allDefaultSchedules) {
            // console.log(allDefaultSchedules);
            let startDate = new Date(schedule.start);
            if (schedule.end == null) {
                const startDateCopy = new Date(startDate);
                const endDate = new Date(startDateCopy);
                endDate.setDate(startDateCopy.getDate() + 730);
                console.log(endDate);
                let loop = new Date(startDate);
                let cycleDurationCounter = 0;
                while (loop <= endDate) {
                    // console.log(loop);
                    if (cycleDurationCounter % 2 === 0){
                        const loopCopy = new Date(loop);
                        const newDate = new Date(loop);
                        newDate.setDate(loop.getDate() + schedule.cycle_duration);
                        const newDefaultSchedule = {
                            groupId: 'defaultSchedule',
                            title: 'parenting time',
                            start: loopCopy,
                            end: newDate,
                            // rendering: 'background',
                            // color: '#cc99ff'
                            allDay: true
                        };
                        defaultSchedules.push(newDefaultSchedule);
                        // console.log(defaultSchedules);
                    }
                    loop.setDate(loop.getDate() + schedule.cycle_duration);
                    cycleDurationCounter++;
    
                }
            } else {
                const endDate = new Date(schedule.end);
                let loop = new Date(startDate);

                let cycleDurationCounter = 0;
                while (loop <= endDate) {
                    // console.log(loop);
                    if (cycleDurationCounter % 2 === 0){
                        const loopCopy = new Date(loop);
                        const newDate = new Date(loop);
                        newDate.setDate(loop.getDate() + schedule.cycle_duration);
                        const newDefaultSchedule = {
                            groupId: 'defaultSchedule',
                            title: 'parenting time',
                            start: loopCopy,
                            end: newDate,
                            allDay: true
                        };
                        defaultSchedules.push(newDefaultSchedule);
                    };
                    loop.setDate(loop.getDate() + schedule.cycle_duration);
                    cycleDurationCounter++;
    
                };
            };

        }

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


    });

function checkForHolidays(listOfDates, listOfHolidays) {
  for (let date in listOfDates) {
    if (date in listOfHolidays) {
      return date
    }
  }
}




let defaultSchedules = []
for (let schedule of allDefaultSchedules) {
    // console.log(allDefaultSchedules);
    let startDate = new Date(schedule.start);
    if (schedule.end == null) {
        const startDateCopy = new Date(startDate);
        const endDate = new Date(startDateCopy);
        endDate.setDate(startDateCopy.getDate() + 730);
        console.log(endDate);
        let loop = new Date(startDate);
        let cycleDurationCounter = 0;
        while (loop <= endDate) {
            // console.log(loop);
            if (cycleDurationCounter % 2 === 0){
                const loopCopy = new Date(loop);
                const newDate = new Date(loop);
                newDate.setDate(loop.getDate() + schedule.cycle_duration);
                const newDefaultSchedule = {
                    groupId: 'defaultSchedule',
                    title: 'parenting time',
                    start: loopCopy,
                    end: newDate,
                    // rendering: 'background',
                    // color: '#cc99ff'
                    allDay: true
                };
                defaultSchedules.push(newDefaultSchedule);
                // console.log(defaultSchedules);
            }
            loop.setDate(loop.getDate() + schedule.cycle_duration);
            cycleDurationCounter++;

        }
    } else {
        const endDate = new Date(schedule.end);
        let loop = new Date(startDate);
        let cycleDurationCounter = 0;
        while (loop <= endDate) {
            // console.log(loop);
            if (cycleDurationCounter % 2 === 0){
                const loopCopy = new Date(loop);
                const newDate = new Date(loop);
                newDate.setDate(loop.getDate() + schedule.cycle_duration);
                const newDefaultSchedule = {
                    groupId: 'defaultSchedule',
                    title: 'parenting time',
                    start: loopCopy,
                    end: newDate,
                    allDay: true
                };
                defaultSchedules.push(newDefaultSchedule);
            };
            loop.setDate(loop.getDate() + schedule.cycle_duration);
            cycleDurationCounter++;

        };
    };

}









