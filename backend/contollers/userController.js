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
const UserDataModel = require("../models/treeModel");
// const { generateReferralCode } = require("../utils/helpers");
const pool = require("../config/mysql_database"); // Assuming you're using MySQL pool
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const { v4: uuidv4 } = require("uuid");
const mysqlPool = require("../config/mysql_database"); // Adjust the path if necessary

// const pool = require('../config/db');  // Assuming you're using MySQL pool
const {
  findAvailableParentByReferral,
  findNextAvailableParent,
  // updatePendingCoins,
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

const COIN_PARENT_ADDITION = 10;
const COIN_ANCESTOR_ADDITION = 5;
const COIN_REFERRAL_BONUS = 100;
const FIXED_COINS = 100;
const REFERRAL_BONUS_THRESHOLD = 2;
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
  const token = req.cookies.token;
  //console.log("bbbttttttttbbbb", token);
  if (token) {
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
  // Check if user_type is either "admin" or "company"
  if (user.user_type !== "admin" && user.user_type !== "company") {
    req.flash("msg_response", {
      status: 403,
      message: "You do not have permission to access this panel",
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
  req.session.user = user;
  localStorage.setItem("user_type_n", user.user_type);
  const token = User.generateToken(user.id); // Adjust as per your user object structure
  // console.log("aaaa", token);

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
  // Check if req.session exists before trying to destroy it
  if (res.session) {
    res.session.destroy((err) => {
      if (err) {
        return next(err); // Handle the error if necessary
      }
      res.clearCookie("connect.sid");
      res.clearCookie("token"); // Clear the session ID cookie
      localStorage.removeItem("user_type_n");

      res.flash("msg_response", {
        status: 200,
        message: "Logout Successfully",
      });
      res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
    });
  } else {
    // Handle the case where req.session is undefined
    res.clearCookie("connect.sid");
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("user_type_n"); // Clear specific data
      // or
      localStorage.clear(); // Clear all data
      console.log("User data removed from localStorage");
    }
    res.clearCookie("token");
    req.flash("msg_response", {
      status: 200,
      message: "Session already cleared or not found",
    });
    res.redirect(`/${process.env.ADMIN_PREFIX}/login`);
  }
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
  res.render("users/dashboard", {
    layout: "layouts/main",
    title: "Dashboard", // Set a title for the page if needed
    user: req.user, // Pass user data if required
  });
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
        u.user_type,
        u.status  
     FROM users u
     INNER JOIN user_data ud ON u.id = ud.user_id 
     WHERE u.user_type IN (?)`,
    ["user"]
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

////////////////////////
exports.createRecord = catchAsyncErrors(async (req, res, next) => {
  // Validate request body with Joi schema
  try {
    await Model.insertSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details.map((d) => d.message) });
  }

  const dateCreated = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (req.file) req.body.image = req.file.filename;

  const insertData = {
    user_name: req.body.user_name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password, 10),
    status: req.body.status,
    date_created: dateCreated,
    user_type: "user",
    date_modified: dateCreated,
  };

  // Integrated UserDataModel
  const UserDataModel = {
    async create(userData) {
      const query = `INSERT INTO user_data (user_id, upi_id, referral_by, referral_code, parent_id, leftchild_id, rightchild_id)
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
    if (referralCode) {
      console.log("Searching for parent using referral code:", referralCode);
      const userQuery = `SELECT user_id as parent_id FROM user_data WHERE referral_code = ?`;
      const [userRows] = await db.query(userQuery, [referralCode]);

      let currentUser = userRows[0];
      if (currentUser) {
        const userId = currentUser.parent_id;
        // Attempt to find an available spot in the referred user's subtree
        const result = await findAvailableSpotInSubtree(userId);
        if (result) {
          return result;
        }
        console.log("Referred user's subtree is fully occupied.");
      } else {
        console.log("No user found for the given referral code.");
      }
    }

    // If referral is not provided, or referred user's subtree is fully occupied, find the next available parent
    console.log("Finding the next available parent");
    const rootQuery = `SELECT user_id FROM user_data WHERE parent_id IS NULL`;
    const [rootRows] = await db.query(rootQuery);
    const root = rootRows[0];

    if (!root) return null;

    // Use a queue to perform level-order traversal
    const queue = [root.user_id];
    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const parentQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
      const [parentRows] = await db.query(parentQuery, [currentParentId]);

      if (!parentRows.length) continue;

      const parent = parentRows[0];

      // Check if the left child position is available
      if (parent.leftchild_id === null) {
        return {
          parentId: currentParentId,
          position: "leftchild_id",
        };
      }

      // Check if the right child position is available
      if (parent.rightchild_id === null) {
        return {
          parentId: currentParentId,
          position: "rightchild_id",
        };
      }

      // If both left and right children exist, add them to the queue for further level-order checking
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

      // First, check if the left child is available
      if (user.leftchild_id === null) {
        return {
          parentId: currentUserId,
          position: "leftchild_id",
        };
      }

      // Then, check if the right child is available
      if (user.rightchild_id === null) {
        return {
          parentId: currentUserId,
          position: "rightchild_id",
        };
      }

      // If both left and right children are filled, add them to the queue for further checking
      queue.push(user.leftchild_id);
      queue.push(user.rightchild_id);
    }

    // If no available spot is found
    return null;
  }

  // Main function to handle parent selection logic
  const referralBy = req.body.referral_by;
  let parentId = null;
  let position = null;

  if (referralBy) {
    const parentInfo = await findAvailableParent(referralBy);
    if (parentInfo) {
      parentId = parentInfo.parentId;
      position = parentInfo.position;
      console.log("Referral parent found:", parentId);
    } else {
      console.log(
        "Referral parent not available, finding next available parent."
      );
      const nextParentInfo = await findAvailableParent();
      if (nextParentInfo) {
        parentId = nextParentInfo.parentId;
        position = nextParentInfo.position;
      }
    }
  } else {
    console.log("No referral provided, finding next available parent.");
    const nextParentInfo = await findAvailableParent();
    if (nextParentInfo) {
      parentId = nextParentInfo.parentId;
      position = nextParentInfo.position;
    }
  }

  // Log parentId and position for debugging
  console.log("Parent ID found:", parentId);
  console.log("Position determined:", position);

  const generateReferralCode = (userId) => {
    const referralCode = `UNITRADE${userId}`; // Prefix "UNITRADE" with the user's user_id
    return referralCode;
  };
  try {
    const user = await QueryModel.saveData("users", insertData); // Ensure the table name is correct
    const userId = user.id;

    const insertData2 = {
      user_id: user.id,
      upi_id: req.body.upi,
      referral_by: referralBy,
      referral_code: req.body.referral_code || generateReferralCode(userId),
      parent_id: parentId,
      leftchild_id: null,
      rightchild_id: null,
    };

    // Log insertData2 for debugging
    console.log("Inserting user data:", insertData2);

    const newUserData = await UserDataModel.create(insertData2);
    if (!newUserData) {
      return res
        .status(500)
        .json({ success: false, error: "Error inserting user data" });
    }

    // Update parent record with new child ID
    if (parentId && position) {
      const updateData = { [position]: user.id };
      await UserDataModel.updateData("user_data", updateData, {
        user_id: parentId,
      });
    }

    // Check if request is for JSON response or redirect
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      // Send JSON response for API requests
      return res
        .status(201)
        .json({ success: true, message: "User created successfully." });
    } else {
      // Redirect for form submissions
      const redirectUrl = req.body.redirect || "/admin/users"; // Default redirect URL
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error during user creation:", error); // Log the error for debugging

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      // Send JSON error response for API requests
      return res.status(500).json({ success: false, error: error.message });
    } else {
      // Redirect to error page for form submissions
      req.flash("error", "Internal Server Error"); // Optional flash message
      return res.redirect("/admin/error"); // Redirect to error page
    }
  }
});
////////////////////////////////////////////
///////////////////////////////////////////
exports.updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const userId = req.body.userId;
  const newStatus = req.body.status;
  const performedByUserId = req.body.performedByUserId;
  const redirectUrl = req.body.redirect || "/admin/users";

  try {
    // Update user status in the database
    await QueryModel.updateData("users", { status: newStatus }, { id: userId });
    console.info(`User status updated for User ID: ${userId}`);

    // Distribute coins based on activation
    await distributeCoins(userId);

    // Redirect after successful update
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function distributeCoins(userId, performedByUserId) {
  const COIN_REFERRAL_BONUS = 100; 
  const COIN_PARENT_ADDITION = 10;
  const COIN_ANCESTOR_ADDITION = 5;
  const FIXED_COINS = 100;

  try {
    const userCoinsData = await QueryModel.getData(
      "user_data",
      { user_id: userId },
      ["pending_coin", "referral_by"]
    );
    const currentPendingCoin = userCoinsData[0]?.pending_coin || 0;

    if (userCoinsData[0]?.referral_by && currentPendingCoin < COIN_REFERRAL_BONUS) {
      console.info(`Awarding referral bonus to User ID: ${userId}`);
      await updatePendingCoins(userId, COIN_REFERRAL_BONUS, "cr", "Referral bonus added", "self", null, performedByUserId);
    } else {
      console.info(`Skipping referral bonus for User ID: ${userId}.`);
    }

    let remainingCoins = FIXED_COINS;
    let currentUserId = userId;
    let isFirstParent = true;

    while (remainingCoins > 0) {
      const parentData = await QueryModel.getData(
        "user_data",
        { user_id: currentUserId },
        ["parent_id"]
      );
      const parentId = parentData[0]?.parent_id;

      if (!parentId) break;

      const coinsToAdd = isFirstParent ? COIN_PARENT_ADDITION : COIN_ANCESTOR_ADDITION;
      const actualCoinsToAdd = remainingCoins >= coinsToAdd ? coinsToAdd : remainingCoins;

      await updatePendingCoins(parentId, actualCoinsToAdd, "cr", "Ancestor bonus added", "ancestor", null, performedByUserId);
      remainingCoins -= actualCoinsToAdd;
      currentUserId = parentId;
      isFirstParent = false;
    }

    if (remainingCoins > 0) {
      console.info(`Coin distribution incomplete. ${remainingCoins} coins left undistributed.`);
    } else {
      console.info(`Coin distribution complete.`);
    }
  } catch (error) {
    console.error("Error distributing coins:", error);
    throw error;
  }
}

async function updatePendingCoins(
  userId,
  coins,
  operation = "cr",
  description = "",
  type = "self",
  companyId = null
) {
  try {
    // Determine the title based on the coin amount and type
    let title = "";
    if (coins === 100 && type === "self") {
      title = "Joining Coin";
    } else if ((coins === 5 || coins === 10) && type === "referral") {
      title = "Referral Transaction";
    } else {
      title = "Referral Transaction";
    }

    // Retrieve current pending_coin value
    const userCoinsData = await QueryModel.getData(
      "user_data",
      { user_id: userId },
      ["pending_coin"]
    );
    const currentPendingCoin = userCoinsData[0]?.pending_coin || 0;

    // Calculate the updated total
    const updatedPendingCoin = currentPendingCoin + coins;

    // Update user_data with the new total
    await QueryModel.updateData(
      "user_data",
      { pending_coin: updatedPendingCoin },
      { user_id: userId }
    );

    // Record the transaction in usercoin_audit
    await QueryModel.saveData("usercoin_audit", {
      user_id: userId,
      pending_coin: coins,
      title: title, // Add the title field here
      quest_id: null,
      coin_operation: operation,
      description: description,
      status: "completed",
      earn_coin: operation === "cr" ? 1 : 0,
      type: type,
      company_id: companyId,
      date_entered: new Date(),
    });

    console.info(`Updated pending coins for User ID: ${userId}. Total Pending Coins: ${updatedPendingCoin}`);
  } catch (error) {
    console.error("Error in updatePendingCoins:", error.message);
  }
}

function logCoinsReceived(coinsReceived) {
  for (const [userId, coins] of Object.entries(coinsReceived)) {
    console.info(`User ID: ${userId} received ${coins} coins.`);
  }
}

exports.findById = async (table_name, id) => {
  try {
    console.info(`Attempting to find record in ${table_name} with ID: ${id}`);
    const record = await db.query(`SELECT * FROM ${table_name} WHERE id = ?`, [
      id,
    ]);
    console.info(`Query Result:`, record); // Log the full result

    if (!record[0] || !record[0][0])
      throw new ErrorHandler("Record not found", 400);

    return record[0][0];
  } catch (error) {
    console.error(`Error in findById: ${error.message}`);
    throw new ErrorHandler(`${error.message}`, 400);
  }
};

//////////////////////////////////////////////////

// Joi schema for validation
// const coinRateSchema = Joi.object({
//   company_id: Joi.number().integer().required(),
//   coin_rate: Joi.string().required(),
//   description: Joi.string().optional(),
// });

// exports.addCoinRate = catchAsyncErrors(async (req, res, next) => {
//   // Step 1: Validate the request body
//   try {
//     await coinRateSchema.validateAsync(req.body, {
//       abortEarly: false,
//       allowUnknown: true,
//     });
//   } catch (error) {
//     return next(
//       new ErrorHandler(
//         error.details.map((d) => d.message), // Map validation errors
//         400
//       )
//     );
//   }

//   // Step 2: Extract company_id from request body
//   const companyId = req.body.company_id;

//   // Step 3: Check if the company exists in the users table
//   const companyExists = await QueryModel.findOne("users", { id: companyId });

//   if (!companyExists) {
//     return next(new ErrorHandler("Company not found.", 404));
//   }

//   // Step 4: Prepare data for insertion into the company_data table
//   const insertData = {
//     company_id: companyId,
//     coin_rate: req.body.coin_rate,
//     description: req.body.description || "", // Optional description
//   };

//   // Step 5: Insert the coin rate data into the company_data table
//   try {
//     const coinRate = await QueryModel.saveData(
//       "company_data",
//       insertData,
//       next
//     );

//     // Success response
//     req.flash("msg_response", {
//       status: 200,
//       message: "Coin rate added successfully for the company.",
//     });

//     // Redirect to the users page after successful insert
//     res.redirect(`/admin/users`);
//   } catch (err) {
//     console.error("Error saving coin rate data:", err);
//     return next(new ErrorHandler("Error while saving coin rate data.", 500));
//   }
// });

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
    // Use a parameterized query to avoid SQL injection
    const query = `
      SELECT
        u.*,
        ud.parent_id,
        ud.leftchild_id,
       ud.referral_code,
        ud.referral_by,
        ud.coins,
        ud.pending_coin,
        ud.upi_id
      FROM
        users u
      LEFT JOIN
        user_data ud ON u.id = ud.user_id
      WHERE
        u.id = ${userId}
    `;
    console.log("Executing query:", query);
    const result = await pool.query(query, [userId]);
    console.log("Query result:", result);

    // Check if the result has the correct structure
    if (
      !result ||
      !result[0] ||
      !Array.isArray(result[0]) ||
      result[0].length === 0
    ) {
      console.log(`User with ID ${userId} not found in database.`);
      return res.status(404).send("User not found");
    }
    // Get the user data from the result
    const user = result[0][0]; // The user object
    console.log("User data retrieved:", user);
    // Check if user object is defined
    if (!user) {
      return res.status(404).send("User not found");
    }
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

// exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
//   // Find the user by ID using the Mongoose model
//   const user = await QueryModel.findById(table_name, req.params.id, next);

//   if (!user) {
//     return res.status(404).send("User not found");
//   }

//   // Render the user details page
//   res.render(module_slug + "/detail", {
//     layout: module_layout, // Use the correct layout
//     title: module_single_title, // Use the correct title
//     user,
//   });
// });

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

  // Fetch the user-specific data from the 'user_data' table
  const userDataQuery = `
    SELECT
      ud.referral_code,
      ud.upi_id,
      ud.parent_id
    FROM
      user_data ud
    WHERE
      ud.user_id = ?
  `;

  // Execute the query to fetch the user-specific data
  const userDataResult = await mysqlPool.query(userDataQuery, [userId]);
  const userData = userDataResult[0][0]; // Get the user data

  if (!userData) {
    // Log if the user data is not found but don't throw an error if not mandatory
    console.log("User data not found");
  } else {
    // Log the user data for debugging
    console.log("User Data from user_data Table:", userData);
  }

  // Render the 'edit' view and pass the necessary data
  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text, // Title for the page
    userId,
    user, // Pass the user details to the view
    userData, // Pass the user-specific data to the view
    module_slug, // Pass the module_slug to the view
  });
});

////////////////////////////

exports.updateUserRecord = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get user ID from request parameters

  // Extract data from the request body
  const { user_name, email, status, referral_code, upi_id, parent_id } =
    req.body;

  // Log incoming data for debugging
  console.log("Incoming Data:", req.body);

  // Check if any required fields are missing or have null values

  // Update data in 'users' table
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
    // Check if user exists before updating
    const userUpdateResult = await mysqlPool.query(updateUserQuery, [
      user_name,
      email,
      status,
      userId,
    ]);

    if (userUpdateResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Update data in 'user_data' table
    const updateUserDataQuery = `
      UPDATE user_data
      SET 
        referral_code = ?, 
        upi_id = ?, 
        parent_id = ?
      WHERE 
        user_id = ?
    `;

    const userDataUpdateResult = await mysqlPool.query(updateUserDataQuery, [
      referral_code,
      upi_id,
      parent_id,
      userId,
    ]);

    if (userDataUpdateResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User data not found", 404));
    }

    // Flash success message
    req.flash("msg_response", {
      status: 200,
      message: "Successfully updated user details and user data.",
    });

    // Redirect to the users listing page (index page)
    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (error) {
    console.error("Error while updating user:", error);
    return next(
      new ErrorHandler("An error occurred while updating the user", 500)
    );
  }
});

///////////////////////////////////////////////

exports.deleteRecord = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Get the user ID from the request parameters

  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  const deleteUserQuery = `
    DELETE FROM users WHERE id = ?
  `;

  const deleteUserDataQuery = `
    DELETE FROM user_data WHERE user_id = ?
  `;

  try {
    // Delete from the users table
    const deleteUserResult = await mysqlPool.query(deleteUserQuery, [userId]);

    console.log("Delete user result:", deleteUserResult); // Log for debugging

    if (deleteUserResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Delete from the user_data table using the same userId as user_id
    const deleteUserDataResult = await mysqlPool.query(deleteUserDataQuery, [
      userId,
    ]);

    console.log("Delete user data result:", deleteUserDataResult); // Log for debugging

    if (deleteUserDataResult[0].affectedRows === 0) {
      return next(new ErrorHandler("User data not found", 404));
    }

    req.flash("msg_response", {
      status: 200,
      message: "Successfully deleted " + module_single_title,
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (error) {
    console.error("Error in deleting user and user data:", error); // Log the full error for debugging
    return next(new ErrorHandler("An error occurred while deleting data", 500));
  }
});

exports.approveQuest = catchAsyncErrors(async (req, res, next) => {
  const { quest_id } = req.params;

  try {
    // Fetch the coin_earn value from the quest table
    const [questData] = await db.query(
      `SELECT coin_earn FROM quest WHERE id = ?`,
      [quest_id]
    );

    // Check if the quest exists
    if (questData.length === 0) {
      return next(new ErrorHandler("Quest not found", 404));
    }

    const coinEarned = questData[0].coin_earn;

    // Check if the quest has a positive coin_earn value
    if (coinEarned <= 0) {
      return next(
        new ErrorHandler("Coin earn value must be greater than zero.", 400)
      );
    }

    // Update the pending_coin and status in usercoin_audit
    const result = await db.query(
      `UPDATE usercoin_audit 
       SET pending_coin = pending_coin + ?, 
           quest_screenshot = NULL,
           status = 'completed'
       WHERE quest_id = ? AND quest_screenshot IS NOT NULL`,
      [coinEarned, quest_id]
    );

    // Check if the update affected any rows
    if (result.affectedRows === 0) {
      return next(
        new ErrorHandler(
          "No matching quest found or screenshot already processed",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      message: "Quest approved, pending coins updated, and status set to completed.",
    });
  } catch (error) {
    console.error("Database update error:", error); // Log specific error for troubleshooting
    return next(
      new ErrorHandler("Approval process failed: " + error.message, 500)
    );
  }
});


exports.disapproveQuest = catchAsyncErrors(async (req, res, next) => {
  const { quest_id } = req.params;

  try {
    // Remove the quest screenshot only from the usercoin_audit table
    await db.query(
      `UPDATE usercoin_audit 
       SET quest_screenshot = NULL 
       WHERE quest_id = ? AND quest_screenshot IS NOT NULL`,
      [quest_id]
    );

    res.status(200).json({
      success: true,
      message: "Quest disapproved, screenshot removed.",
    });
  } catch (error) {
    console.error("Database update error:", error);
    return next(new ErrorHandler("Disapproval process failed", 500));
  }
});

exports.renderTreeView = async (req, res) => {
  try {
    const query = `
      SELECT 
        user_data.id AS user_data_id, 
        user_data.user_id, 
        users.user_name, 
        user_data.parent_id, 
        user_data.leftchild_id, 
        user_data.rightchild_id
      FROM user_data
      JOIN users ON user_data.user_id = users.id
    `;

    const [rows] = await mysqlPool.query(query);
    const userTree = buildUserTree(rows);

    res.render("tree_view", { userTree: JSON.stringify(userTree) });
  } catch (error) {
    console.error("Error rendering users view:", error);
    res.status(500).send("Error rendering users view");
  }
};

function buildUserTree(users) {
  const userMap = {};
  users.forEach((user) => {
    userMap[user.user_id] = { ...user, children: [] };
  });

  const roots = [];
  users.forEach((user) => {
    if (user.parent_id === null) {
      roots.push(userMap[user.user_id]);
    } else {
      const parent = userMap[user.parent_id];
      if (parent) {
        parent.children.push(userMap[user.user_id]);
      }
    }
  });

  return roots;
}
