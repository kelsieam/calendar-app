console.log('get-info.js')

// const holidayButton = document.querySelector('#holidays input[type="submit"]');
const changeDefaultScheduleInputs = document.getElementsByName('change-default-schedule')
const defaultScheduleSection = document.getElementById('change-default-schedule');

changeDefaultScheduleInputs.forEach(radioInput => {
    radioInput.addEventListener('change', handleRadioChange)
});



function handleRadioChange(event) {
    console.log(event.target.id, event.target.value);
    if (this.value === 'true') {
      defaultScheduleSection.style.display = 'block';  // show
    } else {
      defaultScheduleSection.style.display = 'none';   // hide
    }

}

