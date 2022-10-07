const express = require("express");
const historiesController = require("../controllers/histories");

const router = express.Router();

router.get("/", historiesController.getHistory);

router.get("/:id", historiesController.getDetails);

module.exports = router;
