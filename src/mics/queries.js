const getBorrowview = "SELECT * FROM borrowdetailsview";
const getBorrownew = `
SELECT
  b.borrow_id,
  r.reader_id,
  r.reader_name,
  b.borrow_date,
  b.return_date,
  array_agg(
    json_build_object(
      'book_id', book.book_id,
      'book_name', book.book_name
    )
  ) AS books_borrowed
FROM
  borrow AS b
JOIN
  borrowdetails AS bd ON b.borrow_id = bd.borrow_id
JOIN
  book AS book ON bd.book_id = book.book_id
JOIN
  reader AS r ON b.reader_id = r.reader_id
GROUP BY
  b.borrow_id,
  r.reader_id,
  r.reader_name,
  b.borrow_date,
  b.return_date;
`;

const getBorrowById = `SELECT b.borrow_id, r.reader_name, b.borrow_date, b.return_date, array_agg(book.book_id) AS books_borrowed
FROM borrow AS b
JOIN borrowdetails AS bd ON b.borrow_id = bd.borrow_id
JOIN book AS book ON bd.book_id = book.book_id
JOIN reader AS r ON b.reader_id = r.reader_id
WHERE b.borrow_id = $1
GROUP BY b.borrow_id, r.reader_name, b.borrow_date, b.return_date;`;

const updateBorrowdetail =
  "UPDATE borrowdetails SET book_id =$1 FROM borrow_detail_id =$2";

const getBooksByBorrowId =
  "SELECT book_id FROM borrowdetails WHERE borrow_id = $1";
  const removeBorrowdetails = "DELETE FROM borrowdetails WHERE borrow_id = $1 AND book_id = $2";

module.exports = {
  getBorrownew,
  getBorrowById,
  getBooksByBorrowId,
  updateBorrowdetail,
  removeBorrowdetails
};
