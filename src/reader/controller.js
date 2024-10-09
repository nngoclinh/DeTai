const pool = require("../../db");
const queries = require("./queries");

const getReader = (req, res) => {
  pool.query(queries.getReader, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getReaderById = (req, res) => {
  const reader_id = parseInt(req.params.id);
  pool.query(queries.getReaderById, [reader_id], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};
//add to database
const addReader = (req, res) => {
  const { reader_name, phone_number } = req.body;
  pool.query(
    queries.checkIfPhoneNumberExisted,
    [phone_number],
    (error, results) => {
      if (error) {
        res.status(500).send("Error checking phone number");
        return;
      }
      if (results.rows.length) {
        res.status(409).send("Phone number already existed");
        return;
      }
      // Add reader
      pool.query(
        queries.addReader,
        [reader_name, phone_number],
        (error, results) => {
          if (error) {
            res.status(500).send("Error adding reader");
            return;
          }
          res.status(201).send("Reader added");
          console.log("Reader created");
        }
      );
    }
  );
};
const removeReader = (req, res) => {
  const reader_id = parseInt(req.params.id);
  pool.query(queries.getReaderById, [reader_id], (error, results) => {
    const noBookFound = !results.rows.length;
    if (noBookFound) {
      res.send("No reader found Couldn't remove");
    } else {
      pool.query(queries.removeReader, [reader_id], (error, results) => {
        if (error) throw error;
        res.status(200).send("Reader removed");
      });
    }
  });
};
const updateReader = (req, res) => {
  const reader_id = parseInt(req.params.id);
  const { reader_name, phone_number } = req.body;

  pool.query(queries.getReaderById, [reader_id], (error, results) => {
    const noReaderFound = !results.rows.length;
    if (noReaderFound) {
      res.send("No reader found !! Couldn't update");
    } else {
      pool.query(
        queries.updateReader,
        [reader_name, phone_number, reader_id],
        (error, results) => {
          if (error) throw error;
          res.status(200).send("Reader updated");
        }
      );
    }
  });
};

module.exports = {
  getReader,
  getReaderById,
  addReader,
  removeReader,
  updateReader,
};
