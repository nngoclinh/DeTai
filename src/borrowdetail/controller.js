const pool = require("../../db");
const queries = require("./queries");
const bookQueries = require("../book/queries");
const borrowQueries = require("../borrow/queries");
const getBorrowdetail = (req, res) => {
  pool.query(queries.getBorrowdetail, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getBorrowdetailById = (req, res) => {
  const borrowdetail_id = parseInt(req.params.id);
  pool.query(
    queries.getBorrowdetailById,
    [borrowdetail_id],
    (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    }
  );
};

// const parseDate = (dateStr) => {
//   const [day, month, year] = dateStr.split('-');
//   const date = new Date(`${year}-${month}-${day}`);
//   date.setUTCHours(21); // Set time to noon UTC to avoid date shift
//   return date;
// };

const addBorrowdetail = (req, res) => {
  const { book_id, borrow_id } = req.body;
  pool.query(bookQueries.getBookById, [book_id], (error, results) => {
    if (error) {
      res.status(500).send("Error checking Book ID");
      return;
    }
    if (!results.rows.length) {
      res.status(409).send("Books id doesn't exist");
      return;
    }
    pool.query(borrowQueries.getBorrowById, [borrow_id], (error, results) => {
      if (error) {
        res.status(500).send("Error checking borrow ID");
        return;
      }
      if (!results.rows.length) {
        res.status(409).send("borrow id doesn't exist");
        return;
      }
      pool.query(queries.addBorrow, [book_id, borrow_id], (error, results) => {
        if (error) throw error;
        res.status(201).send("Borrow added");
        console.log("Borrow created");
      });
    });
  });
};

const removeBorrowdetail = (req, res) => {
  const borrowdetail_id = parseInt(req.params.id);
  pool.query(
    queries.getBorrowdetailByIdById,
    [borrowdetail_id],
    (error, results) => {
      const noBorrowFound = !results.rows.length;
      if (noBorrowFound) {
        res.status(404).send("No Borrow found Couldn't remove");
      } else {
        pool.query(queries.removeBorrow, [borrow_id], (error, results) => {
          if (error) throw error;
          res.status(200).send("Borrow removed");
        });
      }
    }
  );
};

const updateBorrowdetail = (req, res) => {
  const borrowdetail_id = parseInt(req.params.id);
  const { borrow_id, book_id } = req.body;

  pool.query(
    queries.getBorrowdetailByIdById,
    [borrowdetail_id],
    (error, results) => {
      if (!results.rows.length) {
        return res.status(404).send("No Borrow detail found. Couldn't update");
      }

      pool.query(borrowQueries.getBorrowById, [borrow_id], (error, results) => {
        if (!results.rows.length) {
          return res.status(404).send("No borrow found! Couldn't update");
        }

        pool.query(
          borrowQueries.getBorrowById,
          [borrow_id],
          (error, results) => {
            if (!results.rows.length) {
              return res.status(404).send("No book found! Couldn't update");
            }

            pool.query(
              queries.updateBorrowdetail,
              [borrowdetail_id],
              (error, results) => {
                if (error) throw error;
                res.status(200).send("Borrow detail updated");
              }
            );
          }
        );
      });
    }
  );
};

module.exports = {
  getBorrowdetail,
  getBorrowdetailById,
  addBorrowdetail,
  removeBorrowdetail,
  updateBorrowdetail,
};
