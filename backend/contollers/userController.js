const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const crypto = require("crypto");
const db = require("../config/mysql_database");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const Model = require("../models/userModel");
const QueryModel = require("../models/queryModel");
const UserModel = require("../models/userModel");

const { v4: uuidv4 } = require("uuid");
// const pool = require('../config/db');  // Assuming you're using MySQL pool
const {
  findAvailableParentByReferral,
  findNextAvailableParent,
  updatePendingCoins,
  distributeCoinsToParents,
  hasBothChildren,
  addUser,
} = require("../utils/treeLogic");
const table_name = Model.table_name;
const table_name2 = Model.table_name2;
const table_name3 = Model.table_name3;

const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;

const registerSchema = Joi.object({
  user_name: Joi.string().required().max(50),
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(8).required(),
});

// Register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { user_name, mobile, email, password, user_type } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");
  const date_modified = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    await registerSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    // Joi validation failed, send 400 Bad Request with error details
    return next(
      new ErrorHandler(
        error.details.map((d) => d.message),
        400
      )
    );
  }

  // Check if email already exists
  const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (existingUser[0].length > 0) {
    // If email already exists, send a 400 Bad Request response
    return next(new ErrorHandler("Email already exists", 400));
  }

  const userData = {
    user_name,
    mobile,
    email,
    password: hashedPassword,
    date_created,
    date_modified,
  };
  const userInsert = await db.query("INSERT INTO users SET ?", userData);

  // Get the ID of the last inserted row
  const lastInsertId = userInsert[0].insertId;

  // Fetch the latest inserted user data using the ID
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    lastInsertId,
  ]);
  const user = userDetail[0][0];
  // Assuming `user` is the object returned from MySQL query
  const token = User.generateToken(user.id); // Adjust as per your user object structure

  sendToken(user, token, 201, res);
});

exports.showLogin = catchAsyncErrors(async (req, res, next) => {
  const message = req.flash("msg_response");

  if (req.user) {
    res.redirect("/admin/dashboard");
  }

  res.render("users/login", { message });
});

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Checking if user email and password are provided
  if (!email || !password) {
    req.flash("msg_response", {
      status: 400,
      message: "Please enter email and password",
    });
    return res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
  }

  // Find user by email
  const userData = await db.query(
    "SELECT * FROM users WHERE email = ? limit 1",
    [email]
  );

  const user = userData[0][0];

  // If user not found
  if (!user) {
    req.flash("msg_response", {
      status: 400,
      message: "Invalid email or password",
    });
    return res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
  }

  // Compare passwords
  const isPasswordMatched = await User.comparePasswords(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    req.flash("msg_response", {
      status: 400,
      message: "Invalid email or password",
    });
    return res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
  }

  const token = User.generateToken(user.id); // Adjust as per your user object structure

  // Send token and then redirect
  sendToken(user, token, 201, res);

  req.flash("msg_response", { status: 200, message: "Successfully LoggedIn" });

  // Redirect to the dashboard after sending the token
  return res.redirect(`/${process.env.ADMIN_PREFIX}/dashboard`);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  //req.flash('msg_response', { status: 200, message: 'Logout Successfully' });
  req.flash("msg_response", { status: 200, message: "Logout Successfully" });

  res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
});

//forgot password for sending token in mail
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //const user = await User.findOne({email: req.body.email})
  const userData = await db.query(
    "SELECT * FROM users WHERE email = ? limit 1",
    [req.body.email]
  );
  const user = userData[0][0];

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //get ResetPasswordToken token
  const resetTokenValues = User.getResetPasswordToken();

  const resetToken = resetTokenValues.resetToken;
  const resetPasswordToken = resetTokenValues.resetPasswordToken;
  const resetPasswordExpire = resetTokenValues.resetPasswordExpire;

  /*await user.save({validateBeforeSave: false});*/

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested reset password then please ingone it`;

  try {
    const query =
      "UPDATE users SET reset_password_token = ?, reset_password_expire = ? WHERE email = ?";
    // Execute the update query
    const result = await db.query(query, [
      resetPasswordToken,
      resetPasswordExpire,
      req.body.email,
    ]);

    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${user.email}`,
    });
  } catch (error) {
    await db.query(
      `UPDATE users SET reset_password_token = '', reset_password_expire = '' WHERE email = ${req.body.email}`
    );

    return next(new ErrorHandler(error.message, 500));
  }
});

// reset user password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const currentTime = Date.now();

  const query = `
        SELECT *
        FROM users
        WHERE reset_password_token = ? 
        AND reset_password_expire > ?
    `;

  // Execute the query
  const userDetail = await db.query(query, [resetPasswordToken, currentTime]);
  const user = userDetail[0][0];

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        404
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 404));
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const query_2 =
    "UPDATE users SET password = ?, reset_password_token = ?,reset_password_expire = ?  WHERE id = ?";
  // Execute the update query
  const result = await db.query(query_2, [hashedPassword, "", "", user.id]);

  const token = User.generateToken(user.id); // Adjust as per your user object structure

  sendToken(user, token, 201, res);
});

// get user detail
exports.getUserDetail = catchAsyncErrors(async (req, res, next) => {
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    req.user.id,
  ]);

  const user = userDetail[0][0];
  const message = req.flash("msg_response");
  res.render("users/profile", {
    layout: "layouts/main",
    title: "Profile",
    user,
    message,
  });
  /* res.status(200).json({
            success: true,
            user
        })*/
});

// update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    req.user.id,
  ]);
  const user = userDetail[0][0];

  const isPasswordMatched = await User.comparePasswords(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordMatched) {
    // return next(new ErrorHandler("Old password is incorrect",400));
    req.flash("msg_response", {
      status: 400,
      message: "Old password is incorrect",
    });
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    //return next(new ErrorHandler("password does not matched",400));
    req.flash("msg_response", {
      status: 400,
      message: "password does not matched",
    });
  }

  // user.password = req.body.newPassword;

  // await user.save();

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
  const query = "UPDATE users SET password = ? WHERE id = ?";
  // Execute the update query
  const result = await db.query(query, [hashedPassword, user.id]);

  const token = User.generateToken(user.id);
  sendToken(user, token, 200, res);

  // res.redirect(`/${process.env.ADMIN_PREFIX}/me`);
});

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  await db.query("UPDATE users SET user_name = ?  WHERE id = ?", [
    req.body.user_name,
    req.user.id,
  ]);

  const message = req.flash("msg_response", {
    status: 200,
    message: "Successfully updated profile",
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/me`);
});

/***************************************/

exports.checkAdminLoginOrDashboard = catchAsyncErrors(
  async (req, res, next) => {
    if (!req.user) {
      res.redirect("/admin/login");
    } else {
      res.redirect("/admin/dashboard");
    }
  }
);

exports.dashboard = catchAsyncErrors(async (req, res, next) => {
  res.render("users/dashboard", { layout: "layouts/main", title: "Dashboard" });
});

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  // Fetch user data along with pay_image in a single query using LEFT JOIN
  const users = await db.query(
    `SELECT 
        u.id,
        u.user_name,
        u.email,
        u.mobile,
        DATE_FORMAT(u.date_created, "%d-%m-%Y") AS date_created,
        ud.pay_image,
        u.user_type   -- Selecting user_type from the users table
     FROM users u
     INNER JOIN user_data ud ON u.id = ud.user_id 
      WHERE u.user_type IN (?, ?)`,
    ["user", "company"]
  );

  res.render(module_slug + "/index", {
    layout: module_layout,
    title: module_single_title + " " + module_add_text,
    module_slug,
    users, // Pass the users array directly
    originalUrl: req.originalUrl, // Pass the original URL here
  });
});

exports.addFrom = catchAsyncErrors(async (req, res, next) => {
  res.render(module_slug + "/add", {
    layout: module_layout,
    title: module_single_title + " " + module_add_text,
    module_slug,
  });
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

  // Step 2: Prepare data for insertion into the user table
  const insertData = {
    user_name: req.body.user_name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password, 10),
    status: req.body.status,
    date_created: date_created,
    user_type: req.body.user_type, // Get user_type from the form
    date_modified: date_created,
  };

  try {
    // Step 3: Insert the user data into the database
    const user = await QueryModel.saveData(table_name, insertData, next);
    console.log(user);

    const referralBy = req.body.referral_by;

    let parentId = null;
    let position = null;

    // Step 1: Handle referral logic before inserting the user
    if (referralBy) {
      const parentInfo = await findAvailableParentByReferral(referralBy);
      console.log("iii==>" + parentInfo);
      if (parentInfo) {
        parentId = parentInfo.parentId; // Parent ID of the referred user
        position = parentInfo.position; // Position (left or right child)
      } else {
        return next(
          new ErrorHandler(
            "No available parent found for the given referral code.",
            400
          )
        );
      }
    }
    // Prepare data for another related table (e.g., blog)
    const insertData2 = {
      user_id: user.id,
      upi_id: req.body.upi,
      referral_by: req.body.referral_by,
      referral_code: req.body.referral_code || generateReferralCode(),
      parent_id: parentId, // Assign parent_id if available
      leftchild_id: position === "leftchild_id" ? parentId : null,
      rightchild_id: position === "rightchild_id" ? parentId : null,
      // You can also assign the position here if needed
    };
    // Step 4: Insert other related data (for blog or another table)
    const blog = await QueryModel.saveData(table_name2, insertData2, next);

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

// Function to generate a unique referral code
function generateReferralCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // Generates a random 6-character referral code
}

exports.updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const userId = req.body.userId; // User ID ko request body se le
  const newStatus = req.body.status; // Naya status request body se le

  try {
    // SQL query to update user status
    await db.query(`UPDATE users SET status = ? WHERE id = ?`, [
      newStatus,
      userId,
    ]);

    // Redirect back to the original URL
    const redirectUrl = req.body.redirect || "/admin/users"; // Default redirect URL
    res.redirect(redirectUrl); // Redirect back
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).send("Internal Server Error");
  }
});

//////////////////////////////////////////////////

// Joi schema for validation
const coinRateSchema = Joi.object({
  company_id: Joi.number().integer().required(),
  coin_rate: Joi.string().required(),
  description: Joi.string().optional(),
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

exports.submitCompanyForm = catchAsyncErrors(async (req, res, next) => {
  const { coin_rate, description } = req.body; // Extract data from the request body
  const companyId = req.params.id; // Get the company ID from the request parameters

  // Validate input (basic example; you can add more validation as needed)
  if (!coin_rate || !description) {
    return next(
      new ErrorHandler("Coin rate and description are required", 400)
    );
  }

  try {
    // Check if the company data already exists
    const existingCompanyDataQuery = await db.query(
      "SELECT * FROM company_data WHERE company_id = ?",
      [companyId]
    );

    // If data exists, update the existing record
    if (existingCompanyDataQuery[0].length > 0) {
      await db.query(
        "UPDATE company_data SET coin_rate = ?, description = ? WHERE company_id = ?",
        [coin_rate, description, companyId]
      );

      // Optionally, set a flash message or response for successful update
      req.flash("msg_response", {
        status: 200,
        message: "Coin rate updated successfully for company ID: " + companyId,
      });
    } else {
      // If data does not exist, insert a new record
      const insertData = {
        company_id: companyId,
        coin_rate: coin_rate,
        description: description,
      };

      await db.query("INSERT INTO company_data SET ?", insertData);

      // Optionally, set a flash message or response for successful insertion
      req.flash("msg_response", {
        status: 200,
        message:
          "Coin rate submitted successfully for company ID: " + companyId,
      });
    }

    // Redirect back to the index page or another appropriate page
    res.redirect("/admin/" + module_slug); // Change this to the appropriate redirection
  } catch (error) {
    console.error("Error while submitting company form:", error);
    return next(
      new ErrorHandler(
        "An error occurred while submitting the company form",
        500
      )
    );
  }
});

exports.showCompanyForm = catchAsyncErrors(async (req, res, next) => {
  const companyId = req.params.id; // Get the company ID from the URL

  // Fetch the company details from the database
  const companyDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    companyId,
  ]);

  const company = companyDetail[0][0]; // Extract the company object from the result

  // Check if the company exists
  if (!company) {
    return next(new ErrorHandler("Company not found", 404)); // Handle company not found
  }

  // Fetch the existing company data from the company_data table
  const companyDataQuery = await db.query(
    "SELECT * FROM company_data WHERE company_id = ?",
    [companyId]
  );

  const companyData = companyDataQuery[0][0] || {}; // Get the company data or set to an empty object if not found

  // Render the company form view with the company details and existing company data
  res.render(module_slug + "/company-form", {
    layout: module_layout, // Assuming there's a layout file
    title: "Submit Company Data",
    companyId, // Pass the company ID to the form
    company, // Pass the company object to the view
    companyData, // Pass the existing company data (coin_rate, description)
  });
});

///////////////////////////////////////////////

// API to get a single user record
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  // Find the user by ID using the Mongoose model
  const user = await QueryModel.findById(table_name, req.params.id, next);

  if (!user) {
    return res.status(404).send("User not found");
  }

  // Render the user details page
  res.render(module_slug + "/detail", {
    layout: module_layout, // Use the correct layout
    title: module_single_title, // Use the correct title
    user,
  });
});

////////////////////

exports.editUserForm = catchAsyncErrors(async (req, res, next) => {
  const user = await QueryModel.findById(table_name, req.params.id, next);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text,
    user, // Pass the user details to the view
    module_slug,
  });
});

////////////////////////////

exports.updateUserRecord = catchAsyncErrors(async (req, res, next) => {

  const updateData = {
    user_name: req.body.user_name,
    email: req.body.email,
    status: req.body.status,
  };

  // Call your function to update the user in the database
  const user = await QueryModel.findByIdAndUpdateData(
    table_name,
    req.params.id,
    updateData,
    next
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  req.flash("msg_response", {
    status: 200,
    message: "Successfully updated user details.",
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`); // Redirect to the index page
});

///////////////////////////////////////////////


exports.deleteRecord = catchAsyncErrors(async (req, res, next) => {
  await QueryModel.findByIdAndDelete(table_name, req.params.id, next);

  req.flash("msg_response", {
    status: 200,
    message: "Successfully deleted " + module_single_title,
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
});
