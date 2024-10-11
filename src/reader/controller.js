const pool = require("../../db");
const queries = require("./queries");

const getReader = async (req, res) => {
  try {
    const results = await pool.query(queries.getReader);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error("Error fetching readers:", error);
    res.status(500).send("Error fetching readers");
  }
};

const getReaderById = async (req, res) => {
  const reader_id = parseInt(req.params.id);
  try {
    const results = await pool.query(queries.getReaderById, [reader_id]);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error("Error fetching reader by ID:", error);
    res.status(500).send("Error fetching reader by ID");
  }
};

const addReader = async (req, res) => {
  const { reader_name, phone_number } = req.body;
  try {
    // Check if phone number exists
    const checkResult = await pool.query(queries.checkIfPhoneNumberExisted, [phone_number]);
    if (checkResult.rows.length) {
      return res.status(409).send("Phone number already existed");
    }
    // Add reader
    await pool.query(queries.addReader, [reader_name, phone_number]);
    res.status(201).send("Reader added");
    console.log("Reader created");
  } catch (error) {
    console.error("Error adding reader:", error);
    res.status(500).send("Error adding reader");
  }
};

const removeReader = async (req, res) => {
  const reader_id = parseInt(req.params.id);
  try {
    const results = await pool.query(queries.getReaderById, [reader_id]);
    if (!results.rows.length) {
      return res.status(404).send("No reader found. Couldn't remove.");
    }
    await pool.query(queries.removeReader, [reader_id]);
    res.status(200).send("Reader removed");
  } catch (error) {
    console.error("Error removing reader:", error);
    res.status(500).send("Error removing reader");
  }
};

const updateReader = async (req, res) => {
  const reader_id = parseInt(req.params.id);
  const { reader_name, phone_number } = req.body;
  try {
    const results = await pool.query(queries.getReaderById, [reader_id]);
    if (!results.rows.length) {
      return res.status(404).send("No reader found. Couldn't update.");
    }
    await pool.query(queries.updateReader, [reader_name, phone_number, reader_id]);
    res.status(200).send("Reader updated");
  } catch (error) {
    console.error("Error updating reader:", error);
    res.status(500).send("Error updating reader");
  }
};
module.exports = {
  getReader,
  getReaderById,
  addReader,
  removeReader,
  updateReader,
};
