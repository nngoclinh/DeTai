const getBook = "SELECT * FROM book";
const getBookById = "SELECT * FROM book WHERE book_id = $1 ";
const addBook = "INSERT INTO book (book_name,author) VALUES ($1,$2)";
const removeBook = "DELETE FROM book WHERE book_id = $1";
const updateBook =
  "UPDATE book SET book_name = $1 , author = $2 WHERE book_id = $3";
module.exports = {
  getBook,
  getBookById,
  addBook,
  removeBook,
  updateBook,
};
