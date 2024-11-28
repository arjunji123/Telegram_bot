const express = require("express");
const multer = require("multer");
const {
  allTransactions,
  approveTransaction,
} = require("../contollers/transactionController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const Model = require("../models/faqModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.memoryStorage(); // Use memoryStorage instead of diskStorage

var upload = multer({ storage: Storage });

router.route("/transactions").get(isAuthenticatedUser, allTransactions);
router
  .route("/approveTransaction")
  .post(isAuthenticatedUser, approveTransaction);

module.exports = router;