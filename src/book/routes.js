const { Router } = require('express');
const controller = require('./controller')

const router = Router();

router.get("/", controller.getBook);
router.get("/:id",controller.getBookById);
router.post("/",controller.addBook);
router.put("/:id",controller.updateBook);
router.delete("/:id",controller.removeBook);
module.exports = router;