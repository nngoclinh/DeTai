const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.get("/", controller.getBorrow);
router.get("/:id", controller.getBorrowById);
router.post("/", controller.addBorrow);
router.put("/:id", controller.updateBorrow);
router.delete("/:id", controller.removeBorrow);

module.exports = router;
