const alertDisplay = document.getElementById('alert-display');
// if (alertDisplay.innerHTML === '') {
//     alertDisplay.style.display = 'none';
// }

const messageDisplay = document.getElementById('message-holder');


// this section creates the html elements to hold the 
// file display accordion
//
//                      fileContainer
//                          |
//                      fileDisplay
//                       |        |
//           fileTitleSpace      fileHolder
//                 |				  |
//        fileTitleButton	     fileHolderBody
//                                    |     	     
//                                fileLink
//                               |        |
//                     fileLinkInner    fileDeleteIcon
//
//
const fileContainer = document.getElementById('file-container');

const fileDisplay = document.createElement('div');
fileDisplay.setAttribute('id', 'flush-headingOne');
fileDisplay.setAttribute('class', 'accordion-item');

const fileTitleSpace = document.createElement('h2');
fileTitleSpace.setAttribute('class', 'accordion-header');
fileTitleSpace.setAttribute('id', 'flush-headingOne');

const fileTitleButton = document.createElement('button');    
fileTitleButton.setAttribute('class', 'accordion-button collapsed')
fileTitleButton.setAttribute('type', 'button');
fileTitleButton.setAttribute('data-bs-toggle', 'collapse');
fileTitleButton.setAttribute('data-bs-target', '#flush-collapseOne');
fileTitleButton.setAttribute('aria-expanded', 'false');
fileTitleButton.setAttribute('aria-controls', 'flush-collapseOne');
fileTitleButton.innerHTML = 'Uploaded Files';

const fileHolder = document.createElement('div');
fileHolder.setAttribute('id', 'flush-collapseOne');
fileHolder.setAttribute('class', 'accordion-collapse collapse');
fileHolder.setAttribute('aria-labelledby', 'flush-headingOne');
fileHolder.setAttribute('data-bs-parent', `#listContainer`);

const fileHolderBody = document.createElement('div');
fileHolderBody.setAttribute('class', 'accordion-body');

fileHolder.appendChild(fileHolderBody);

fileTitleSpace.appendChild(fileTitleButton);

fileDisplay.appendChild(fileTitleSpace);
fileDisplay.appendChild(fileHolder);

fileContainer.appendChild(fileDisplay);


document.addEventListener('DOMContentLoaded', function () {
    console.log('in get-upload-info.js')
    fetch(('/api/uploads'))
        .then(existingUploads => {
            console.log(existingUploads);
            return existingUploads.json();
            
        })
        .then(existingUploadsJson => {
            console.log(existingUploadsJson);
            const user = existingUploadsJson.current_user;
            // console.log(user.is_child)
            
            const allFiles = existingUploadsJson['all_files_json'];
            // console.log('all files:', allFiles);
            
            allFiles.forEach(file => {
                const fileId = file.file_id;
                // console.log(fileId);
                const fileLocation = file.location;
                // console.log(fileLocation);
                const fileTitle = file.title;
                // console.log(fileTitle);
                let isChild = false;
                if (user.is_child === true) {
                    isChild = true;
                }
                addFileToDisplay(fileId, fileTitle, fileLocation, isChild);
                // const someDumbShit = document.createElement('li');
                // someDumbShit.innerText = 'this is some dumb shit';
                // fileHolderBody.appendChild(someDumbShit);
            })

            const allLists = existingUploadsJson['all_lists_json'];
            // console.log(allLists);
            const allListElements = existingUploadsJson['all_list_elements_json'];
            // console.log('all elements:', allListElements)

            const currentUser = existingUploadsJson['current_user'];
            // console.log(currentUser);
            // console.log(currentUsername);
            const allMessages = existingUploadsJson['all_messages_json'];
            console.log(allMessages);
            allMessages.sort((a, b) => a.message_id - b.message_id);
            console.log(allMessages);
            allMessages.forEach(message => {
                const content = message.content;
                const username = message.username;
                const submitTime = message.submit_time;
                displayMessages(content, username, submitTime);
            })
            let isChild = false;
            if (user.is_child === true) {
                isChild = true;
            }
            // bring things from allListElements into a new list mapped to the items in allLists
            allLists.forEach(list => {
                // console.log(list);
                // console.log(allListElements);
                const listElements = allListElements.filter(element => element.list_id === list.list_id);
                // console.log(allLists);
                // console.log(allListElements);
                // console.log(listElements);
                // console.log(list.list_id);
                
                // console.log(listElements);
                displayList(list.list_id, list.username, list.title, listElements, isChild)
            })
        

            const newListForm = document.getElementById('new-list');
            newListForm.addEventListener('submit', function(evt) {
                evt.preventDefault();
                const listTitle = document.getElementById('list-title').value;
                // const listElement = document.getElementById('list-element').value;

                // console.log(userId)

                if (listTitle === '') {
                    alertDisplay.innerHTML = 'Please enter a title for the list'
                } else {

                    const listDisplay = {
                        title: listTitle,
                        user_id: currentUser.username
                        // element: listElement
                    }

                    const listTitles = [];
                    listTitles.push(listDisplay)
                    // console.log(listItems)
                    let createListFormData = new FormData(document.getElementById('new-list'))
                    document.getElementById('list-title').value = '';
                    fetch('/create-list', {
                        method: 'POST',
                        body: createListFormData
                    })
                        .then((response) => {
                            return response.json()
                        })
                        .then((responseJson) => {
                            // console.log(responseJson);
                            alertDisplay.innerHTML = responseJson['message']
                            const listId = responseJson['list_id']
                            const username = responseJson['username']
                            let listElements = []
                            const user = responseJson['user']
                            let isChild = false;
                                if (user.is_child === true) {
                                    isChild = true;
                                }
                            console.log(listId, username);
                            displayList(listId, username, listDisplay.title, listElements, isChild);
                        })

                }
            });
        })
    // submitListItemButton.addEventListener('click', function () {
        
    // })
});

const messageSubmit = document.getElementById('new-message-submit')
messageSubmit.addEventListener(('click'), function(evt) {
    evt.preventDefault();
    createMessageFormData = new FormData(document.getElementById('new-message'));
    const submitTime = Math.floor(Date.now()/1000)
    console.log(submitTime);
    
    // console.log(submitTime);
    fetch((`/create-message/${submitTime}`), {
        method: 'POST',
        body: createMessageFormData
    })
        .then((response) => {
            return response.json();
        })
        .then((responseJson) => {
            console.log(responseJson);
            alertDisplay.innerHTML = responseJson['message'];
            const content = responseJson['content'];
            const username = responseJson['username'];
            document.getElementById('inputMessage').value = '';
            displayMessages(content, username, submitTime);
        })
})
// console.log(messageDisplay);
function displayMessages(content, username, submitTime) {
    // timeElapsed is stored in seconds
    const timeElapsed = Math.floor((Date.now()/1000) - submitTime);
    // console.log(timeElapsed);
    let pluralTime = '';
    if (timeElapsed < 60) {
        const timeElapsedSeconds = timeElapsed;
        if (timeElapsedSeconds > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedSeconds} second${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
    }
    else if (timeElapsed >= 60 && timeElapsed <3600) {
        const timeElapsedMinutes = Math.floor((timeElapsed/60));
        // let pluralTime = '';
        if (timeElapsedMinutes > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedMinutes} minute${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
    } 
    else if (timeElapsed >=3600 && timeElapsed < 86400) {
        const timeElapsedHours = Math.floor((timeElapsed/3600));
        // let pluralTime = '';
        if (timeElapsedHours > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedHours} hour${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
    } 
    else if (timeElapsed >= 86400 && timeElapsed < 604800) {
        const timeElapsedDays = Math.floor((timeElapsed/86400));
        // let pluralTime = '';
        if (timeElapsedDays > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedDays} day${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
    }
    else if (timeElapsed >= 604800 && timeElapsed < 2592000) {
        const timeElapsedWeeks = Math.floor((timeElapsed/604800));
        // let pluralTime = '';
        if (timeElapsedWeeks > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedWeeks} week${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
    }
    else if (timeElapsed >= 2592000 && timeElapsed < timeElapsed < 31536000) {
        const timeElapsedMonths = Math.floor((timeElapsed/2592000));
        // let pluralTime = '';
        if (timeElapsedMonths > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedMonths} month${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
    }
    else if (timeElapsed >= 31536000) {
        const timeElapsedYears = Math.floor((timeElapsed/31536000));
        // let pluralTime = '';
        if (timeElapsedYears > 1) {
            pluralTime = 's';
        }
        messageDisplay.innerHTML = messageDisplay.innerHTML + `
        <small>${timeElapsedYears} year${pluralTime} ago - </small><b>${username}</b>:`
        + `<br>${content}` + `<br>`
        
    }
    // messageDisplay.innerHTML = messageDisplay.innerHTML + `
    //     <small>${timeElapsed} seconds ago - </small><b>${username}</b>:`
    //     + `<br>${content}` + `<br>`

}

const fileSubmit = document.getElementById('new-file-submit');
fileSubmit.addEventListener(('click'), function(evt) {
    evt.preventDefault();
    createFileFormData = new FormData(document.getElementById('new-upload'));
    fetch(('/create-file'), {
        method: 'POST',
        body: createFileFormData
    })
        .then((response) => {
            return response.json()
        })
        .then((responseJson) => {
            console.log(responseJson);
            alertDisplay.innerHTML = responseJson['message'];
            const fileId = responseJson['file_id'];
            const fileTitle = responseJson['file_title'];
            const fileLocation = responseJson['file_location'];
            const user = responseJson['user'];
            // console.log(user);
            console.log(user.is_child);
            let isChild = false;
            if (user.is_child === true) {
                isChild = true;
            }
            // console.log(isChild);

            addFileToDisplay(fileId, fileTitle, fileLocation, isChild);
            
        })
})


function addFileToDisplay(fileId, fileTitle, fileLocation, isChild) {
    console.log(fileId, fileTitle, fileLocation, isChild);
    const fileLink = document.createElement('p');
    fileLink.setAttribute('id', fileId);

    const fileLinkInner = document.createElement('a');
    fileLinkInner.setAttribute('href', fileLocation);
    fileLinkInner.innerHTML = `${fileTitle} `
    // fileLink.innerHTML = `<a href='${fileLocation}'>${fileTitle}</a>`;
    if (isChild === false) {
        fileDeleteIcon = document.createElement('i');
        fileDeleteIcon.setAttribute('class', 'fa-solid fa-xmark delete-icon');

        fileDeleteIcon.addEventListener(('click'), function(evt) {
            evt.preventDefault();
            const targetFile = evt.target.closest('p')
            const targetFileId = targetFile.id
            console.log(targetFileId);
            const confirmed = confirm('Are you sure you wish to delete this?')
            console.log('316', confirmed);
            if (confirmed) {
                
                fetch((`/delete-file/${targetFileId}`), {
                    method: 'DELETE'
                })
                    .then((response) => {
                        return response.json();
                    })
                    .then((responseJson) => {
                        console.log(responseJson);
                        alertDisplay.innerHTML = responseJson['message']
                        if (responseJson['success']) {
                            targetFile.remove();
                        }
                    })
            }
        })
    }


    fileLink.appendChild(fileLinkInner);
    if (isChild === false) {
        fileLink.appendChild(fileDeleteIcon);
    }
    fileHolderBody.appendChild(fileLink);
    // console.log('fileLink added')
    // console.log(fileLink, fileLinkInner);
}

// this function creates the html elements for the list display
// accordion, and takes in new input for it
//
//                      listContainer
//                          |
//                      listDisplay
//                          |
//          listTitle   -----------   listElementHolder
//                  |				        |
//      listTitleButton	      -----listElementHolderBody------
//                            |	             |     	         |
//                (prepend)-->|	             |     	         |
//                      listElement	  listItemForm     listDeleteButton
//                       |     	      |  	     |
//               deleteIcon    inputListItem   submitListItemButton
//
//

function displayList(listId, username, displayedTitle, elements, isChild) {

    const listContainer = document.getElementById('list-container');

    const listDisplay = document.createElement('div');
    listDisplay.setAttribute('id', listId);
    listDisplay.setAttribute('class', 'accordion-item');

    const listTitle = document.createElement('h2');
    listTitle.setAttribute('class', 'accordion-header');
    listTitle.setAttribute('id', `flush-headingOne-${listId}`)

    const listTitleButton = document.createElement('button');
    listTitleButton.setAttribute('class', 'accordion-button collapsed')
    listTitleButton.setAttribute('type', 'button');
    listTitleButton.setAttribute('data-bs-toggle', 'collapse');
    listTitleButton.setAttribute('data-bs-target', `#flush-collapseOne-${listId}`);
    listTitleButton.setAttribute('aria-expanded', 'false');
    listTitleButton.setAttribute('aria-controls', `flush-collapseOne-${listId}`);
    listTitleButton.innerText = `${displayedTitle} - added by ${username}`;

    // const listTitleDisplayed = document.createElement('p')
    // listTitleDisplayed.innerText = `${displayedTitle} - added by ${username}`;
    
    const listElementHolder = document.createElement('div');
    listElementHolder.setAttribute('id', `flush-collapseOne-${listId}`);
    listElementHolder.setAttribute('class', 'accordion-collapse collapse');
    listElementHolder.setAttribute('aria-labelledby', `flush-headingOne-${listId}`);
    listElementHolder.setAttribute('data-bs-parent', `#listContainer`);

    const listElementHolderBody = document.createElement('div');
    listElementHolderBody.setAttribute('class', 'accordion-body')
    
    const listItemForm = document.createElement('form');
    listItemForm.setAttribute('action', '/add-to-list')
    listItemForm.setAttribute('method', 'POST')
    listItemForm.setAttribute('id', `new-list-element${listId}`)
    
    const inputListItem = document.createElement('input');
    inputListItem.setAttribute('type', 'text');
    inputListItem.setAttribute('id', 'list-element');
    inputListItem.setAttribute('name', 'list-element');
    inputListItem.setAttribute('placeholder', 'new item...');
    // inputListItem.setAttribute('display', 'inline');

    const submitListItemButton = document.createElement('input');
    submitListItemButton.setAttribute('type', 'submit');
    submitListItemButton.setAttribute('id', 'list-element-submit');
    submitListItemButton.setAttribute('value', 'Add to List');

    submitListItemButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        const listItem = evt.target.closest('.accordion-item');
        const clickedListId = listItem.id;
        const newListElementData = new FormData(document.getElementById(`new-list-element${listId}`));
        inputListItem.value = '';
        fetch(`/add-to-list/${clickedListId}`, {
            method: 'POST',
            body: newListElementData
        })
            .then((newElement => {
                return newElement.json()
            }))
            .then((newElementJson) => {
                console.log(newElementJson);
                alertDisplay.innerHTML = newElementJson['message'];
                const newListElement = document.createElement('li');
                newListElement.setAttribute('id', newElementJson['list_element_id'])
                newListElement.innerHTML = `
                    <span>${newElementJson['content']}</span>
                `;
                console.log(isChild);
                if (isChild === false) {
                    newListElement.innerHTML = `
                        <span>${newElementJson['content']}</span>
                        <i class="fa-solid fa-xmark delete-icon"></i>
                    `;
                    const deleteIcon = newListElement.querySelector(`.delete-icon`);
                    deleteIcon.addEventListener(('click'), function(evt) {
                        evt.preventDefault();                    
                        const listItem = evt.target.closest('li');
                        const listItemId = listItem.id
                        console.log(listItemId);
                        const confirmed = confirm('Are you sure you wish to delete this?')
                        // console.log('316', confirmed);
                        if (confirmed) {
                            listItem.remove();
                            fetch((`/delete-list-element/${newListElement.id}`), {
                                method: 'DELETE'
                            })
                                .then((response) => {
                                    return response.json();
                                })
                                .then(responseJson => {
                                    console.log(responseJson);
                                    alertDisplay.innerHTML = responseJson['message'];
                                })
                        }
                    });
                }
                listElementHolderBody.prepend(newListElement);
            })
    })
    // console.log(isChild);
    const listDeleteButton = document.createElement('button');
    if (isChild === false) {
        
        listDeleteButton.setAttribute('id', `delete-button-${listId}`);
        listDeleteButton.setAttribute('class', 'btn btn-outline-danger');
        listDeleteButton.innerHTML = 'Delete list';

        listDeleteButton.addEventListener('click', function (evt) {
            evt.preventDefault()
            const listToDelete = evt.target.closest('.accordion-item')
            const clickedListId = listToDelete.id
            const confirmed = confirm('Are you sure you want to delete this list?')
            if (confirmed) {
                fetch((`/delete-list/${clickedListId}`), {
                    method: 'DELETE'
                })
                    .then((response) => {
                        return response.json()
                    })
                    .then((responseJson) => {
                        alertDisplay.innerHTML = responseJson['message'];
                        if (responseJson['success']) {
                            listToDelete.remove();
                        }
                    })
            
            }
        })
    }
    
    // const formAsListItem = document.createElement('li');
    // formAsListItem.setAttribute('display', 'inline')

    listItemForm.appendChild(inputListItem);
    listItemForm.appendChild(submitListItemButton);

    // formAsListItem.appendChild(listItemForm);

    listElementHolderBody.appendChild(listItemForm);

    elements.forEach((item) => {
        const listElement = document.createElement('li');
        listElement.setAttribute('id', item.list_element_id)
        listElement.innerHTML = `
            <span>${item.content}</span>
        `;
        console.log(isChild)
        if (isChild === false) {
            listElement.innerHTML = `
                <span>${item.content}</span>
                <i class="fa-solid fa-xmark delete-icon"></i>
            `
            const deleteIcon = listElement.querySelector(`.delete-icon`);
            deleteIcon.addEventListener(('click'), function(evt) {
                evt.preventDefault();
                const listItem = evt.target.closest('li');
                const listItemId = listItem.id
                // console.log(listItemId);
                const confirmed = confirm('Are you sure you wish to delete this?')
                // console.log('316', confirmed);
                if (confirmed) {
                    
                    fetch((`/delete-list-element/${listItemId}`), {
                        method: 'DELETE'
                    })
                        .then((response) => {
                            return response.json();
                        })
                        .then((responseJson) => {
                            console.log(responseJson);
                            alertDisplay.innerHTML = responseJson['message'];
                            console.log(responseJson);
                            if (responseJson['success']) {
                                listItem.remove();
                            }
                        })
                }
            });
        }
        // can queryselector on parent containers
        // console.log(item.list_element_id);
        // listElement.insertAdjacentHTML('beforeend', deleteIcon)
        listElementHolderBody.prepend(listElement);
    });

    
    // console.log(Array.from(deleteIcons));
    // Array.from(deleteIcons).forEach((deleteIcon)
    console.log(isChild);
    if (isChild === false) {
        listElementHolderBody.appendChild(listDeleteButton);
    }
    listElementHolder.appendChild(listElementHolderBody);

    // listTitleButton.appendChild(listTitleDisplayed);

    listTitle.appendChild(listTitleButton);

    listDisplay.appendChild(listTitle);
    listDisplay.appendChild(listElementHolder);

    listContainer.appendChild(listDisplay);
    

}