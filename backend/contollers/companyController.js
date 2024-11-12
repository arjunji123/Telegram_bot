const Model = require("../models/companyModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const mysqlPool = require("../config/mysql_database"); // Adjust the path if necessary

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

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch user data from the users table where user_type is 'company'
    const users = await db.query(
      `SELECT 
          u.id,
          u.user_name,
          u.email,
          u.mobile,
          DATE_FORMAT(u.date_created, "%d-%m-%Y") AS date_created,
          u.user_type,
          u.status  
       FROM users u
       WHERE u.user_type = ?`, // Fetch only where user_type is 'company'
      ["company"] // Directly passing the value 'company'
    );

    // Render the response with the fetched user data
    res.render(module_slug + "/index", {
      layout: module_layout,
      title: module_single_title + " " + module_add_text,
      module_slug,
      users, // Pass the users array directly
      originalUrl: req.originalUrl, // Pass the original URL here
    });
  } catch (error) {
    // Handle any potential errors
    console.error("Error fetching users:", error);
    return next(new ErrorHandler("Error while fetching user data.", 500));
  }
});

exports.createRecord = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate the request body with Joi schema
    await Model.insertSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.details.map((d) => d.message),
        400
      )
    );
  }

  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (req.file) {
    req.body.image = req.file.filename;
  }

  // Prepare data for insertion into the user table
  const insertData = {
    user_name: req.body.user_name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password, 10),
    status: req.body.status,
    date_created: date_created,
    user_type: "company", // Set user_type to "company"
    date_modified: date_created,
  };

  try {
    // Insert the user data into the database
    const user = await QueryModel.saveData(table_name, insertData, next);
    console.log(user);

    // Prepare data for company_data table
    const companyInsertData = {
      company_id: user.id, // Assuming this is the ID of the newly created user
      coin_rate: req.body.coin_rate, // From the request body
      description: req.body.description, // From the request body
    };

    // Insert company-specific data into company_data table
    await QueryModel.saveData("company_data", companyInsertData, next);

    // Success response
    req.flash("msg_response", {
      status: 200,
      message: "Successfully added " + module_single_title,
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (err) {
    console.error("Error saving data:", err);
    return next(new ErrorHandler("Error while saving user data.", 500));
  }
});

// Joi schema for validation
const coinRateSchema = Joi.object({
  company_id: Joi.number().integer().required(),
  coin_rate: Joi.string().required(),
  description: Joi.string().optional(),
});

exports.addFrom = catchAsyncErrors(async (req, res, next) => {
  res.render(module_slug + "/add", {
    layout: module_layout,
    title: module_single_title + " " + module_add_text,
    module_slug,
  });
});
exports.addCoinRate = catchAsyncErrors(async (req, res, next) => {
  // Step 1: Validate the request body
  try {
    await coinRateSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.details.map((d) => d.message), // Map validation errors
        400
      )
    );
  }

  // Step 2: Extract company_id from request body
  const companyId = req.body.company_id;

  // Step 3: Check if the company exists in the users table
  const companyExists = await QueryModel.findOne("users", { id: companyId });

  if (!companyExists) {
    return next(new ErrorHandler("Company not found.", 404));
  }

  // Step 4: Prepare data for insertion into the company_data table
  const insertData = {
    company_id: companyId,
    coin_rate: req.body.coin_rate,
    description: req.body.description || "", // Optional description
  };

  // Step 5: Insert the coin rate data into the company_data table
  try {
    const coinRate = await QueryModel.saveData(
      "company_data",
      insertData,
      next
    );

    // Success response
    req.flash("msg_response", {
      status: 200,
      message: "Coin rate added successfully for the company.",
    });

    // Redirect to the users page after successful insert
    res.redirect(`/admin/users`);
  } catch (err) {
    console.error("Error saving coin rate data:", err);
    return next(new ErrorHandler("Error while saving coin rate data.", 500));
  }
});

// exports.submitCompanyForm = catchAsyncErrors(async (req, res, next) => {
//   const { coin_rate, description } = req.body; // Extract data from the request body
//   const companyId = req.params.id; // Get the company ID from the request parameters

//   // Validate input (basic example; you can add more validation as needed)
//   if (!coin_rate || !description) {
//     return next(
//       new ErrorHandler("Coin rate and description are required", 400)
//     );
//   }

//   try {
//     // Check if the company data already exists
//     const existingCompanyDataQuery = await db.query(
//       "SELECT * FROM company_data WHERE company_id = ?",
//       [companyId]
//     );

//     // If data exists, update the existing record
//     if (existingCompanyDataQuery[0].length > 0) {
//       await db.query(
//         "UPDATE company_data SET coin_rate = ?, description = ? WHERE company_id = ?",
//         [coin_rate, description, companyId]
//       );

//       // Optionally, set a flash message or response for successful update
//       req.flash("msg_response", {
//         status: 200,
//         message: "Coin rate updated successfully for company ID: " + companyId,
//       });
//     } else {
//       // If data does not exist, insert a new record
//       const insertData = {
//         company_id: companyId,
//         coin_rate: coin_rate,
//         description: description,
//       };

//       await db.query("INSERT INTO company_data SET ?", insertData);

//       // Optionally, set a flash message or response for successful insertion
//       req.flash("msg_response", {
//         status: 200,
//         message:
//           "Coin rate submitted successfully for company ID: " + companyId,
//       });
//     }

//     // Redirect back to the index page or another appropriate page
//     res.redirect("/admin/" + module_slug); // Change this to the appropriate redirection
//   } catch (error) {
//     console.error("Error while submitting company form:", error);
//     return next(
//       new ErrorHandler(
//         "An error occurred while submitting the company form",
//         500
//       )
//     );
//   }
// });

// exports.showCompanyForm = catchAsyncErrors(async (req, res, next) => {
//   const companyId = req.params.id; // Get the company ID from the URL

//   // Fetch the company details from the database
//   const companyDetail = await db.query("SELECT * FROM users WHERE id = ?", [
//     companyId,
//   ]);

//   const company = companyDetail[0][0]; // Extract the company object from the result

//   // Check if the company exists
//   if (!company) {
//     return next(new ErrorHandler("Company not found", 404)); // Handle company not found
//   }

//   // Fetch the existing company data from the company_data table
//   const companyDataQuery = await db.query(
//     "SELECT * FROM company_data WHERE company_id = ?",
//     [companyId]
//   );

//   const companyData = companyDataQuery[0][0] || {}; // Get the company data or set to an empty object if not found

//   // Render the company form view with the company details and existing company data
//   res.render(module_slug + "/company-form", {
//     layout: module_layout, // Assuming there's a layout file
//     title: "Submit Company Data",
//     companyId, // Pass the company ID to the form
//     company, // Pass the company object to the view
//     companyData, // Pass the existing company data (coin_rate, description)
//   });
// });

///////////////////////////////////////////////

// API to get a single user record

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from request parameters
  console.log("Fetching user with ID:", userId); // Log user ID

  try {
    // Parameterized query to avoid SQL injection
    const query = `
    SELECT
      u.user_name,
      u.email,
      u.date_created,
      u.user_type,
      u.status,
      u.mobile,
      c.coin_rate,
      c.description
    FROM
      users u
    INNER JOIN
      company_data c ON u.id = c.company_id  -- Join on the user id and company_id
    WHERE
      u.id = ?  -- Filter by user id (passed as userId)
  `;

    console.log("Executing query:", query);
    const result = await mysqlPool.query(query, [userId]);
    console.log("Query result:", result);

    // Check if the result has the correct structure
    if (!result || result.length === 0) {
      console.log(`User with ID ${userId} not found in database.`);
      return res.status(404).send("User not found");
    }

    // Get the user data from the result
    const user = result[0][0]; // The user object
    console.log("User data retrieved:", user);

    // Render the user detail page with the user data
    res.render(module_slug + "/detail", {
      layout: module_layout,
      title: module_single_title,
      user,
    });
  } catch (error) {
    console.error("Database query error:", error); // Log the detailed error
    return res.status(500).send("Server Error: " + error.message); // Return error message
  }
});

////////////////////

exports.editUserForm = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from request parameters
  console.log("User ID:", userId); // Log the user ID for debugging

  // Fetch the user data from the 'users' table by userId
  const userQuery = `
    SELECT
      u.user_name,
      u.email,
      u.date_created,
      u.user_type,
      u.status,
      u.mobile
    FROM
      users u
    WHERE
      u.id = ?
  `;

  // Execute the query to fetch the user data
  const userResult = await mysqlPool.query(userQuery, [userId]);
  const user = userResult[0][0]; // Get the user data

  if (!user) {
    // Return an error if the user is not found
    console.log("User not found");
    return next(new ErrorHandler("User not found", 404));
  }

  // Log the user data for debugging
  console.log("User Data:", user);

  // Fetch the company data using the same user.id as company_id from the 'company_data' table
  const companyQuery = `
    SELECT
      c.coin_rate,
      c.description
    FROM
      company_data c
    WHERE
      c.company_id = ?
  `;

  // Execute the query to fetch the company data
  const companyResult = await mysqlPool.query(companyQuery, [userId]); // user.id is used as company_id
  const companyData = companyResult[0][0]; // Get the company data

  if (!companyData) {
    // Return an error if the company data is not found
    console.log("Company data not found");
    return next(new ErrorHandler("Company not found", 404));
  }

  // Log the company data for debugging
  console.log("Company Data:", companyData);
  console.log("user", user);

  // Render the 'edit' view and pass the necessary data
  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text, // Title for the page
    userId,
    user, // Pass the user details to the view
    companyData, // Pass the company data to the view
    module_slug, // Pass the module_slug to the view
  });
});

////////////////////////////

// The function to update the user and company details in the database
exports.updateUserRecord = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from the request parameters

  // Extract updated data from the request body with validation checks
  const { user_name, email, status, coin_rate, description } = req.body;

  // Prepare the query for updating the `users` table
  const updateUserQuery = `
    UPDATE users
    SET 
      user_name = ?, 
      email = ?, 
      status = ?
    WHERE 
      id = ?
  `;

  try {
    // Execute the query to update user data
    const updateUserResult = await mysqlPool.query(updateUserQuery, [
      user_name,
      email,
      status,
      userId,
    ]);

    // Check if any rows were affected in the `users` table
    if (updateUserResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Prepare the query for updating the `company_data` table
    const updateCompanyQuery = `
      UPDATE company_data
      SET 
        coin_rate = ?, 
        description = ?
      WHERE 
        company_id = ?
    `;

    // Execute the query to update company data
    const updateCompanyResult = await mysqlPool.query(updateCompanyQuery, [
      coin_rate,
      description,
      userId, // Use user ID as the company ID for consistency
    ]);

    // Check if any rows were affected in the `company_data` table
    if (updateCompanyResult[0].affectedRows === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    // Send success response with a flash message
    req.flash("msg_response", {
      status: 200,
      message: "Successfully updated user and company details.",
    });

    // Redirect to the admin module page
    res.redirect(`/admin/${module_slug}`);
  } catch (error) {
    console.error("Error in updating user and company data:", error);
    return next(new ErrorHandler("An error occurred while updating data", 500));
  }
});

///////////////////////////////////////////////

exports.deleteRecord = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get the user ID from the request parameters

  const deleteUserQuery = `
    DELETE FROM users WHERE id = ?
  `;

  const deleteCompanyQuery = `
    DELETE FROM company_data WHERE company_id = ?
  `;

  try {
    // Delete from the users table
    const deleteUserResult = await mysqlPool.query(deleteUserQuery, [userId]);

    if (deleteUserResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Delete from the company_data table using the same userId as company_id
    const deleteCompanyResult = await mysqlPool.query(deleteCompanyQuery, [
      userId,
    ]);

    if (deleteCompanyResult[0].affectedRows === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    req.flash("msg_response", {
      status: 200,
      message: "Successfully deleted " + module_single_title,
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (error) {
    console.error("Error in deleting user and company data:", error);
    return next(new ErrorHandler("An error occurred while deleting data", 500));
  }
});

// Sell API function with validation and structured data insertion
// Sell API function

// exports.createSellTransaction = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Log the incoming request body for debugging
//     console.log("Request Body:", req.body);

//     // Validate incoming request body against the schema
//     await sellTransactionSchema.validateAsync(req.body, {
//       abortEarly: false, // Continue validation after the first error
//       allowUnknown: true, // Allow unknown fields
//     });

//     // Assume user_id is extracted from session or token
//     const user_id = req.user?.id; // Use optional chaining to avoid undefined errors

//     if (!user_id) {
//       return next(new ErrorHandler("User ID is required", 401)); // Handle missing user_id
//     }

//     // Create a new transaction object
//     const newTransaction = new sellTransactionSchema({
//       user_id,
//       ...req.body, // Spread validated request body properties
//       date_created: new Date(), // Set current date
//       status: "unapproved", // Set initial status if needed
//     });

//     // Save the transaction to the database
//     const savedTransaction = await newTransaction.save();
//     console.log("Saved Transaction:", savedTransaction); // Log the saved transaction

//     // Respond with success message and transaction data
//     res.status(201).json({
//       success: true,
//       message: "Transaction created successfully!",
//       data: savedTransaction,
//     });
//   } catch (error) {
//     console.error("Error creating sell transaction:", error); // Log the complete error object

//     if (error.isJoi) {
//       // Handle Joi validation errors
//       return next(
//         new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
//       );
//     }

//     // Handle Mongoose validation or other database errors
//     if (error.name === "ValidationError") {
//       return next(new ErrorHandler("Validation error: " + error.message, 400));
//     }

//     // Handle other types of errors
//     return next(
//       new ErrorHandler("Failed to create transaction: " + error.message, 500)
//     );
//   }
// });

exports.getAllCompaniesApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch all users where user_type is 'company' and join with company_data to get additional details
    const companiesQuery = await db.query(
      `SELECT u.id AS company_id, u.user_name AS company_name, 
              c.coin_rate, c.description 
       FROM users u 
       LEFT JOIN company_data c ON u.id = c.company_id 
       WHERE u.user_type = 'company'`
    );

    console.log("Companies query result:", companiesQuery);

    // If no companies are found
    if (companiesQuery[0].length === 0) {
      return next(new ErrorHandler("No companies found", 404));
    }

    // Map the results to a structured array of companies
    const companies = companiesQuery[0].map((company) => ({
      company_id: company.company_id,
      company_name: company.company_name,
      coin_rate: company.coin_rate || 0, // Set to 0 if null
      description: company.description || "", // Set to an empty string if null
    }));

    // Send the response with the list of companies
    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return next(
      new ErrorHandler("An error occurred while fetching companies", 500)
    );
  }
});

exports.getCompanyDetailApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the company ID from the request, assuming it's passed as a parameter
    const companyId = req.params.id;

    // Log the companyId to verify it
    console.log("Company ID being fetched:", companyId);

    // Check if companyId is undefined or null
    if (!companyId) {
      return next(new ErrorHandler("Company ID is missing", 400));
    }

    // Fetch user details from the 'users' table where user_type is 'company'
    const userQuery = await db.query(
      "SELECT user_name FROM users WHERE id = ? AND user_type = 'company'",
      [companyId]
    );

    console.log("User query result:", userQuery);

    // If the user doesn't exist or is not a company
    if (userQuery[0].length === 0) {
      return next(new ErrorHandler("Company user not found", 404));
    }

    const user = userQuery[0][0]; // Extract user details

    // Fetch company data from the 'company_data' table using the companyId
    const companyDataQuery = await db.query(
      "SELECT coin_rate, description FROM company_data WHERE company_id = ?",
      [companyId]
    );

    console.log("Company data query result:", companyDataQuery);

    // If company data doesn't exist
    if (companyDataQuery[0].length === 0) {
      return next(new ErrorHandler("Company data not found", 404));
    }

    const companyData = companyDataQuery[0][0]; // Extract company data details

    // Construct the response object with all the necessary details
    const companyProfile = {
      company_name: user.user_name,
      coin_rate: companyData.coin_rate || 0, // If coin_rate is null, set to 0
      description: companyData.description || "", // If description is null, set to an empty string
    };

    // Send the response with the company's profile
    res.status(200).json({
      data: companyProfile,
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return next(
      new ErrorHandler("An error occurred while fetching company profile", 500)
    );
  }
});
