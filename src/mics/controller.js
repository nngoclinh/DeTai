const pool = require("../../db");
const queries = require("./queries");
const bookQueries = require("../book/queries");
const detailQueries = require("../borrowdetail/queries");
// //the queries is `SELECT b.borrow_id, r.reader_name, b.borrow_date, b.return_date, array_agg(book.book_name) AS books_borrowed
// FROM borrow AS b
// JOIN borrowdetails AS bd ON b.borrow_id = bd.borrow_id
// JOIN book AS book ON bd.book_id = book.book_id
// JOIN reader AS r ON b.reader_id = r.reader_id
// GROUP BY b.borrow_id, r.reader_name, b.borrow_date, b.return_date;`;
const getBorrowview = async (req,res) =>{
    try {
      const results = await pool.query(queries.getBorrownew);  
      res.status(200).json(results.rows);
    } catch (error) {
      console.error("Error fetching borrow records:", error);
      res.status(500).send("Error fetching borrow records");
    }
  }
  const getBorrowById = async (req,res) =>{
    try {
      const borrow_id = parseInt(req.params.id);
      const results = await pool.query(queries.getBorrowById, [borrow_id]);
      res.status(200).json(results.rows);
    } catch (error) {
      console.error("Error fetching borrow records:", error);
      res.status(500).send("Error fetching borrow records");
    }
  }
  const updateBorrow = async (req, res) => {
    const borrow_id = parseInt(req.params.id);
    const { book_id } = req.body;

    try {
        // Ensure book_ids is provided and is an array
        if (!Array.isArray(book_id) || book_id.length === 0) {
            return res.status(400).json({ success: false, message: "No books provided to update" });
        }

        // Fetch the current books for the given borrow_id
        const existingBooksResult = await pool.query(queries.getBooksByBorrowId, [borrow_id]);
        const existingBookIds = existingBooksResult.rows.map(row => row.book_id);

        // Determine which books need to be added and which need to be removed
        const booksToAdd = book_id.filter(id => !existingBookIds.includes(id)); // New books
        const booksToRemove = existingBookIds.filter(id => !book_id.includes(id)); // Books to remove

        // Add new books
        if (booksToAdd.length > 0) {
            const addPromises = booksToAdd.map(id => pool.query(detailQueries.addBorrowdetail, [borrow_id, id]));
            await Promise.all(addPromises);
        }

        // Remove books that are no longer in the request
        if (booksToRemove.length > 0) {
            const removePromises = booksToRemove.map(id => pool.query(queries.removeBorrowdetails, [borrow_id, id]));
            await Promise.all(removePromises);
        }

        // Respond success
        res.status(200).json({ success: true, message: "Borrow updated successfully" });
    } catch (error) {
        console.error("Error during borrow update process:", error);
        res.status(500).json({ success: false, message: "Error processing borrow update request" });
    }
};

  module.exports = {
    getBorrowview,
    getBorrowById,
    updateBorrow
  };


  
