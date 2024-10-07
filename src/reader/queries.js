const getReader = "SELECT * FROM reader";
const getReaderById = "SELECT * FROM reader WHERE reader_id = $1 ";
const addReader =
  "INSERT INTO reader (reader_name,phone_number) VALUES ($1,$2)";
const checkIfPhoneNumberExisted= "SELECT * FROM reader WHERE phone_number =$1"; 
const removeReader = "DELETE FROM reader WHERE reader_id = $1";
const updateReader = "UPDATE reader SET reader_name = $1 , phone_number = $2 WHERE reader_id = $3";
module.exports = {
  getReader,
  getReaderById,
  addReader,
  checkIfPhoneNumberExisted,
  removeReader,
  updateReader,
};