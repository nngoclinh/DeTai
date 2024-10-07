const { Router } = require('express');
const controller = require('./controller')

const router = Router();

router.get("/", controller.getReader);
router.get("/:id",controller.getReaderById);
router.post("/",controller.addReader);
router.put("/:id",controller.updateReader);
router.delete("/:id",controller.removeReader);
module.exports = router;