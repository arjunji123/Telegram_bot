const Model = require("../models/serviceModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");

const table_name = Model.table_name;
const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;
const sellTransactionSchema = Joi.object({
  company_id: Joi.string().required(),
  transaction_coin: Joi.string().required(),
  transaction_rate: Joi.number().required(),
  transaction_amount: Joi.number().required(),
});

exports.getAllRecords = catchAsyncErrors(async (req, res, next) => {
  res.render(module_slug + "/index", {
    layout: module_layout,
    title: module_title,
    module_slug: module_slug,
  });
});

// Sell API function with validation and structured data insertion
// Sell API function

exports.createSellTransaction = catchAsyncErrors(async (req, res, next) => {
  try {
    // Log the incoming request body for debugging
    console.log("Request Body:", req.body);

    // Validate incoming request body against the schema
    await sellTransactionSchema.validateAsync(req.body, {
      abortEarly: false, // Continue validation after the first error
      allowUnknown: true, // Allow unknown fields
    });

    // Assume user_id is extracted from session or token
    const user_id = req.user?.id; // Use optional chaining to avoid undefined errors

    if (!user_id) {
      return next(new ErrorHandler("User ID is required", 401)); // Handle missing user_id
    }

    // Create a new transaction object
    const newTransaction = new sellTransactionSchema({
      user_id,
      ...req.body, // Spread validated request body properties
      date_created: new Date(), // Set current date
      status: "unapproved", // Set initial status if needed
    });

    // Save the transaction to the database
    const savedTransaction = await newTransaction.save();
    console.log("Saved Transaction:", savedTransaction); // Log the saved transaction

    // Respond with success message and transaction data
    res.status(201).json({
      success: true,
      message: "Transaction created successfully!",
      data: savedTransaction,
    });
  } catch (error) {
    console.error("Error creating sell transaction:", error); // Log the complete error object

    if (error.isJoi) {
      // Handle Joi validation errors
      return next(
        new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
      );
    }

    // Handle Mongoose validation or other database errors
    if (error.name === "ValidationError") {
      return next(new ErrorHandler("Validation error: " + error.message, 400));
    }

    // Handle other types of errors
    return next(
      new ErrorHandler("Failed to create transaction: " + error.message, 500)
    );
  }
});
