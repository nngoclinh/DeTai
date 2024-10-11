// Fetch books and display them
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/book');
        const books = await response.json();
        const bookTableBody = document.getElementById('books');
        bookTableBody.innerHTML = '';
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_id}</td>
                <td>${book.book_name}</td>
                <td>${book.author}</td>
                <td>
                    <button class="update" onclick="showUpdateForm(${book.book_id}, '${book.book_name}', '${book.author}')">Update</button>
                    <button class="delete" onclick="deleteBook(${book.book_id})">Delete</button>
                </td>
            `;
            bookTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
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

// Add a new book
async function addBook() {
    const bookName = document.getElementById('book-name').value;
    const author = document.getElementById('author').value;

    if (bookName && author) {
        try {
            const response = await fetch('http://localhost:3000/api/v1/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ book_name: bookName, author: author })
            });

            if (response.status === 201) {
                showPopup('Book added successfully!');
            } else {
                showPopup('Failed to add book.');
            }
            fetchBooks();  // Refresh book list
        } catch (error) {
            console.error('Error adding book:', error);
            showPopup('An error occurred.');
        }
    }
}

// Delete a book
async function deleteBook(bookId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/book/${bookId}`, {
            method: 'DELETE'
        });
        if (response.status === 200) {
            showPopup('Book deleted successfully!');
        } else {
            showPopup('Failed to delete book. It may already in other table');
        }
        fetchBooks();  // Refresh book list
    } catch (error) {
        console.error('Error deleting book:', error);
        showPopup('An error when deleting occurred.');
    }
}

// Show update form
function showUpdateForm(bookId, bookName, author) {
    const updateBookForm = document.getElementById('update-book-form');
    updateBookForm.style.display = 'block';

    const bookNameInput = document.getElementById('update-book-name');
    const authorInput = document.getElementById('update-author');
    bookNameInput.value = bookName;
    authorInput.value = author;

    const updateButton = document.getElementById('update-book-button');
    updateButton.onclick = function () {
        updateBook(bookId);
    };
}

// Hide update form
function hideUpdateForm() {
    const updateBookForm = document.getElementById('update-book-form');
    updateBookForm.style.display = 'none';
}

// Update book
async function updateBook(bookId) {
    const bookName = document.getElementById('update-book-name').value;
    const author = document.getElementById('update-author').value;

    if (bookName && author) {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/book/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ book_name: bookName, author: author })
            });

            if (response.status === 200) {
                showPopup('Book updated successfully!');
            } else {
                showPopup('Failed to update book.');
            }
            fetchBooks();  // Refresh book list
            hideUpdateForm();  // Hide update form after updating
        } catch (error) {
            console.error('Error updating book:', error);
            showPopup('An error occurred.');
        }
    }
}

// Initial fetch of books
fetchBooks();