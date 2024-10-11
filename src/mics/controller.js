const pool = require("../../db");
const queries = require("./queries");

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
  module.exports = {
    getBorrowview,
    getBorrowById
  };