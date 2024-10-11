const pool = require("../../db");
const queries = require("./queries");

const getBook = async (req, res) => {
  try {
    const getBookResult = await pool.query(queries.getBook);
    res.status(200).json(getBookResult.rows);
  } catch (error) {
    console.error("Error fetching book records:", error);
    res.status(500).send("Error fetching book records");
  }
};
const getBookById = async (req, res) => {
  const book_id = parseInt(req.params.id);
  try {
    const result = await pool.query(queries.getBookById, [book_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).send("Error fetching book by ID");
  }
};
//add to database
const addBook = async (req, res) => {
  const { book_name, author } = req.body;
  try {
    await pool.query(queries.addBook, [book_name, author]);
    res.status(201).send("Book added");
    console.log("Book created");
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).send("Error adding book");
  }
};

const removeBook = async (req, res) => {
  const book_id = parseInt(req.params.id);
  try {
    const result = await pool.query(queries.getBookById, [book_id]);
    if (!result.rows.length) {
      return res.status(404).send("No book found. Couldn't remove.");
    }
    await pool.query(queries.removeBook, [book_id]);
    res.status(200).send("Book removed");
  } catch (error) {
    console.error("Error removing book:", error);
    res.status(500).send("Error removing book");
  }
};

const updateBook = async (req, res) => {
  const book_id = parseInt(req.params.id);
  const { book_name, author } = req.body;
  try {
    const result = await pool.query(queries.getBookById, [book_id]);
    if (!result.rows.length) {
      return res.status(404).send("No book found. Couldn't update.");
    }
    await pool.query(queries.updateBook, [book_name, author, book_id]);
    res.status(200).send("Book updated");
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).send("Error updating book");
  }
};

module.exports = {
  getBook,
  getBookById,
  addBook,
  removeBook,
  updateBook,
};
