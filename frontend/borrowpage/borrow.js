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

    // Fetch available readers and books when the page loads
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

            // Add event listeners for delete buttons
            const deleteButtons = document.querySelectorAll('.btn-delete');
            deleteButtons.forEach(button => {
                button.addEventListener('click', handleDelete);
            });
        } catch (error) {
            console.error('Error fetching borrow records:', error);
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

    // Submit form
    function parseDate(dateString) {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}T00:00:00`); // Create Date object
    }

    borrowForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const borrowDateValue = document.getElementById('borrow_date').value;
        const returnDateValue = document.getElementById('return_date').value;
        const readerId = document.getElementById('reader_id').value;

        // Parse the input date strings to Date objects
        let borrowDate, returnDate;
        try {
            borrowDate = parseDate(borrowDateValue);
            returnDate = parseDate(returnDateValue);

            if (isNaN(borrowDate.getTime()) || isNaN(returnDate.getTime())) {
                throw new Error('Invalid date value');
            }
        } catch (error) {
            alert('Please provide valid dates in dd-mm-yyyy format');
            return;
        }

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
                    borrow_date: borrowDate.toISOString(),
                    return_date: returnDate.toISOString(),
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

    // Handle delete button click
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
    // Initial fetch on page load
    fetchReaders();
    fetchBooks();
    fetchBorrowRecords(); // Fetch borrow records to populate the table on page load
});
