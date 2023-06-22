document.addEventListener('DOMContentLoaded', function () {
    console.log('in get-upload-info.js')
    fetch(('/api/uploads'))
        .then(existingUploads => {
            return existingUploads.json()
        })
        .then(existingUploadsJson => {
            console.log(existingUploadsJson);
            const allFiles = existingUploadsJson['all_files_json'];
            console.log('all files:', allFiles);
            allFiles.forEach(file => {
                const fileId = file.file_id;
                // console.log(fileId);
                const fileLocation = file.location;
                // console.log(fileLocation);
                const fileTitle = file.title;
                // console.log(fileTitle);
                displayFiles(fileId, fileTitle, fileLocation);
            })

            const allLists = existingUploadsJson['all_lists_json'];
            const allListElements = existingUploadsJson['all_list_elements_json'];
            // console.log('all elements:', allListElements)

            const currentUser = existingUploadsJson['current_user'];
            // console.log(currentUsername);

            // bring things from allListElements into a new list mapped to the items in allLists
            allLists.forEach(list => {
                
                const listElements = allListElements.filter(element => element.list_id === list.list_id)
                // console.log(allLists);
                // console.log(allListElements);
                // console.log(listElements);
                // console.log(list.list_id);

                displayList(list.list_id, list.username, list.title, listElements)
            })
        

            const newListForm = document.getElementById('new-list');
            newListForm.addEventListener('submit', function(evt) {
                evt.preventDefault();
                const listTitle = document.getElementById('list-title').value;
                // const listElement = document.getElementById('list-element').value;

                // console.log(userId)

                if (listTitle === '') {
                    document.getElementById('create-list-success').
                        innerHTML = 'Please enter a title for the list'
                } else {

                    // const listDisplay = {
                    //     title: listTitle,
                    //     user_id: currentUser.username
                    //     // element: listElement
                    // }

                    // const listTitles = [];
                    // listTitles.push(listDisplay)
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
                            document.getElementById('create-list-success').innerHTML = responseJson['message']
                            // console.log(document.getElementById('create-list-success').innerHTML)
                            const listId = responseJson['list_id']
                            const username = responseJson['username']
                            let listElements = []
                            // console.log(listId, username);
                            displayList(listId, username, listDisplay.title, listElements);
                        })

                }
            });
        })
    // submitListItemButton.addEventListener('click', function () {
        
    // })

});

function displayFiles(fileId, fileTitle, fileLocation) {
    console.log(fileId, fileTitle, fileLocation);

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
    fileTitleButton.setAttribute('data-bs-target', 'flush-collapseOne');
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

    const fileLink = document.createElement('p');
    fileLink.setAttribute('id', fileId);
    fileLink.innerHTML = `<a href='${fileLocation}'>${fileTitle}</a>`;

    fileHolderBody.appendChild(fileLink);

    fileHolder.appendChild(fileHolderBody);

    fileTitleSpace.appendChild(fileTitleButton);

    fileDisplay.appendChild(fileTitleSpace);
    fileDisplay.appendChild(fileHolder);

    fileContainer.appendChild(fileDisplay);

}

function displayList(listId, username, displayedTitle, elements) {
    // console.log(listId);
    const listContainer = document.getElementById('list-container');

    const listDisplay = document.createElement('div');
    listDisplay.setAttribute('id', listId);
    listDisplay.setAttribute('class', 'accordion-item');

    const listTitle = document.createElement('h2');
    listTitle.setAttribute('class', 'accordion-header');
    listTitle.setAttribute('id', `flush-headingOne-${listId}`)
    // listTitle.innerText = `${displayedTitle} - added by ${username}`;

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
                document.getElementById('create-list-success').innerHTML = newElementJson['message'];
                const newListElement = document.createElement('li');
                newListElement.setAttribute('id', newElementJson['list_element_id'])
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
                    listItem.remove();
                    fetch((`/delete-list-element/${newListElement.id}`), {
                        method: 'DELETE'
                    })
                        .then((response) => {
                            return response.json();
                        })
                        .then(responseJson => {
                            console.log(responseJson);
                            document.getElementById('create-list-success').innerHTML = responseJson['message'];
                        })
                });
                listElementHolderBody.appendChild(newListElement);
            })
    })

    const listDeleteButton = document.createElement('button');
    listDeleteButton.setAttribute('id', `delete-button-${listId}`);
    listDeleteButton.setAttribute('class', 'btn btn-outline-danger');
    listDeleteButton.innerHTML = 'Delete list';

    listDeleteButton.addEventListener('click', function (evt) {
        evt.preventDefault()
        const listToDelete = evt.target.closest('.accordion-item')
        const clickedListId = listToDelete.id
        fetch((`/delete-list/${clickedListId}`), {
            method: 'DELETE'
        })
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                document.getElementById('create-list-success').innerHTML = responseJson['message'];
                // somehow delete the html elements for this   .remove removes node and all children
                listToDelete.remove()
            })
    })
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
            <i class="fa-solid fa-xmark delete-icon"></i>
        `
        
        const deleteIcon = listElement.querySelector(`.delete-icon`);
        deleteIcon.addEventListener(('click'), function(evt) {
            evt.preventDefault();
            const listItem = evt.target.closest('li');
            const listItemId = listItem.id
            console.log(listItemId);
            listItem.remove();
            fetch((`/delete-list-element/${listItemId}`), {
                method: 'DELETE'
            })
                .then((response) => {
                    return response.json();
                })
                .then((responseJson) => {
                    console.log(responseJson);
                    document.getElementById('create-list-success').innerHTML = responseJson['message'];
                })
        });
    
        // can queryselector on parent containers
        // console.log(item.list_element_id);
        // listElement.insertAdjacentHTML('beforeend', deleteIcon)
        listElementHolderBody.appendChild(listElement);
    });

    
    // console.log(Array.from(deleteIcons));
    // Array.from(deleteIcons).forEach((deleteIcon)
    

    listElementHolderBody.appendChild(listDeleteButton);

    listElementHolder.appendChild(listElementHolderBody);

    // listTitleButton.appendChild(listTitleDisplayed);

    listTitle.appendChild(listTitleButton);

    listDisplay.appendChild(listTitle);
    listDisplay.appendChild(listElementHolder);

    listContainer.appendChild(listDisplay);
    
    // const deleteIcons = listElementHolderBody.getElementsByClassName('delete-icon');
    // console.log(deleteIcons);
    // for (const deleteIcon of deleteIcons) {
    //     console.log(deleteIcon);
    //     deleteIcon.addEventListener('click', function (evt) {
    //         evt.preventDefault();
    //         const listItem = evt.target.closest('li');
    //         const listItemId = listItem.id
    //         console.log(listItemId);
    //         listItem.remove();
    //         fetch((`/delete-list-element/${listItemId}`), {
    //             method: 'DELETE'
    //         })
    //             .then((response) => {
    //                 return response.json();
    //             })
    //             .then((responseJson) => {
    //                 console.log(responseJson);
    //                 document.getElementById('create-list-success').innerHTML = responseJson['message'];
    //             }); 
    //     });  
    // }
}