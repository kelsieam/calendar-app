document.addEventListener('DOMContentLoaded', function() {
    console.log('in get-upload-info.js')
    const newListForm = document.getElementById('new-list');
    const listItems = [];
    const userId = document.getElementById('username').innerText;
    // fetch(urlForChange, {
    //     method: 'PATCH',
    //     body: changeEventFormData
    //   })
    //     .then(function(response) {
    //       return response.json();
    //     })
    //     .then(function(responseJson) {
    //       console.log(responseJson)

    newListForm.addEventListener('submit', function(evt) {
        evt.preventDefault();
        // fetch('/user-family-info', {
        //     method: 'GET'
        // })
        // .then(function(response) {
        //     return response.json()
        // })
        // .then(function(responseJson) {
        //     console.log(responseJson)
        // })
        const listTitle = document.getElementById('list-title').value;
        // const listElement = document.getElementById('list-element').value;
        
        // console.log(userId)

        if (listTitle === '') {
            document.getElementById('create-list-success').innerHTML = 'Please enter a title for the list'
        } else {
        
        const listItem = {
            title: listTitle,
            user_id: userId
            // element: listElement
        }
        listItems.push(listItem)
        // console.log(listItems)
        let createListFormData = new FormData(document.getElementById('new-list'))
        fetch('/create-list', {
            method: 'POST',
            body: createListFormData
        })
        .then((response) => {
            return response.json()
        })
        .then((responseJson) => {
            console.log(responseJson);
            document.getElementById('create-list-success').innerHTML = responseJson['message']
            // console.log(document.getElementById('create-list-success').innerHTML)
            
        })
        displayLists();
    }
    });
    
    function displayLists() {
        const listContainer = document.getElementById('list-container');
        console.log(listContainer);
        listContainer.innerHTML = '';

        listItems.forEach(function(item) {
            const listItemElement = document.createElement('h6');
            listItemElement.innerText = `${item.title} - added by ${userId}`;
            listContainer.appendChild(listItemElement);
        });
    }

});