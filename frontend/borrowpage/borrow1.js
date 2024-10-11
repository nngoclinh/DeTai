document.addEventListener('DOMContentLoaded', () => {
    const borrowForm = document.getElementById('borrowForm');
    const bookListContainer = document.getElementById('book_list_container');
    const readerSelect = document.getElementById('reader_id');
    const borrowTableBody = document.querySelector('#borrowTable tbody');
    const updateForm = document.getElementById('updateForm');
    const updateBookListContainer = document.getElementById('update_book_list_container');

    // Utility function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Fetch and populate readers
    async function fetchReaders() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/reader');
            const readers = await response.json();
            readerSelect.innerHTML = '<option value="">Select Reader</option>'; // Reset
            readers.forEach(reader => {
                const option = document.createElement('option');
                option.value = reader.reader_id;
                option.textContent = reader.reader_name;
                readerSelect.appendChild(option);
            });

            // Also update the reader selection in the update form
            const updateReaderSelect = document.getElementById('update_reader_id');
            updateReaderSelect.innerHTML = '<option value="">Select Reader</option>';
            readers.forEach(reader => {
                const option = document.createElement('option');
                option.value = reader.reader_id;
                option.textContent = reader.reader_name;
                updateReaderSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching readers:', error);
        }
    }

    // Fetch and populate books
    async function fetchBooks() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/book');
            const books = await response.json();
            updateBookCheckboxes(books, bookListContainer);  // Add books to borrow form
            updateBookCheckboxes(books, updateBookListContainer);  // Add books to update form
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }

    // Populate checkboxes for books
    function updateBookCheckboxes(books, container) {
        container.innerHTML = ''; // Reset
        books.forEach(book => {
            const bookCheckbox = document.createElement('div');
            bookCheckbox.classList.add('book-checkbox');
            bookCheckbox.innerHTML = `
                <input type="checkbox" id="book_${book.book_id}" value="${book.book_id}">
                <label for="book_${book.book_id}">${book.book_name}</label>
            `;
            container.appendChild(bookCheckbox);
        });
    }

    // Fetch and display borrow records
    async function fetchBorrowRecords() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/misc');
            const borrowRecords = await response.json();

            borrowTableBody.innerHTML = ''; // Clear existing rows
            borrowRecords.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.borrow_id}</td>
                    <td>${formatDate(record.borrow_date)}</td>
                    <td>${formatDate(record.return_date)}</td>
                    <td>${record.books_borrowed.join(', ')}</td>
                    <td>${record.reader_name}</td>
                    <td>
                        <button class="action-btn btn-update" data-id="${record.borrow_id}">Update</button>
                        <button class="action-btn btn-delete" data-id="${record.borrow_id}">Delete</button>
                    </td>
                `;
                borrowTableBody.appendChild(row);
            });

            // Attach event listeners to update and delete buttons after rows are inserted
            attachEventListeners();
        } catch (error) {
            console.error('Error fetching borrow records:', error);
        }
    }

    // Attach event listeners to dynamically added buttons
    function attachEventListeners() {
        const updateButtons = document.querySelectorAll('.btn-update');
        const deleteButtons = document.querySelectorAll('.btn-delete');

        updateButtons.forEach(button => {
            button.addEventListener('click', handleUpdate);
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }

    // Handle update button click
    async function handleUpdate(event) {
        const borrowId = event.target.getAttribute('data-id');
        const borrowRecord = await getBorrowRecord(borrowId);

        if (borrowRecord) {
            updateForm.setAttribute('data-id', borrowId);
            updateForm.style.display = 'block'; // Show update form

            // Fill the update form with existing borrow record details
            updateForm.elements['update_borrow_date'].value = formatDate(borrowRecord.borrow_date);
            updateForm.elements['update_return_date'].value = formatDate(borrowRecord.return_date);
            updateForm.elements['update_reader_id'].value = borrowRecord.reader_id;

            // Update the book checkboxes in the update form
            const updateBookCheckboxes = updateBookListContainer.querySelectorAll('input[type="checkbox"]');
            updateBookCheckboxes.forEach(checkbox => {
                checkbox.checked = borrowRecord.books_borrowed.includes(parseInt(checkbox.value));
            });
        }
    }

    // Helper function to get a borrow record by ID
    async function getBorrowRecord(borrowId) {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/borrow/${borrowId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching borrow record:', error);
        }
    }

    // Handle delete button click
    async function handleDelete(event) {
        const borrowId = event.target.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this borrow record?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/borrow/${borrowId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('Borrow record deleted successfully!');
                    fetchBorrowRecords(); // Refresh the records
                } else {
                    throw new Error('Failed to delete borrow record');
                }
            } catch (error) {
                console.error('Error deleting borrow record:', error);
            }
        }
    }

    // Handle the update form submission
    updateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const borrowId = updateForm.getAttribute('data-id');
        const borrowDateValue = updateForm.elements['update_borrow_date'].value;
        const returnDateValue = updateForm.elements['update_return_date'].value;
        const readerId = updateForm.elements['update_reader_id'].value;

        let borrowDate, returnDate;
        try {
            borrowDate = parseDate(borrowDateValue);
            returnDate = parseDate(returnDateValue);

            if (isNaN(borrowDate.getTime()) || isNaN(returnDate.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            alert('Please provide valid dates in dd-mm-yyyy format');
            return;
        }

        const selectedBooks = Array.from(updateForm.querySelectorAll('.book-checkbox input:checked'))
            .map(checkbox => checkbox.value);

        if (selectedBooks.length === 0) {
            alert('Please select at least one book.');
            return;
        }

        // Send PUT request to update the borrow record
        try {
            const response = await fetch(`http://localhost:3000/api/v1/borrow/${borrowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reader_id: readerId,
                    borrow_date: borrowDate.toISOString(),
                    return_date: returnDate.toISOString(),
                    book_id: selectedBooks,
                }),
            });

            if (response.ok) {
                alert('Borrow record updated successfully!');
                fetchBorrowRecords(); // Refresh the records
                updateForm.style.display = 'none'; // Hide the update form
            } else {
                throw new Error('Failed to update borrow record');
            }
        } catch (error) {
            console.error('Error updating borrow record:', error);
        }
    });

    // Utility function to parse a date string (dd-mm-yyyy format)
    function parseDate(dateString) {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`);
    }

    // Initial fetches on page load
    fetch
