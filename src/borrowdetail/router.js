const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.get("/", controller.getBorrowdetail);
router.get("/:id", controller.getBorrowdetailById);
router.post("/", controller.addBorrowdetail);
router.put("/:id", controller.updateBorrowdetail);
router.delete("/:id", controller.removeBorrowdetail);
module.exports = router;
