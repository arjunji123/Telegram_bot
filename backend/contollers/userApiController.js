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
const QueryModel = require("../models/queryModel");
const { log } = require("console");
const moment = require("moment-timezone");

const registerSchema = Joi.object({
  user_name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().length(10).required(), // Assuming mobile is a 10-digit number
  password: Joi.string().min(8).required(),
  user_type: Joi.string().valid("user", "admin").required(), // Adjust as needed
  // referral_by: Joi.string().optional(), // If this field is optional
});

// const generateReferralCode = (length = 8) => {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let referralCode = "UNITRADE"; // Prefix the referral code with "UNITRADE"
//   for (let i = 0; i < length; i++) {
//     referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return referralCode;
// };
const generateReferralCode = (userId) => {
  const referralCode = `UNITRADE${userId}`; // Prefix "UNITRADE" with the user's user_id
  return referralCode;
};

exports.registerUserApi = catchAsyncErrors(async (req, res, next) => {
  // Validate request body with Joi schema
  try {
    await registerSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    const errorMessages = error.details
      ? error.details.map((d) => d.message)
      : ["Validation failed"];
    return res.status(400).json({ success: false, error: errorMessages });
  }

  const dateCreated = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (req.file) req.body.image = req.file.filename;
  // Check if email, mobile, or UPI ID already exists
  const { email, mobile } = req.body;
  const existingUserQuery = `
  SELECT email, mobile FROM users WHERE email = ? OR mobile = ?
`;
  const [existingUserRows] = await db.query(existingUserQuery, [email, mobile]);

  if (existingUserRows.length > 0) {
    const existingUser = existingUserRows[0];
    if (existingUser.email === email) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }
    if (existingUser.mobile === mobile) {
      return res.status(400).json({
        success: false,
        error: "Mobile number already exists",
      });
    }
  }

  const insertData = {
    user_name: req.body.user_name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password, 10),
    date_created: dateCreated,
    status: "0",
    user_type: req.body.user_type,
    date_modified: dateCreated,
  };

  // User Data Model for insertion
  const UserDataModel = {
    async create(userData) {
      const query = `
        INSERT INTO user_data (user_id, upi_id, referral_by, referral_code, parent_id, leftchild_id, rightchild_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const result = await db.query(query, [
        userData.user_id,
        userData.upi_id,
        userData.referral_by,
        userData.referral_code,
        userData.parent_id,
        userData.leftchild_id,
        userData.rightchild_id,
      ]);
      return result;
    },
    async updateData(table, data, condition) {
      const query = `UPDATE ${table} SET ? WHERE ?`;
      const result = await db.query(query, [data, condition]);
      return result;
    },
  };

  // Function to check if a user has both children
  async function hasBothChildren(userId) {
    const query = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
    const [rows] = await db.query(query, [userId]);
    const user = rows[0];
    return user && user.leftchild_id !== null && user.rightchild_id !== null;
  }

  // Main function to find the available parent
  async function findAvailableParent(referralCode = null) {
    // If a referral code is provided, check for the user associated with it
    if (referralCode) {
      const userQuery = `SELECT user_id as parent_id FROM user_data WHERE referral_code = ?`;
      const [userRows] = await db.query(userQuery, [referralCode]);
      const currentUser = userRows[0];

      if (currentUser) {
        // Attempt to find an available spot in the referred user's subtree
        const result = await findAvailableSpotInSubtree(currentUser.parent_id);
        if (result) {
          return result;
        }
        console.log("Referred user's subtree is fully occupied.");
      } else {
        console.log("No user found for the given referral code.");
      }
    }

    // If referral is not provided, or the referred user's subtree is fully occupied, find the next available parent
    const rootQuery = `SELECT user_id FROM user_data WHERE parent_id IS NULL`;
    const [rootRows] = await db.query(rootQuery);
    const root = rootRows[0];

    if (!root) return null;

    const queue = [root.user_id];
    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const parentQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
      const [parentRows] = await db.query(parentQuery, [currentParentId]);

      if (!parentRows.length) continue;

      const parent = parentRows[0];

      // Check for available child position
      if (parent.leftchild_id === null) {
        return { parentId: currentParentId, position: "leftchild_id" };
      }
      if (parent.rightchild_id === null) {
        return { parentId: currentParentId, position: "rightchild_id" };
      }

      queue.push(parent.leftchild_id);
      queue.push(parent.rightchild_id);
    }

    console.log("No available parent found");
    return null;
  }

  // Helper function to find an available spot in the subtree
  async function findAvailableSpotInSubtree(userId) {
    const queue = [userId];
    while (queue.length > 0) {
      const currentUserId = queue.shift();
      const childQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
      const [childRows] = await db.query(childQuery, [currentUserId]);

      if (!childRows.length) continue;

      const user = childRows[0];

      // Check for available child positions
      if (user.leftchild_id === null) {
        return { parentId: currentUserId, position: "leftchild_id" };
      }
      if (user.rightchild_id === null) {
        return { parentId: currentUserId, position: "rightchild_id" };
      }

      queue.push(user.leftchild_id);
      queue.push(user.rightchild_id);
    }

    return null; // No available spot found
  }
  // Main logic for user registration
  // Main logic for user registration
  // Main logic for user registration
let referralBy = req.body.referral_by; // Use 'let' to allow reassignment
let parentId = null;
let position = null;

if (referralBy) {
  const parentInfo = await findAvailableParent(referralBy);
  if (parentInfo) {
    parentId = parentInfo.parentId;
    position = parentInfo.position;
  } else {
    const nextParentInfo = await findAvailableParent();
    if (nextParentInfo) {
      parentId = nextParentInfo.parentId;
      position = nextParentInfo.position;
    }
  }
} else {
  // If referralBy is not provided, fetch the referral_code of the user where user_id = 2
  const defaultUser = await db.query("SELECT referral_code FROM user_data WHERE user_id = ?", [2]);
  const referralCode = defaultUser[0]?.[0]?.referral_code || null;

  const nextParentInfo = await findAvailableParent();
  if (nextParentInfo) {
    parentId = nextParentInfo.parentId;
    position = nextParentInfo.position;
  }

  referralBy = referralCode; // Set the referralBy to the referral_code of user_id = 2
}

try {
  // Insert user data into the users table
  const user = await QueryModel.saveData("users", insertData);
  const userId = user.id;
  const generatedReferralCode = generateReferralCode(userId);

  // Prepare additional data for the user_data table
  const insertData2 = {
    user_id: userId,
    upi_id: req.body.upi_id,
    referral_by: referralBy,
    referral_code: req.body.referral_code || generatedReferralCode,
    parent_id: parentId,
    leftchild_id: null,
    rightchild_id: null,
  };

  // Insert additional user data into user_data table
  const newUserData = await UserDataModel.create(insertData2);
  if (!newUserData) {
    return res.status(500).json({ success: false, error: "Error inserting user data" });
  }

  // Update parent record with the new child ID if parentId and position are set
  if (parentId && position) {
    const updateData = { [position]: userId };
    await UserDataModel.updateData("user_data", updateData, {
      user_id: parentId,
    });
  }

  // Fetch the newly inserted user to generate the token
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  const newUser = userDetail[0][0];

  // Generate token for the new user
  const token = User.generateToken(newUser.id);

  res.status(201).json({
    success: true,
    token,
    user: {
      ...newUser,
      referral_by: referralBy, // Include referral_by in the response (it will have the referral_code of user_id = 2)
    },
  });
  return;
} catch (error) {
  console.error("Error during user registration:", error);
  return res.status(500).json({ success: false, error: error.message });
}

});
////////////////////////////////////////////////////////////////////////////////////////////

// Login user
// Login user using mobile number
exports.loginUserApi = catchAsyncErrors(async (req, res, next) => {
  const { mobile, password } = req.body; // Change to mobile instead of emailOrMobile

  // Checking that mobile number and password are provided
  if (!mobile || !password) {
    return next(
      new ErrorHandler("Please enter mobile number and password", 400)
    );
  }

  // Find user by mobile number only
  const userData = await db.query(
    "SELECT * FROM users WHERE mobile = ? LIMIT 1",
    [mobile] // Query only with mobile
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

//////////////////////////////////////////

// get user detail
exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
  console.log(req.user);
  const userDetail = await db.query("SELECT * FROM users WHERE id = ?", [
    req.user.id,
  ]);
  const user = userDetail[0][0];

  res.status(200).json({
    success: true,
    user,
  });
});

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
  const userId = req.user.id;

  // Extract fields from the request body
  const { user_name, email, upi_id } = req.body;

  // Get the uploaded file's filename, if present
  let userPhotoFilename = req.file ? req.file.filename : null;

  // Debugging: Log user ID, user photo filename, and other fields
  console.log(`User ID: ${userId}`);
  console.log(`User Photo Filename: ${userPhotoFilename || "No file uploaded"}`);
  console.log(`Name: ${user_name}, Email: ${email}, UPI ID: ${upi_id}`);

  try {
    // Update the users table for user_name, email, and 
    await db.query(
      "UPDATE users SET user_name = ?, email = ? WHERE id = ?",
      [user_name, email, userId]
    );

    // Prepare the user_data table update query and data
    let query = "UPDATE user_data SET upi_id = ?";
    let data = [upi_id, userId];

    if (userPhotoFilename) {
      query += ", user_photo = ?";
      data.splice(1, 0, userPhotoFilename); // Insert `user_photo` before `user_id`
    }

    query += " WHERE user_id = ?";

    // Execute the user_data table update query
    const result = await db.query(query, data);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return next(new ErrorHandler("No user found with the provided user ID", 404));
    }

    // Send a success response back to the client
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user_id: userId,
        user_name,
        email,
        upi_id,
        user_photo: userPhotoFilename || "No image uploaded", // Optional in response
      },
    });
  } catch (error) {
    console.error("Database update error:", error); // Log the error for debugging
    return next(new ErrorHandler("Database update failed", 500));
  }
});

exports.uploadScreenshotApi = catchAsyncErrors(async (req, res, next) => {
  // Get user ID from route parameters
  const user_id = req.params.id;

  // Get UTR number and transaction ID from request body
  const { utr_no, transaction_id } = req.body;

  // Check if `utr_no` and `transaction_id` are provided
  if (!utr_no || !transaction_id) {
    return next(
      new ErrorHandler("UTR number and transaction ID are required", 400)
    );
  }

  // Get the uploaded file's filename, if present
  let pay_image = req.file ? req.file.filename : null;

  // Debugging: Log user ID, image filename (if present), UTR number, and transaction ID
  console.log(`User ID from params: ${user_id}`);
  console.log(`Image Filename: ${pay_image || "No file uploaded"}`);
  console.log(`UTR Number: ${utr_no}`);
  console.log(`Transaction ID: ${transaction_id}`);

  // Update the user data in the database
  try {
    // Prepare the query and data based on whether `pay_image` is present
    let query = "UPDATE user_data SET utr_no = ?, transaction_id = ?";
    let data = [utr_no, transaction_id, user_id];

    if (pay_image) {
      query += ", pay_image = ?";
      data.splice(2, 0, pay_image); // Insert `pay_image` before `user_id`
    }

    query += " WHERE user_id = ?";

    const result = await db.query(query, data);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return next(
        new ErrorHandler("No user found with the provided user ID", 404)
      );
    }

    // Send a success response back to the client
    res.status(200).json({
      success: true,
      message: "Data updated successfully",
      data: {
        user_id,
        pay_image: pay_image || "No image uploaded", // Optional in response
        utr_no,
        transaction_id,
      },
    });
  } catch (error) {
    console.error("Database update error:", error); // Log the error for debugging
    return next(new ErrorHandler("Database update failed", 500));
  }
});
// exports.uploadQuestScreenshotApi = catchAsyncErrors(async (req, res, next) => {
//   // Check if files were uploaded
//   if (!req.files || req.files.length === 0) {
//     return next(new ErrorHandler("No files uploaded", 400));
//   }

//   // Map each uploaded file to get the filename
//   const quest_screenshots = req.files.map(file => file.filename); 
//   const quest_id = req.params.quest_id;

//   try {
//     // Convert filenames array to JSON for storage in the database
//     const updateResult = await db.query(
//       "UPDATE usercoin_audit SET quest_screenshot = ?, screenshot_upload_date = NOW() WHERE quest_id = ?",
//       [JSON.stringify(quest_screenshots), quest_id]
//     );

//     if (updateResult.affectedRows === 0) {
//       return next(new ErrorHandler("No quest found with the provided quest ID", 404));
//     }

//     res.status(200).json({ success: true, message: "Screenshots uploaded successfully" });
//   } catch (error) {
//     console.error("Database update error:", error);
//     return next(new ErrorHandler("Database update failed", 500));
//   }
// });

// exports.uploadQuestScreenshotApi = catchAsyncErrors(async (req, res, next) => {
//   const userId = req.user.id;  // Get the user ID from the request
  
//   // Check if files were uploaded
//   if (!req.files || req.files.length === 0) {
//     return next(new ErrorHandler("No files uploaded", 400));
//   }

//   // Map each uploaded file to get the filename
//   const quest_screenshots = req.files.map(file => file.filename);
//   const quest_id = req.params.quest_id;

//   // Debugging: Log user ID, quest ID, and uploaded file details
//   console.log(`User ID: ${userId}`);
//   console.log(`Quest ID: ${quest_id}`);
//   console.log(`Uploaded Files: ${quest_screenshots.join(", ")}`);

//   try {
//     // Update the usercoin_audit table to store the screenshots and upload date
//     const updateResult = await db.query(
//       "UPDATE usercoin_audit SET quest_screenshot = ?, screenshot_upload_date = NOW(),status = 'waiting' WHERE quest_id = ? AND user_id = ?",
//       [JSON.stringify(quest_screenshots), quest_id, userId]
//     );

//     // Check if the update was successful
//     if (updateResult.affectedRows === 0) {
//       return next(new ErrorHandler("No quest found with the provided quest ID or user ID", 404));
//     }

//     // Send a success response back to the client
//     res.status(200).json({
//       success: true,
//       message: "Quest screenshots uploaded successfully",
//       data: {
//         quest_id,
//         user_id: userId,
//         quest_screenshots: quest_screenshots,
//         status: "waiting",
//       },
//     });
//   } catch (error) {
//     console.error("Database update error:", error);
//     return next(new ErrorHandler("Database update failed", 500));
//   }
// });


// exports.uploadQuestScreenshotApi = catchAsyncErrors(async (req, res, next) => {
//   const userId = req.user.id; // Get the user ID from the request
//   const quest_id = req.params.quest_id;

//   // Check if files were uploaded
//   if (!req.files || req.files.length === 0) {
//     return next(new ErrorHandler("No files uploaded", 400));
//   }

//   // Map each uploaded file to get the filename
//   const quest_screenshots = req.files.map(file => file.filename);

//   // Debugging: Log user ID, quest ID, and uploaded file details
//   console.log(`User ID: ${userId}`);
//   console.log(`Quest ID: ${quest_id}`);
//   console.log(`Uploaded Files: ${quest_screenshots.join(", ")}`);

//   try {
//     await db.query("START TRANSACTION");

//     // Step 1: Update screenshots in usercoin_audit
//     const updateResult = await db.query(
//       "UPDATE usercoin_audit SET quest_screenshot = ?, screenshot_upload_date = NOW(), status = 'waiting' WHERE quest_id = ? AND user_id = ?",
//       [JSON.stringify(quest_screenshots), quest_id, userId]
//     );

//     if (updateResult.affectedRows === 0) {
//       await db.query("ROLLBACK");
//       return next(new ErrorHandler("No quest found with the provided quest ID or user ID", 404));
//     }

//     console.log("Quest screenshots updated successfully in usercoin_audit.");

//     // Step 2: Fetch quest details
//     const [questResult] = await db.query(
//       "SELECT id, coin_earn, activity, quest_name FROM quest WHERE id = ?",
//       [quest_id]
//     );

//     if (questResult.length === 0) {
//       await db.query("ROLLBACK");
//       return next(new ErrorHandler("Quest not found", 404));
//     }

//     const { id: fetchedQuestId, coin_earn: coinEarn, activity, quest_name: fetchedQuestName } = questResult[0];
//     console.log("Quest details fetched:", { fetchedQuestId, coinEarn, activity, fetchedQuestName });

//     const coinEarnValue = Math.floor(parseFloat(coinEarn));
//     if (isNaN(coinEarnValue) || coinEarnValue < 0) {
//       await db.query("ROLLBACK");
//       return next(new ErrorHandler("Invalid coin earn value", 400));
//     }

//     let pendingCoinValue = coinEarnValue; // Default value
//     let status = "completed"; // Default status

//     if (activity === "follow") { // If activity is "follow"
//       pendingCoinValue = 0;
//       status = "waiting";
//     }

//     console.log("Pending Coin Value:", pendingCoinValue, "Status:", status);

//     // Step 3: Insert into usercoin_audit
//     const insertAuditData = {
//       user_id: userId,
//       quest_id: fetchedQuestId,
//       pending_coin: pendingCoinValue,
//       coin_operation: "cr",
//       type: "quest",
//       title: "quest",
//       description: "quest",
//       status: status,
//       date_entered: new Date().toISOString().slice(0, 19).replace("T", " "),
//     };

//     const [insertAuditResult] = await db.query("INSERT INTO usercoin_audit SET ?", insertAuditData);

//     if (insertAuditResult.affectedRows === 0) {
//       await db.query("ROLLBACK");
//       return next(new ErrorHandler("Failed to complete quest", 500));
//     }

//     console.log("Audit log entry created for quest completion.");

//     // Step 4: Update pending_coin in user_data (only if activity is not "follow")
//     if (activity !== "follow") {
//       const [currentCoinResult] = await db.query(
//         "SELECT pending_coin FROM user_data WHERE user_id = ?",
//         [userId]
//       );

//       const currentPendingCoin = currentCoinResult[0]?.pending_coin || 0;
//       const newPendingCoin = currentPendingCoin + coinEarnValue;

//       const updateUserDataQuery = `
//         UPDATE user_data
//         SET pending_coin = ?
//         WHERE user_id = ?
//       `;

//       const [updateUserResult] = await db.query(updateUserDataQuery, [
//         newPendingCoin,
//         userId,
//       ]);

//       if (updateUserResult.affectedRows === 0) {
//         await db.query("ROLLBACK");
//         return next(new ErrorHandler("Failed to update pending_coin in user_data", 500));
//       }

//       console.log("Pending_coin updated successfully for user.");
//     }

//     // Step 5: Commit the transaction
//     await db.query("COMMIT");

//     let responseMessage = `Quest completed successfully. ${coinEarnValue} coins recorded in audit log.`;
//     if (activity === "follow") {
//       responseMessage = "Quest completed successfully. Approve by admin.";
//     }

//     // Final response
//     res.status(200).json({
//       success: true,
//       message: responseMessage,
//       data: {
//         user_id: userId,
//         quest_id: fetchedQuestId,
//         quest_name: fetchedQuestName,
//         quest_screenshots: quest_screenshots,
//         coin_earn: coinEarnValue,
//         status,
//         date_entered: new Date(),
//       },
//     });
//   } catch (error) {
//     console.error("Error during quest completion:", error);
//     await db.query("ROLLBACK");
//     return next(new ErrorHandler("Database query failed", 500));
//   }
// });

exports.uploadQuestScreenshotApi = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the request
  const quest_id = req.params.quest_id;

  // Check if the user already has an entry with status "waiting" for this quest
  const [existingStatusResult] = await db.query(
    "SELECT status FROM usercoin_audit WHERE quest_id = ? AND user_id = ? AND status = 'waiting'",
    [quest_id, userId]
  );

  if (existingStatusResult.length > 0) {
    // If status is already "waiting", prevent new uploads
    return res.status(400).json({
      success: false,
      message: "Image already uploaded. Status is still 'waiting'.",
    });
  }

  // Check if files were uploaded
  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  // Map each uploaded file to get the filename
  const quest_screenshots = req.files.map(file => file.filename);

  try {
    await db.query("START TRANSACTION");

    // Step 1: Update screenshots in usercoin_audit
    const updateResult = await db.query(
      "UPDATE usercoin_audit SET quest_screenshot = ?, screenshot_upload_date = NOW(), status = 'waiting' WHERE quest_id = ? AND user_id = ?",
      [JSON.stringify(quest_screenshots), quest_id, userId]
    );

    if (updateResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("No quest found with the provided quest ID or user ID", 404));
    }

    console.log("Quest screenshots updated successfully in usercoin_audit.");

    // Step 2: Fetch quest details
    const [questResult] = await db.query(
      "SELECT id, coin_earn, activity, quest_name FROM quest WHERE id = ?",
      [quest_id]
    );

    if (questResult.length === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Quest not found", 404));
    }

    const { id: fetchedQuestId, coin_earn: coinEarn, activity, quest_name: fetchedQuestName } = questResult[0];
    console.log("Quest details fetched:", { fetchedQuestId, coinEarn, activity, fetchedQuestName });

    const coinEarnValue = Math.floor(parseFloat(coinEarn));
    if (isNaN(coinEarnValue) || coinEarnValue < 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Invalid coin earn value", 400));
    }

    let pendingCoinValue = coinEarnValue; // Default value
    let status = "completed"; // Default status

    if (activity === "follow") { // If activity is "follow"
      pendingCoinValue = 0;
      status = "waiting";
    }

    console.log("Pending Coin Value:", pendingCoinValue, "Status:", status);

    // Step 3: Insert into usercoin_audit
    const insertAuditData = {
      user_id: userId,
      quest_id: fetchedQuestId,
      pending_coin: pendingCoinValue,
      coin_operation: "cr",
      type: "quest",
      title: "quest",
      description: "quest",
      status: status,
      date_entered: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    const [insertAuditResult] = await db.query("INSERT INTO usercoin_audit SET ?", insertAuditData);

    if (insertAuditResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Failed to complete quest", 500));
    }

    console.log("Audit log entry created for quest completion.");

    // Step 4: Update pending_coin in user_data (only if activity is not "follow")
    if (activity !== "follow") {
      const [currentCoinResult] = await db.query(
        "SELECT pending_coin FROM user_data WHERE user_id = ?",
        [userId]
      );

      const currentPendingCoin = currentCoinResult[0]?.pending_coin || 0;
      const newPendingCoin = currentPendingCoin + coinEarnValue;

      const updateUserDataQuery = `
        UPDATE user_data
        SET pending_coin = ?
        WHERE user_id = ?
      `;

      const [updateUserResult] = await db.query(updateUserDataQuery, [
        newPendingCoin,
        userId,
      ]);

      if (updateUserResult.affectedRows === 0) {
        await db.query("ROLLBACK");
        return next(new ErrorHandler("Failed to update pending_coin in user_data", 500));
      }

      console.log("Pending_coin updated successfully for user.");
    }

    // Step 5: Commit the transaction
    await db.query("COMMIT");

    let responseMessage = `Quest completed successfully. ${coinEarnValue} coins recorded in audit log.`;
    if (activity === "follow") {
      responseMessage = "Quest completed successfully. Approve by admin.";
    }

    // Final response
    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        user_id: userId,
        quest_id: fetchedQuestId,
        quest_name: fetchedQuestName,
        quest_screenshots: quest_screenshots,
        coin_earn: coinEarnValue,
        status,
        date_entered: new Date(),
      },
    });
  } catch (error) {
    console.error("Error during quest completion:", error);
    await db.query("ROLLBACK");
    return next(new ErrorHandler("Database query failed", 500));
  }
});

// exports.getUserDetailApi = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Fetch the user's ID from the request, assuming you're using a token-based system (like JWT)
//     const userId = req.user.id;

//     // Check if userId is undefined or null
//     if (!userId) {
//       return next(new ErrorHandler("User ID is missing", 400));
//     }

//     // Fetch user details from the 'users' table
//     const userDetailsQuery = await db.query(
//       "SELECT user_name, email, mobile FROM users WHERE id = ?",
//       [userId]
//     );

//     console.log("User details query result:", userDetailsQuery);

//     // If the user doesn't exist
//     if (userDetailsQuery[0].length === 0) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     const user = userDetailsQuery[0][0]; // Extract user details

//     // Fetch additional details from the 'user_data' table
//     const userDataQuery = await db.query(
//       "SELECT coins, pending_coin, upi_id FROM user_data WHERE user_id = ?",
//       [userId]
//     );

//     console.log("User data query result:", userDataQuery);

//     // If user_data doesn't exist
//     if (userDataQuery[0].length === 0) {
//       return next(new ErrorHandler("User data not found", 404));
//     }

//     const userData = userDataQuery[0][0]; // Extract user_data details

//     // Construct the response object with all the necessary details
//     const userProfile = {
//       user_name: user.user_name,
//       email: user.email,
//       mobile: user.mobile,
//       coins: userData.coins || 0, // If coins are null, set to 0
//       pending_coin: userData.pending_coin || 0, // If pending coins are null, set to 0
//       upi_id: userData.upi_id || "", // If upi_id is null, set to an empty string
//     };

//     // Send the response with the user's profile
//     res.status(200).json({
//       success: true,
//       data: userProfile,
//     });
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return next(
//       new ErrorHandler("An error occurred while fetching user profile", 500)
//     );
//   }
// });

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
    // const userDataQuery = await db.query(
    //   "SELECT coins, pending_coin, upi_id FROM user_data WHERE user_id = ?",
    //   [userId]
    // );
    const userDataQuery = await db.query(
      "SELECT coins, pending_coin, upi_id, user_photo FROM user_data WHERE user_id = ?",
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
      user_photo: userData.user_photo || null, // Include photo or null if not set
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
       INNER JOIN company_data c ON u.id = c.company_id 
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

////////////////////////////////////////

exports.getUserReferralCode = catchAsyncErrors(async (req, res, next) => {
  // Get the user_id from the logged-in user's session
  const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

  console.log("Fetching referral code for user:", user_id);

  try {
    // Query to get the referral code for the user
    const result = await db.query(
      "SELECT referral_code FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const referralCode = result[0][0]?.referral_code || null; // If no referral code is found, default to null

    console.log("Referral code fetched:", referralCode);

    // Respond with the referral code
    res.status(200).json({
      success: true,
      message: "Referral code fetched successfully.",
      data: {
        user_id,
        referral_code: referralCode,
      },
    });
  } catch (error) {
    console.error("Error fetching referral code:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

//////////////////////////////////////

exports.transferCoins = catchAsyncErrors(async (req, res, next) => {
  const { amount, recipientReferralCode } = req.body;
  const senderId = req.user.id; // Sender's user ID

  try {
    // Input validation
    if (!amount || !recipientReferralCode) {
      return next(
        new ErrorHandler("Amount and recipient referral code are required", 400)
      );
    }

    if (amount <= 0) {
      return next(new ErrorHandler("Amount must be greater than 0", 400));
    }

    // Step 1: Fetch sender's coins
    const senderCoinsQuery = await db.query(
      "SELECT coins FROM user_data WHERE user_id = ?",
      [senderId]
    );
    const senderCoins = senderCoinsQuery[0][0]?.coins || 0;

    // Check if the sender has enough coins
    if (senderCoins < amount) {
      return next(new ErrorHandler("Insufficient coins to transfer", 400));
    }

    // Step 2: Fetch recipient's user ID based on referral code
    const recipientQuery = await db.query(
      "SELECT user_id FROM user_data WHERE referral_code = ?",
      [recipientReferralCode]
    );
    const recipient = recipientQuery[0][0];

    if (!recipient) {
      return next(new ErrorHandler("Recipient not found", 404));
    }

    const recipientId = recipient.user_id;

    // Step 3: Begin a transaction
    await db.query("START TRANSACTION");

    // Step 4: Update sender's coins by deducting the amount
    const senderUpdateResult = await db.query(
      "UPDATE user_data SET coins = coins - ? WHERE user_id = ?",
      [amount, senderId]
    );
    console.log("Sender Update Result:", senderUpdateResult);

    // Step 5: Update recipient's pending coins
    const recipientUpdateResult = await db.query(
      "UPDATE user_data SET pending_coin = pending_coin + ? WHERE user_id = ?",
      [amount, recipientId]
    );
    console.log("Recipient Update Result:", recipientUpdateResult);

    // Check if the updates were successful
    if (
      senderUpdateResult[0].affectedRows === 0 ||
      recipientUpdateResult[0].affectedRows === 0
    ) {
      await db.query("ROLLBACK"); // Rollback transaction if any update fails
      return next(
        new ErrorHandler("Failed to update sender or recipient's coins", 500)
      );
    }

    // Step 6: Insert entries into usercoin_audit table with status 'completed'
    const currentTime = new Date();

    // Entry 1: Sender's transaction
    const senderAuditResult = await db.query(
      "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        senderId,
        0, // Sender's pending_coin as 0
        recipientId, // Recipient ID as transaction_id
        currentTime,
        "cr", // Sender's coin_operation "cr"
        "Amount sent", // Description
        amount, // earn_coin set to transferred amount
        "transfer",
        "completed", // Status set to 'completed'
        "Coins Transferred", // Title for sender
      ]
    );
    console.log("Sender Audit Result:", senderAuditResult);
    
    const recipientAuditResult = await db.query(
      "INSERT INTO usercoin_audit (user_id, pending_coin, transaction_id, date_entered, coin_operation, description, earn_coin, type, status, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        recipientId,
        amount, // Recipient's pending_coin as received amount
        senderId, // Sender ID as transaction_id
        currentTime,
        "dr", // Recipient's coin_operation "dr"
        "Amount received", // Description
        0, // earn_coin set to 0
        "transfer",
        "completed", // Status set to 'completed'
        "Coins Received", // Title for recipient
      ]
    );
    console.log("Recipient Audit Result:", recipientAuditResult);
    

    // Step 7: Commit the transaction
    await db.query("COMMIT");

    // Step 8: Respond with success
    res.status(200).json({
      success: true,
      message: `${amount} coins successfully transferred to user with referral code ${recipientReferralCode}.`,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await db.query("ROLLBACK");
    console.error("Error transferring coins:", error);
    return next(
      new ErrorHandler("An error occurred while transferring coins", 500)
    );
  }
});

/////////////////////////////////////

const sellTransactionSchema = Joi.object({
  company_id: Joi.string().required(), // Company ID to identify the company
  tranction_coin: Joi.number().positive().required(), // Number of coins being sold, should be positive
  transctionRate: Joi.number()
    .positive()
    .error(new Error('"tranction_rate" must be a valid positive number')),
  transction_amount: Joi.number().positive().required(), // Total transaction amount, should be positive
  // user_id: Joi.string().required(), // User ID for who is making the transaction
  // date_created: Joi.date().default(() => new Date()), // Auto-populated date (ensure it's a function)
  status: Joi.string().valid("approved", "unapproved").default("unapproved"), // Status of the transaction
});
////////////////

exports.createSellTransaction = async (req, res, next) => {
  try {
    // Log the incoming request body for debugging
    console.log("Request Body:", req.body);

    // Validate incoming request body against the schema (if you are using Joi, for example)
    await sellTransactionSchema.validateAsync(req.body, {
      abortEarly: false, // Continue validation after the first error
      allowUnknown: true, // Allow unknown fields
    });

    // Extract user ID (assume it's retrieved from session or token)
    const user_id = req.user?.id; // Optional chaining for safety
    if (!user_id) {
      return next(new ErrorHandler("User ID is required", 401)); // Handle missing user ID
    }
    // Retrieve company data from the database
    const companyData = await db.query(
      "SELECT * FROM company_data WHERE company_id = ?",
      [req.body.company_id]
    );

    console.log("Company Data:", companyData); // Log company data

    // Check if companyData is returned correctly
    if (!companyData || companyData.length === 0) {
      return next(
        new ErrorHandler("Company not found or invalid company ID", 404)
      ); // Handle invalid company
    }

    // Ensure coin_rate is a valid number
    // const transctionRate = parseFloat(companyData[0].coin_rate);
    const transctionRate = parseFloat(companyData[0][0].coin_rate);

    console.log("Transaction Rate:", transctionRate); // Log the transaction rate

    if (isNaN(transctionRate)) {
      return next(
        new ErrorHandler('"tranction_rate" must be a valid number', 400)
      ); // Handle if coin_rate is not a number
    }

    // Add this validated transaction rate to the request or next logic
    req.body.tranction_rate = transctionRate; // Ensure this field is set

    const dateCreated = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Insert the transaction into the database
    const result = await db.query(
      "INSERT INTO user_transction (user_id, company_id, tranction_coin, tranction_rate, transction_amount, data_created, status) VALUES (?, ?, ?, ?, ?, NOW(),?)",
      [
        user_id,
        req.body.company_id,
        req.body.tranction_coin,
        transctionRate, // Ensure this field is set,
        req.body.transction_amount,

        "unapproved",
      ]
    );

    console.log("Transaction Created:", result); // Log the inserted transaction data

    // Respond with success message and transaction data
    res.status(201).json({
      success: true,
      message: "Transaction created successfully!",
      // data: result, // You can send back the result of the insertion or any relevant data
    });
  } catch (error) {
    console.error("Error creating sell transaction:", error); // Log the error object

    if (error.isJoi) {
      // Handle Joi validation errors
      return next(
        new ErrorHandler(error.details.map((d) => d.message).join(", "), 400)
      );
    }

    // Handle other types of errors (e.g., database errors)
    return next(
      new ErrorHandler("Failed to create transaction: " + error.message, 500)
    );
  }
};





////////////////////////////////////
// API to get user history (coins operation, status, pending, etc.)
exports.getUserHistory = catchAsyncErrors(async (req, res, next) => {
  // Get the user_id from the logged-in user's session (JWT token)
  const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

  console.log("Fetching user history for user:", user_id);

  try {
    // Query to get the user's coin operation history with the title, excluding 'tap' type
    const result = await db.query(
      `SELECT user_id, coin_operation, status, earn_coin, pending_coin, type, company_id, date_entered, title
       FROM usercoin_audit
       WHERE user_id = ? AND type != 'tap'
       ORDER BY date_entered DESC`,
      [user_id]
    );

    // If no history is found, send a default response
    if (result[0].length === 0) {
      return res.status(404).json({
        success: true,
        message: "No history found for the user",
        data: [],
      });
    }

    console.log("User history fetched:", result[0]);

    // Respond with the user history data
    res.status(200).json({
      success: true,
      message: "User history fetched successfully.",
      data: result[0], // Sending the entire result set
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});
