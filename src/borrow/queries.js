const getBorrow = "SELECT * FROM borrow";
const getBorrowById = "SELECT * FROM borrow WHERE borrow_id = $1 ";
const addBorrow =
  "INSERT INTO borrow (reader_id,borrow_date,return_date) VALUES ($1,$2,$3)";
const removeBorrow = "DELETE FROM borrow WHERE borrow_id = $1";
const updateBorrow =
  "UPDATE borrow SET reader_id = $1 , borrow_date = $2 , return_date = $3 WHERE borrow_id = $4";
  const addBorrow1= "INSERT INTO borrow (reader_id,borrow_date,return_date) VALUES ($1,$2,$3) RETURNING borrow_id";
module.exports = {
  getBorrow,
  getBorrowById,
  addBorrow,
  removeBorrow,
  updateBorrow,
  addBorrow1,
};
