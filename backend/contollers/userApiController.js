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

const registerSchema = Joi.object({
  user_name: Joi.string().required().max(50),
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(8).required(),
  referral_code: Joi.string().optional(), // User might enter a referral code
});

const generateReferralCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";
  for (let i = 0; i < length; i++) {
    referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return referralCode;
};

// Register a user
// exports.registerUserApi = catchAsyncErrors(async (req, res, next) => {
//   const { user_name, mobile, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
//   const updated_at = new Date().toISOString().slice(0, 19).replace("T", " ");

//   try {
//     await registerSchema.validateAsync(req.body, {
//       abortEarly: false,
//       allowUnknown: true,
//     });
//   } catch (error) {
//     // Joi validation failed, send 400 Bad Request with error details
//     return next(
//       new ErrorHandler(
//         error.details.map((d) => d.message),
//         400
//       )
//     );
//   }

//   // Check if email or mobile number already exists
//   const existingEmail = await db.query("SELECT * FROM users WHERE email = ?", [
//     email,
//   ]);
//   const existingMobile = await db.query(
//     "SELECT * FROM users WHERE mobile = ?",
//     [mobile]
//   );

//   if (existingEmail[0].length > 0) {
//     // If email already exists, send a 400 Bad Request response
//     return next(new ErrorHandler("Email already exists", 400));
//   }

//   if (existingMobile[0].length > 0) {
//     // If mobile number already exists, send a 400 Bad Request response
//     return next(new ErrorHandler("Mobile number already exists", 400));
//   }

//   // Generate a unique referral code for the new user
//   const referral_code = crypto.randomBytes(4).toString("hex");

//   // Check if the referral code exists
//   let refferal_id = null;
//   if (referralCode) {
//     const referrer = await db.query(
//       "SELECT * FROM users WHERE referral_code = ?",
//       [referralCode]
//     );
//     if (referrer[0].length > 0) {
//       refferal_id = referralCode;
//     } else {
//       return next(new ErrorHandler("Invalid referral code", 400));
//     }
//   }

//   // Proceed with user creation if both email and mobile number do not exist

//   const userData = {
//     user_name,
//     mobile,
//     email,
//     password: hashedPassword,
//     user_type,
//     // referral_code,
//     // refferal_id,
//     created_at,
//     updated_at,
//   };
//   const userInsert = await db.query("INSERT INTO users SET ?", userData);

//   // Get the ID of the last inserted row
//   const lastInsertId = userInsert[0].insertId;

//   // Fetch the latest inserted user data using the ID
//   const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
//     lastInsertId,
//   ]);
//   const user = userDetail[0][0];
//   // Assuming `user` is the object returned from MySQL query
//   const token = User.generateToken(user.id); // Adjust as per your user object structure

//   sendToken(user, token, 201, res);
// });
// Function to generate a unique referral code

// Register a user
// Register a user
exports.registerUserApi = catchAsyncErrors(async (req, res, next) => {
  const {
    user_name,
    mobile,
    email,
    password,
    upi_id,
    user_type,
    referral_by, // This is the referral code provided by the new user
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");
  const date_modified = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    // Validate the request body with Joi schema
    await registerSchema.validateAsync(req.body, {
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

  // Check if email or mobile number already exists
  const existingEmail = await db.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  const existingMobile = await db.query(
    "SELECT * FROM users WHERE mobile = ?",
    [mobile]
  );

  if (existingEmail[0].length > 0) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  if (existingMobile[0].length > 0) {
    return next(new ErrorHandler("Mobile number already exists", 400));
  }

  let parentId = null; // This will hold the ID of the user whose referral code was used
  let referralBy = null; // This will hold the referral code of the user who sent the referral code

  // If a referral code is provided, find the parent user
  if (referral_by) {
    const [parentRows] = await db.query(
      "SELECT id, referral_code FROM user_data WHERE referral_code = ?",
      [referral_by]
    );

    if (parentRows.length > 0) {
      parentId = parentRows[0].id; // Set parentId to the user with this referral code
      referralBy = parentRows[0].referral_code; // Set referralBy to the parent's referral code
    } else {
      return next(new ErrorHandler("Invalid referral code", 400));
    }
  }

  // Generate a unique referral code for the new user
  const newReferralCode = generateReferralCode(); // Implement this function to generate a unique referral code

  // Prepare user data for users table
  const userData = {
    user_name,
    mobile,
    email,
    password: hashedPassword,
    user_type,
    date_created,
    date_modified,
    status: "0",
  };

  // Prepare user-specific data for user_data table
  const userData2 = {
    referral_code: newReferralCode, // Save the generated referral code for the new user
    upi_id,
    parent_id: parentId || null, // Set parent_id to the parentId if available
    referral_by: referralBy || null, // Store the parent's referral code as referral_by
  };

  // Insert user into the users table
  const userInsert = await db.query("INSERT INTO users SET ?", userData);
  const lastInsertId = userInsert[0].insertId;

  // Insert additional user data into the user_data table
  userData2.user_id = lastInsertId; // Assuming user_id is a foreign key in user_data table
  await db.query("INSERT INTO user_data SET ?", userData2);

  // Fetch the newly inserted user for token generation
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    lastInsertId,
  ]);
  const user = userDetail[0][0];

  // Generate token and send response
  const token = User.generateToken(user.id); // Adjust based on your User model
  sendToken(user, token, 201, res);
});

////////////////////////////////////////////////////////////////////////////////////////////

// Login user
exports.loginUserApi = catchAsyncErrors(async (req, res, next) => {
  const { emailOrMobile, password } = req.body;

  // Checking that user email/mobile and password are provided
  if (!emailOrMobile || !password) {
    return next(
      new ErrorHandler("Please enter email/mobile number and password", 400)
    );
  }

  // Find user by email or mobile number
  const userData = await db.query(
    "SELECT * FROM users WHERE email = ? OR mobile = ? LIMIT 1",
    [emailOrMobile, emailOrMobile]
  );
  const user = userData[0][0];

  // If user not found
  if (!user) {
    return next(
      new ErrorHandler("Invalid email/mobile number or password", 400)
    );
  }

  // Check if the user status is active (1)
  if (user.status == 0) {
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
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const token = User.generateToken(user.id); // Adjust as per your user object structure

  sendToken(user, token, 201, res);
});

exports.logoutApi = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

//forgot password for sending token in mail
exports.forgotPasswordApi = catchAsyncErrors(async (req, res, next) => {
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
exports.resetPasswordApi = catchAsyncErrors(async (req, res, next) => {
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
// exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
//   console.log(req.user);
//   const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
//     req.user.id,
//   ]);
//   const user = userDetail[0][0];

//   res.status(200).json({
//     success: true,
//     user,
//   });
// });

// update user password
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

// update user profile
exports.updateProfileApi = catchAsyncErrors(async (req, res, next) => {
  await db.query("UPDATE users SET user_name = ? , email = ? WHERE id = ?", [
    req.body.user_name,
    req.body.email,
    req.user.id,
  ]);

  res.status(200).json({
    success: true,
  });
});

exports.uploadScreenshotApi = catchAsyncErrors(async (req, res, next) => {
  // Check if a file was uploaded
  if (!req.file) {
    return next(new ErrorHandler("No file uploaded", 400));
  }
console.log("asdf",req.file);

  // Get the uploaded file's filename
  const pay_image = req.file.filename;

  // Get user ID from route parameters
  const user_id = req.params.id; // Now getting ID from the route parameter

  // Debugging: Log user ID and image filename
  console.log(`User ID from params: ${user_id}`);
  console.log(`Image Filename: ${pay_image}`);

  // Update the user data in the database
  try {
    const result = await db.query(
      "UPDATE user_data SET pay_image = ? WHERE id = ?",
      [
        pay_image, // Store the filename in the database
        user_id, // Use the user_id from the route parameter
      ]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return next(
        new ErrorHandler("No user found with the provided user ID", 404)
      );
    }

    // Send a success response back to the client
    res.status(200).json({
      success: true,
      message: "Screenshot uploaded successfully",
      pay_image, // Optionally return the filename
    });
  } catch (error) {
    console.error("Database update error:", error); // Log the error for debugging
    return next(new ErrorHandler("Database update failed", 500));
  }
});

exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch the user's ID from the request, assuming you're using a token-based system (like JWT)
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

    console.log("User details query result:", userDetailsQuery);

    // If the user doesn't exist
    if (userDetailsQuery[0].length === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    const user = userDetailsQuery[0][0]; // Extract user details

    // Fetch additional details from the 'user_data' table
    const userDataQuery = await db.query(
      "SELECT coins, pending_coin, upi_id FROM user_data WHERE user_id = ?",
      [userId]
    );

    console.log("User data query result:", userDataQuery);

    // If user_data doesn't exist
    if (userDataQuery[0].length === 0) {
      return next(new ErrorHandler("User data not found", 404));
    }

    const userData = userDataQuery[0][0]; // Extract user_data details

    // Construct the response object with all the necessary details
    const userProfile = {
      user_name: user.user_name,
      email: user.email,
      mobile: user.mobile,
      coins: userData.coins || 0, // If coins are null, set to 0
      pending_coin: userData.pending_coin || 0, // If pending coins are null, set to 0
      upi_id: userData.upi_id || "", // If upi_id is null, set to an empty string
    };

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

////////////////////////////////////

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

//////////////////////////////

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
