console.log('get-info.js')

// const holidayButton = document.querySelector('#holidays input[type="submit"]');
// const changeDefaultScheduleInputs = document.getElementsByName('change-default-schedule')
// const defaultScheduleSection = document.getElementById('change-default-schedule');

// changeDefaultScheduleInputs.forEach(radioInput => {
//     radioInput.addEventListener('change', handleRadioChange);
// });



// function handleRadioChange(event) {
//     console.log(event.target.id, event.target.value);
    
//     if (this.value === 'true') {
//       // defaultScheduleSection.style.display = 'block';  // show
//       defaultScheduleSection.querySelectorAll('input, select, textarea').forEach(field => {
//         field.setAttribute('required', true); // makes it required if yes button checked
//       });

//     } else {
//       // defaultScheduleSection.style.display = 'none';   // hide
//       defaultScheduleSection.querySelectorAll('input, select, textarea').forEach(field => {
//         field.removeAttribute('required'); // makes it not required if yes button not checked
//       });
//     }

// }

// const parentingScheduleButton = document.getElementById('parenting-schedule-submit');
// parentingScheduleButton.addEventListener(('click'), function(evt) {
//     evt.preventDefault();
//     const createPSFormData = new FormData(document.getElementById('parenting-schedule'));
//     fetch(('/create-parenting-schedule'), {
//         body: createPSFormData,
//         method: 'POST'
//     })
//         .then((response) => {
//             return response.json();
//         })
//         .then((responseJson) => {
//             console.log(responseJson);

//         })
// })
