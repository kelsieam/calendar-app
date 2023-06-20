document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("add-list-element").style.display = "none";
    console.log('in get-upload-info.js')
    fetch(('/api/uploads'))
        .then(existingUploads => {
            return existingUploads.json()
        })
        .then(existingUploadsJson => {
            console.log(existingUploadsJson);
            const allFiles = existingUploadsJson['all_files_json'];

            const allLists = existingUploadsJson['all_lists_json'];

            console.log(allLists);

            const allListElements = existingUploadsJson['all_list_elements_json'];
            console.log('all elements:', allListElements)

            const currentUser = existingUploadsJson['current_user'];
            // console.log(currentUsername);

            // bring things from allListElements into a new list mapped to the items in allLists
            allLists.forEach(list => {
                
                const listElements = allListElements.filter(element => element.list_id === list.list_id)
                // console.log(allLists);
                // console.log(allListElements);
                console.log(listElements);
                console.log(list.list_id);

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

                    const listDisplay = {
                        title: listTitle,
                        user_id: currentUser.username
                        // element: listElement
                    }

                    const listTitles = [];
                    listTitles.push(listDisplay)
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
                            const listId = responseJson['list_id']
                            const username = responseJson['username']
                            let listElements = []
                            console.log(listId, username);
                            displayList(listId, username, listDisplay.title, listElements);
                        })

                }
            });
        })
    // submitListItemButton.addEventListener('click', function () {
        
    // })

});



function displayList(listId, username, displayedTitle, elements) {
    console.log(listId);
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
        fetch(`/add-to-list/${clickedListId}`, {
            method: 'POST',
            body: newListElementData
        })
            .then((newElement => {
                return newElement.json()
            }))
            .then((newElementJson) => {
                console.log(newElementJson);
                document.getElementById('create-list-success').innerHTML = newElementJson['message']
                const newListElement = document.createElement('li');
                newListElement.innerHTML = newElementJson['content'];
                listElementHolderBody.appendChild(newListElement);
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
        listElement.innerHTML = item.content;
        listElementHolderBody.appendChild(listElement);
    })

    listElementHolder.appendChild(listElementHolderBody);

    // listTitleButton.appendChild(listTitleDisplayed);

    listTitle.appendChild(listTitleButton);

    listDisplay.appendChild(listTitle);
    listDisplay.appendChild(listElementHolder);

    listContainer.appendChild(listDisplay);
}