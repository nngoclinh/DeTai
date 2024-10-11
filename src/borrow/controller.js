const pool = require("../../db");
const queries = require("./queries");
const readerQueries = require("../reader/queries");
const detailQueries = require("../borrowdetail/queries");
const bookQueries = require("../book/queries");

const getBorrow = async (req, res) => {
  try {
    const results = await pool.query(queries.getBorrow);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    res.status(500).send("Error fetching borrow records");
  }
};
const getBorrowById = async (req, res) => {
  const borrow_id = parseInt(req.params.id);

  try {
    const results = await pool.query(queries.getBorrowById, [borrow_id]); // No typo here
    if (results.rows.length === 0) {
      return res.status(404).send(`Borrow ID ${borrow_id} not found`);
    }
    res.status(200).json(results.rows);
  } catch (error) {
    console.error("Error fetching borrow record by ID:", error);
    res.status(500).send("Error fetching borrow record by ID");
  }
};


// const parseDate = (dateStr) => {
//   const [day, month, year] = dateStr.split('-');
//   const date = new Date(`${year}-${month}-${day}`);
//   date.setUTCHours(21); // Set time to noon UTC to avoid date shift
//   return date;
// };
const getBorrowview = async (req,res) =>{
  try {
    const results = await pool.query(queries.getBorrowview);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    res.status(500).send("Error fetching borrow records");
  }
}
const addBorrow = async (req, res) => {
  const { reader_id, borrow_date, return_date, book_id } = req.body;

  try {
    // First, check if reader exists
    const readerResults = await pool.query(readerQueries.getReaderById, [
      reader_id,
    ]);
    if (!readerResults.rows.length) {
      return res.status(409).send("Reader ID doesn't exist");
    }

    // Ensure book_ids is provided and is an array
    if (!Array.isArray(book_id) || book_id.length === 0) {
      return res.status(400).send("No books provided to borrow");
    }

    // Check if all books exist
    for (const id of book_id) {
      const bookResults = await pool.query(bookQueries.getBookById, [id]);
      if (!bookResults.rows.length) {
        return res.status(409).send(`Book ID ${id} doesn't exist`);
      }
    }

    // Insert into Borrow table
    const borrowResults = await pool.query(queries.addBorrow1, [
      reader_id,
      borrow_date,
      return_date,
    ]);
    const borrow_id = borrowResults.rows[0].borrow_id; // Get the newly created borrow_id

    // Insert each book into BorrowDetails in parallel
    const insertPromises = book_id.map((id) => {
      return pool.query(detailQueries.addBorrowdetail, [borrow_id, id]);
    });
    await Promise.all(insertPromises);

    // Respond success
    res.status(201).send("Borrow and books added successfully");
    console.log("Borrow details added for multiple books");
  } catch (error) {
    console.error("Error during borrow process:", error);
    res.status(500).send("Error processing borrow request");
  }
};

const removeBorrow = async (req, res) => {
  const borrow_id = parseInt(req.params.id);
  try {
    const getBorrowbyIdResulst = await pool.query(queries.getBorrowById, [
      borrow_id,
    ]);
    if (!getBorrowbyIdResulst.rows.length) {
      return res.status(409).send("Borrow not founded! Couldn't delete");
    }
    const borrow_details_idResults = await pool.query(
      detailQueries.getBorrowdetailIdByBorrowID,
      [borrow_id]
    );
    const borrow_details_id = borrow_details_idResults.rows.map(
      (row) => row.borrow_details_id
    );
    const removeBorrowPromises = borrow_details_id.map(borrow_detail_id => 
      pool.query(detailQueries.removeBorrowdetail, [borrow_detail_id])
    );
    await Promise.all(removeBorrowPromises);
    const removeBorrowResults = await pool.query(
      queries.removeBorrow,
      [borrow_id]
    );
    res.status(200).send("Borrow detail successfully remove");
  } catch (error) {
    console.error("Error during borrow process:", error);
    res.status(500).send("Error processing borrow request");
  }
};

const updateBorrow = async (req, res) => {
  const borrow_id = parseInt(req.params.id);
  const { reader_id, borrow_date, return_date, book_id } = req.body;

  try {
    const readerResults = await pool.query(readerQueries.getReaderById, [
      reader_id,
    ]);
    if (!readerResults.rows.length) {
      return res.status(409).send("Reader ID doesn't exist");
    }
    if (!Array.isArray(book_id) || book_id.length === 0) {
      return res.status(400).send("No books provided to borrow");
    }
    for (const id of book_id) {
      const bookResults = await pool.query(bookQueries.getBookById, [id]);
      if (!bookResults.rows.length) {
        return res.status(409).send(`Book ID ${id} doesn't exist`);
      }
    }
    const borrowResults = await pool.query(queries.updateBorrow, [
      reader_id,
      borrow_date,
      return_date,
      borrow_id,
    ]);

    const borrow_details_idResults = await pool.query(
      detailQueries.getBorrowdetailIdByBorrowID,
      [borrow_id]
    );

    const borrow_details_id = borrow_details_idResults.rows.map(
      (row) => row.borrow_details_id
    );

    const updatePromises = book_id.map((id, index) => {
      return pool.query(detailQueries.updateBorrowdetail, [
        id,
        borrow_id,
        borrow_details_id[index],
      ]);
    });
    await Promise.all(updatePromises);
    res.status(200).send("Borrow details updated successfully");
  } catch (error) {
    console.error("Error during borrow process:", error);
    res.status(500).send("Error processing borrow request");
  }
};

module.exports = {
  getBorrow,
  getBorrowById,
  addBorrow,
  removeBorrow,
  updateBorrow,
  getBorrowview,
};
