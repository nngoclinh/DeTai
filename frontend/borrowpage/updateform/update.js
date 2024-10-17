document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const borrowId = urlParams.get('borrow_id');
    const readerName = urlParams.get('reader_name');
    const bookIds = urlParams.get('book_ids'); // Changed from bookId to bookIds for clarity
    
    document.getElementById('borrowId').textContent = borrowId;
    document.getElementById('readerName').textContent = readerName;
    
    // Check if bookIds is not null and split it into an array
    let bookIdArray = [];
    if (bookIds) {
        bookIdArray = bookIds.split(','); // Split the book IDs by comma
        document.getElementById('bookId').textContent = bookIdArray.join(', '); // Join them back for display
    } else {
        document.getElementById('bookId').textContent = 'No books borrowed'; // Display a message if no books
    }
    
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
                        <input type="checkbox" id="book_${book.book_id}" value="${book.book_id}">
                    </td>
                `;
    
                bookTableBody.appendChild(row);
    
                // Check if book.book_id (converted to string) is in the bookIdArray
                if (bookIdArray.includes(String(book.book_id))) {
                    console.log('bookIdArray:', bookIdArray);
                    console.log('Current book ID:', book.book_id);
                    document.getElementById(`book_${book.book_id}`).checked = true; // Check the checkbox if the ID matches
                }
            });
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }
    document.getElementById('updateButton').addEventListener('click', updateBooks);

    async function updateBooks() {
        try {
            // Get the checked book IDs
            const checkedBookIds = [];
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkedBookIds.push(Number(checkbox.value));
                }
            });
            console.log("checkedBookIds",checkedBookIds);
            console.log("checkboxes",checkboxes);
            const body = JSON.stringify({book_id: checkedBookIds })
            console.log("body test",body);
                book_id: checkedBookIds
            // Send a request to the server to update the books
            const response = await fetch(`http://localhost:3000/api/v1/misc/${borrowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:body
            });

            const result = await response.json();
            console.log('Update result:', result);

            // You can also display a success message to the user
            alert('Borrow updated successfully!');
        } catch (error) {
            console.error('Error updating borrow:', error);
        }
    }
    fetchBooks(); // Fetch books on page load
});