const getBorrowdetail = "SELECT * FROM borrowdetails";
const getBorrowdetailById =
  "SELECT * FROM borrowdetails WHERE borrow_details_id = $1 ";
const addBorrowdetail =
  "INSERT INTO borrowdetails (borrow_id,book_id) VALUES ($1,$2)";
const removeBorrowdetail =
  "DELETE FROM borrowdetails WHERE borrow_details_id = $1";
const updateBorrowdetail =
  "UPDATE borrowdetails SET book_id = $1 , borrow_id = $2 WHERE borrow_details_id = $3";
const getBorrowdetailIdByBorrowID = "SELECT borrow_details_id FROM borrowdetails WHERE borrow_id = $1";
module.exports = {
  getBorrowdetail,
  getBorrowdetailById,
  addBorrowdetail,
  removeBorrowdetail,
  updateBorrowdetail,
  getBorrowdetailIdByBorrowID
};
