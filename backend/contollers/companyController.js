const Model = require("../models/companyModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const mysqlPool = require("../config/mysql_database"); // Adjust the path if necessary
const User = require("../models/userModel");

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
    // Fetch user data along with company_data
    const users = await db.query(
      `SELECT 
            u.id,
            u.user_name,
            u.email,
            u.mobile,
            DATE_FORMAT(u.date_created, "%d-%m-%Y") AS date_created,
            u.user_type,
            u.status,
            cd.coin_rate,
            cd.company_coin
         FROM users u
         JOIN company_data cd
         ON u.id = cd.company_id  -- Relating users.id with company_data.company_id
         WHERE u.user_type = ?`, // Fetch only where user_type is 'company'
      ["company"] // Directly passing the value 'company'
    );

    console.log(users);
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
    status: "1",
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


//////////////////////////

exports.loginCompanyApi = catchAsyncErrors(async (req, res, next) => {
  const { mobile, password } = req.body; // Change to mobile instead of emailOrMobile

  // Checking that mobile number and password are provided
  if (!mobile || !password) {
    return next(
      new ErrorHandler("Please enter mobile number and password", 400)
    );
  }

  // Find user by mobile number only
  const userData = await db.query(
    "SELECT * FROM users WHERE mobile = ? AND user_type = 'company' LIMIT 1",
    [mobile] // Query only with mobile and user_type = 'company'
  );
  const user = userData[0][0];

  // If user not found
  if (!user) {
    return next(new ErrorHandler("Invalid mobile number or password", 400));
  }

  // Debugging: Log user to check the values
  console.log(user); // Add this to check the user data being fetched

  // Ensure status is a number and check if the user is active
  if (parseInt(user.status) === 0) {
    // parseInt to ensure we compare number values
    return next(
      new ErrorHandler(
        "Your account is deactivated. Please contact support.",
        403
      )
    );
  }

  // Compare passwords
  const isPasswordMatched = await User.comparePasswords(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid mobile number or password", 400));
  }

  // Generate token for the authenticated user
  const token = User.generateToken(user.id); // Adjust as per your user object structure

  // Send the token and user details in the response
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      mobile: user.mobile,
      // Add any other user details you want to include in the response
    },
  });
});

/////////////////////

exports.forgotPasswordApi = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body; // Get email from request body

  // Find user by email
  const userDetail = await db.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  // If no user found
  if (userDetail[0].length === 0) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const user = userDetail[0][0];

  // Generate a new random password
  const newPassword = crypto.randomBytes(3).toString("hex"); // Generate a random 8-byte password

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password in the database
  const query = "UPDATE users SET password = ? WHERE id = ?";
  await db.query(query, [hashedPassword, user.id]);

  // Send email to the user with the new password using sendEmail function
  const emailOptions = {
    email: user.email, // User's email from the database
    subject: "Your new password",
    message: `Your new password is: ${newPassword}. Please use it to login to your account.`,
  };

  try {
    await sendEmail(emailOptions); // Call sendEmail to send the email
    res.status(200).json({
      success: true,
      message: "New password has been sent to your email.",
    });
  } catch (error) {
    return next(new ErrorHandler("Error sending email", 500));
  }
});

///////////////////

exports.updatePasswordApi = catchAsyncErrors(async (req, res, next) => {
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    req.user.id,
  ]);
  const user = userDetail[0][0];

  const isPasswordMatched = await User.comparePasswords(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not matched", 400));
  }

  // user.password = req.body.newPassword;

  // await user.save();

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
  const query = "UPDATE users SET password = ? WHERE id = ?";
  // Execute the update query
  const result = await db.query(query, [hashedPassword, user.id]);

  const token = User.generateToken(user.id);
  sendToken(user, token, 200, res);
});

////////////////////////////////////

exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the user's ID from the request
    const userId = req.user.id;

    // Check if userId is undefined or null
    if (!userId) {
      return next(new ErrorHandler("User ID is missing", 400));
    }

    // Fetch user details from the 'users' table
    const userDetailsQuery = await db.query(
      "SELECT user_name, email, mobile FROM users WHERE id = ?",
      [userId]
    );

    if (userDetailsQuery[0].length === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    const user = userDetailsQuery[0][0]; // Extract user details

    // Fetch additional details from the 'user_data' table
    const userDataQuery = await db.query(
      "SELECT coin_rate, pending_coin, upi_id, user_photo, referral_code FROM company_data WHERE company_id = ?",
      [userId]
    );

    if (userDataQuery[0].length === 0) {
      return next(new ErrorHandler("User data not found", 404));
    }

    const userData = userDataQuery[0][0]; // Extract user_data details
    const referralCode = userData.referral_code; // Get the referral code of the logged-in user

    // Count how many users have used this referral code
    const referralCountQuery = await db.query(
      "SELECT COUNT(*) AS referral_count FROM user_data WHERE referral_by = ?",
      [referralCode]
    );

    const referralCount = referralCountQuery[0][0].referral_count || 0; // Extract referral count

    // Construct the response object with all the necessary details
    const userProfile = {
      user_name: user.user_name,
      email: user.email,
      mobile: user.mobile,
      coins: userData.coins || 0, // If coins are null, set to 0
      pending_coin: userData.pending_coin || 0, // If pending coins are null, set to 0
      upi_id: userData.upi_id || "", // If upi_id is null, set to an empty string
      user_photo: userData.user_photo
        ? `${process.env.BACKEND_URL}uploads/${userData.user_photo}`
        : null, // Full URL for user photo or null if not set
      referral_count: referralCount, // Include referral count in the response
      referral_code: userData.referral_code,
    };
    console.log(userProfile);

    // Send the response with the user's profile
    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return next(
      new ErrorHandler("An error occurred while fetching user profile", 500)
    );
  }
});
