const pool = require("../../db");
const queries = require("./queries");
const readerQueries = require("../reader/queries");
const getBorrow = (req, res) => {
  pool.query(queries.getBorrow, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getBorrowById = (req, res) => {
  const borrow_id = parseInt(req.params.id);
  pool.query(queries.getBorrowById, [borrow_id], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};
//add to database
const addBorrow = (req, res) => {
    const { reader_id, borrow_date, return_date } = req.body;
  
    pool.query(readerQueries.getReaderById, [reader_id], (error, results) => {
      if (error) {
        res.status(500).send("Error checking reader ID");
        return;
      }
      if (!results.rows.length) {
        res.status(409).send("Reader id doesn't exist");
        return;
      }
      pool.query(
        queries.addBorrow,
        [reader_id, borrow_date, return_date],
        (error, results) => {
          if (error) throw error;
          res.status(201).send("Borrow added");
          console.log("Borrow created");
        }
      );
    });
  };
  
  

const removeBorrow = (req, res) => {
  const borrow_id = parseInt(req.params.id);
  pool.query(queries.getBorrowById, [borrow_id], (error, results) => {
    const noBorrowFound = !results.rows.length;
    if (noBorrowFound) {
      res.status(404).send("No Borrow found Couldn't remove");
    } else {
      pool.query(queries.removeBorrow, [borrow_id], (error, results) => {
        if (error) throw error;
        res.status(200).send("Borrow removed");
      });
    }
  });
};
const updateBorrow = (req, res) => {
    const borrow_id = parseInt(req.params.id);
    const { reader_id, borrow_date, return_date } = req.body;
  
    pool.query(queries.getBorrowById, [borrow_id], (error, results) => {
      const noBorrowFound = !results.rows.length;
      if (noBorrowFound) {
        res.status(404).send("No Borrow found !! Couldn't update");
      } else {
        pool.query(readerQueries.getReaderById, [reader_id], (error, results) => {
          if (error) {
            res.status(500).send("Error checking reader ID");
            return;
          }
          if (!results.rows.length) {
            res.status(409).send("Reader id doesn't exist");
            return;
          }
          pool.query(
            queries.updateBorrow,
            [reader_id, borrow_date, return_date, borrow_id],
            (error, results) => {
              if (error) throw error;
              res.status(200).send("Borrow updated");
            }
          );
        });
      }
    });
  };
  

module.exports = {
  getBorrow,
  getBorrowById,
  addBorrow,
  removeBorrow,
  updateBorrow,
};
