const { Router } = require("express");
const controller = require("./controller");

const router = Router();
router.get("/", controller.getBorrowview); // Corrected this line
router.get("/:id",controller.getBorrowById);
module.exports = router;
