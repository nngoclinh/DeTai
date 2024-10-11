// Fetch readers and display them
async function fetchReaders() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/reader');
        const readers = await response.json();
        const readerTableBody = document.getElementById('readers');
        readerTableBody.innerHTML = '';
        readers.forEach(reader => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reader.reader_id}</td>
                <td>${reader.reader_name}</td>
                <td>${reader.phone_number}</td>
                <td>
                    <button class="update" onclick="showUpdateForm(${reader.reader_id}, '${reader.reader_name}', '${reader.phone_number}')">Update</button>
                    <button class="delete" onclick="deleteReader(${reader.reader_id})">Delete</button>
                </td>
            `;
            readerTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching readers:', error);
    }
}

function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 3000);  // Pop-up will disappear after 3 seconds
}

// Add a new reader
async function addReader() {
    const readerName = document.getElementById('reader-name').value;
    const phoneNumber = document.getElementById('phone-number').value;

    if (readerName && phoneNumber) {
        try {
            const response = await fetch('http://localhost:3000/api/v1/reader', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reader_name: readerName, phone_number: phoneNumber })
            });

            if (response.status === 201) {
                showPopup('Reader added successfully!');
            } else {
                showPopup('Failed to add reader.');
            }
            fetchReaders();  // Refresh reader list
        } catch (error) {
            console.error('Error adding reader:', error);
            showPopup('An error occurred.');
        }
    }
}

// Delete a reader
async function deleteReader(readerId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/reader/${readerId}`, {
            method: 'DELETE'
        });
        if (response.status === 200) {
            showPopup('Reader deleted successfully!');
        } else {
            showPopup('Failed to delete reader. It may be in use in other tables.');
        }
        fetchReaders();  // Refresh reader list
    } catch (error) {
        console.error('Error deleting reader:', error);
        showPopup('An error occurred when deleting.');
    }
}

// Show update form
function showUpdateForm(readerId, readerName, phoneNumber) {
    const updateReaderForm = document.getElementById('update-reader-form');
    updateReaderForm.style.display = 'block';

    const readerNameInput = document.getElementById('update-reader-name');
    const phoneNumberInput = document.getElementById('update-phone-number');
    readerNameInput.value = readerName;
    phoneNumberInput.value = phoneNumber;

    const updateButton = document.getElementById('update-reader-button');
    updateButton.onclick = function () {
        updateReader(readerId);
    };
}

// Hide update form
function hideUpdateForm() {
    const updateReaderForm = document.getElementById('update-reader-form');
    updateReaderForm.style.display = 'none';
}

// Update reader
async function updateReader(readerId) {
    const readerName = document.getElementById('update-reader-name').value;
    const phoneNumber = document.getElementById('update-phone-number').value;

    if (readerName && phoneNumber) {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/reader/${readerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reader_name: readerName, phone_number: phoneNumber })
            });

            if (response.status === 200) {
                showPopup('Reader updated successfully!');
            } else {
                showPopup('Failed to update reader.');
            }
            fetchReaders();  // Refresh reader list
            hideUpdateForm();  // Hide update form after updating
        } catch (error) {
            console.error('Error updating reader:', error);
            showPopup('An error occurred.');
        }
    }
}

// Initial fetch of readers
fetchReaders();
