document.addEventListener('DOMContentLoaded', () => {
    const borrowForm = document.getElementById('borrowForm');
    const bookListContainer = document.getElementById('book_list_container');
    const readerSelect = document.getElementById('reader_id');
    const borrowTableBody = document.querySelector('#borrowTable tbody');
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';  // Handle invalid dates gracefully
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    async function fetchReaders() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/reader'); // Adjust API endpoint if necessary
            const readers = await response.json();
            readers.forEach(reader => {
                const option = document.createElement('option');
                option.value = reader.reader_id;
                option.textContent = reader.reader_name;
                readerSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching readers:', error);
        }
    }

    async function fetchBooks() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/book'); // Adjust API endpoint if necessary
            const books = await response.json();
            updateBookCheckboxes(books); // Update checkboxes with available books
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }

    async function fetchBorrowRecords() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/misc'); // Adjust API endpoint for borrow records
            const borrowRecords = await response.json();
    
            // Clear existing rows
            borrowTableBody.innerHTML = '';
    
            borrowRecords.forEach(record => {
                const row = document.createElement('tr');
                const booksBorrowed = record.books_borrowed.map(book => book.book_name).join(', ');
                const booksIdBorrowed = record.books_borrowed.map(book => book.book_id).join(', ');
                row.innerHTML = `
                    <td>${record.borrow_id}</td>
                    <td>${formatDate(record.borrow_date)}</td>
                    <td>${formatDate(record.return_date)}</td>
                    <td>${booksBorrowed}</td>
                    <td>${record.reader_name}</td>
                    <td>
                        <button class="action-btn btn-update" data-id="${record.borrow_id}">Update</button>
                        <button class="action-btn btn-delete" data-id="${record.borrow_id}">Delete</button>
                    </td>
                `;
                borrowTableBody.appendChild(row);
            });
    
            const updateButtons = document.querySelectorAll('.btn-update');
            updateButtons.forEach(button => {
                button.addEventListener('click', async (event) => {
                    const borrowId = event.target.getAttribute('data-id');
                    const borrowRecord = borrowRecords.find(record => record.borrow_id === parseInt(borrowId));
                    // Clear and populate the update form fields
                    document.getElementById('update_borrow_id').value = borrowId;
                    document.getElementById('update_borrow_date').value = formatDate(borrowRecord.borrow_date);
                    document.getElementById('update_return_date').value = formatDate(borrowRecord.return_date);
                    // Populate and wait for the reader select box to be fully populated
                    await populateUpdateReaderSelect(borrowRecord.reader_id);
                    // Show the update form
                    document.getElementById('updateForm').style.display = 'block';
                });
            });
    
            const deleteButtons = document.querySelectorAll('.btn-delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', handleDelete);
            });
        } catch (error) {
            console.error('Error fetching borrow records:', error);
        }
    }
    
    async function handleDelete(event) {
        const borrowId = event.target.getAttribute('data-id');
    
        if (confirm('Are you sure you want to delete this borrow record?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/borrow/${borrowId}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete borrow record');
                }
    
                alert('Borrow record deleted successfully!');
                fetchBorrowRecords(); // Refresh the table after deletion
            } catch (error) {
                console.error('Error deleting borrow record:', error);
                alert('Error deleting borrow record.');
            }
        }
    }

    function updateBookCheckboxes(books) {
        books.forEach(book => {
            const bookCheckbox = document.createElement('div');
            bookCheckbox.classList.add('book-checkbox');
            bookCheckbox.innerHTML = `
                <input type="checkbox" id="book_${book.book_id}" value="${book.book_id}">
                <label for="book_${book.book_id}">${book.book_name}</label>
            `;
            bookListContainer.appendChild(bookCheckbox);
        });
    }
    function parseDate(dateString) {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}T00:00:00`); // Create Date object
    }
    //add record
    borrowForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const borrowDateValue = document.getElementById('borrow_date').value;
        const returnDateValue = document.getElementById('return_date').value;
        const readerId = document.getElementById('reader_id').value;
        


        // Collect all selected book IDs from checkboxes
        const selectedBooks = Array.from(document.querySelectorAll('.book-checkbox input:checked'))
                                   .map(checkbox => checkbox.value);

        if (selectedBooks.length === 0) {
            alert('Please select at least one book to borrow.');
            return;
        }

        // Post the data to your backend
        try {
            const response = await fetch('http://localhost:3000/api/v1/borrow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reader_id: readerId,
                    borrow_date: borrowDateValue,
                    return_date: returnDateValue,
                    book_id: selectedBooks,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit borrow request');
            }

            alert('Borrow record and books added successfully!');
            fetchBorrowRecords(); // Refresh the table after adding a new record
        } catch (error) {
            console.error(error);
            alert('Error submitting borrow request.');
        }
    });

    async function handleUpdate(event) {
        event.preventDefault();
      
        const borrowId = document.getElementById('update_borrow_id').value;
        const borrowDateValue = document.getElementById('update_borrow_date').value;
        const returnDateValue = document.getElementById('update_return_date').value;
        const readerId = document.getElementById('update_reader_id').value;
      
        const borrowDate = parseDate(borrowDateValue);
        const returnDate = parseDate(returnDateValue);
      
        try {
            const response = await fetch(`http://localhost:3000/api/v1/borrow/${borrowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reader_id: readerId,
                    borrow_date: borrowDateValue,
                    return_date: returnDateValue,
                }),
            });
      
            if (!response.ok) {
                throw new Error('Failed to update borrow record');
            }
      
            alert('Borrow record updated successfully!');
            fetchBorrowRecords(); // Refresh the table after updating a record
        } catch (error) {
            console.error(error);
            alert('Error updating borrow record.');
        }
    }

    document.getElementById('updateForm').addEventListener('submit', handleUpdate);

    async function populateUpdateReaderSelect(readerId) {
        const updateReaderSelect = document.getElementById('update_reader_id');
        updateReaderSelect.innerHTML = ''; // Clear existing options
        try {
            const response = await fetch('http://localhost:3000/api/v1/reader');
            const readers = await response.json();
            readers.forEach(reader => {
                const option = document.createElement('option');
                option.value = reader.reader_id;
                option.textContent = reader.reader_name;
                console.log(`Comparing reader ID ${reader.reader_id} with ${readerId}`);
                if (reader.reader_id === readerId) {
                    option.selected = true;
                }
                updateReaderSelect.appendChild(option);
            });
        
        } catch (error) {
            console.error('Error fetching readers:', error);
        }
    }
    document.getElementById('redirectButton').addEventListener('click', async function() {  
        const borrowId = document.getElementById('update_borrow_id').value;  
        const readerName = document.querySelector('#update_reader_id option:checked') ?  
            document.querySelector('#update_reader_id option:checked').textContent : '';  

        const response = await fetch('http://localhost:3000/api/v1/misc'); // Adjust API endpoint for borrow records  
        const borrowRecords = await response.json();  
        const bookmap = borrowRecords.find(record => record.borrow_id === parseInt(borrowId));  

        // Get book_ids from the borrow record and join them as a string  
        const booksIdBorrowed = bookmap.books_borrowed.map(book => book.book_id).join(',');  

        // Construct the URL with borrowId, readerName, and book_ids  
        const popupUrl = `updateform/update.html?borrow_id=${borrowId}&reader_name=${encodeURIComponent(readerName)}&book_ids=${booksIdBorrowed}`;  

        // Open the popup with the constructed URL  
        const updateWindow = window.open(popupUrl, '_blank', 'width=800,height=600');  

        // Polling to check if the update window is closed
        const interval = setInterval(function() {
            if (updateWindow.closed) {
                clearInterval(interval);
                // Refresh borrow.html when update.html is closed
                location.reload();
            }
        }, 500); // Check every 500 ms

        // Log the constructed URL for debugging  
        console.log(popupUrl);  
    });
    

    fetchReaders();
    fetchBooks();
    fetchBorrowRecords();
});
