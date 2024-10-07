const pool = require("../../db");
const queries = require("./queries");

const getBook = (req, res) => {
  pool.query(queries.getBook, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getBookById = (req, res) => {
  const book_id = parseInt(req.params.id);
  pool.query(queries.getBookById, [book_id], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};
//add to database
const addBook = (req, res) => {
  const { book_name, author } = req.body;
  //add students
  pool.query(queries.addBook, [book_name, author], (error, results) => {
    if (error) throw error;
    res.status(201).send("Book added");
    console.log("Book created");
  });
};

const removeBook = (req, res) => {
  const book_id = parseInt(req.params.id);
  pool.query(queries.getBookById, [book_id], (error, results) => {
    const noBookFound = !results.rows.length;
    if (noBookFound) {
      res.status(404).send("No book found Couldn't remove");
    } else {
      pool.query(queries.removeBook, [book_id], (error, results) => {
        if (error) throw error;
        res.status(200).send("Book removed");
      });
    }
  }); 
};
const updateBook = (req, res) => {
  const book_id = parseInt(req.params.id);
  const { book_name, author } = req.body;

  pool.query(queries.getBookById, [book_id], (error, results) => {
    const noBookFound = !results.rows.length;
    if (noBookFound) {
      res.status(404).send("No book found !! Couldn't update");
    } else {
      pool.query(queries.updateBook, [book_name, author, book_id], (error, results) => {
        if (error) throw error;
        res.status(200).send("Book updated");
      });
    }
  });
};

module.exports = {
  getBook,
  getBookById,
  addBook,
  removeBook,
  updateBook,
};
