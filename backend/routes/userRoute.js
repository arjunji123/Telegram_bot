const express = require("express");

const multer = require("multer");
const Model = require("../models/userModel");
const module_slug = Model.module_slug;

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, "./uploads/");
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({ storage: Storage });
// Import multer for image upload
const {
  checkAdminLoginOrDashboard,
  showLogin,
  dashboard,
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetail,
  updatePassword,
  updateProfile,
  allUsers,
  addFrom,
  createRecord,
  updateUserStatus,
  addCoinRate,
} = require("../contollers/userController");
const {
  registerUserApi,
  loginUserApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  getUserDetailApi,
  updatePasswordApi,
  updateProfileApi,
  uploadScreenshotApi,
} = require("../contollers/userApiController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const router = express.Router();
router.route("/").get(isAuthenticatedUser, checkAdminLoginOrDashboard);
router.route("/dashboard").get(isAuthenticatedUser, dashboard);
router.route("/register").post(registerUser);

router.route("/login").get(showLogin);
router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/me").get(isAuthenticatedUser, getUserDetail);

router.route("/password/update").post(isAuthenticatedUser, updatePassword);

router.route("/me/update").post(isAuthenticatedUser, updateProfile);

router.route("/users").get(isAuthenticatedUser, allUsers);

router
  .route("/" + module_slug + "/add")
  .get(isAuthenticatedUser, authorizeRoles("admin"), addFrom);

router
  .route("/" + module_slug + "/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createRecord);

// Route for updating user status
router.post("/users/update-status", updateUserStatus);
router
  .route("/coin-rate/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), addCoinRate);

/*******REST API*******/

router.route("/api-register").post(registerUserApi);

router.route("/api-login").post(loginUserApi);

router.route("/api-password/forgot").post(forgotPasswordApi);

router.route("/api-password/reset/:token").put(resetPasswordApi);

router.route("/api-logout").get(logoutApi);

router.route("/api-me").get(isApiAuthenticatedUser, getUserDetailApi);

router
  .route("/api-password/update")
  .post(isApiAuthenticatedUser, updatePasswordApi);

router.route("/api-me/update").put(isApiAuthenticatedUser, updateProfileApi);

router.post(
  "/upload-screenshot/:id",
  // This should come before the upload handler
  upload.single("pay_image"),
  uploadScreenshotApi
);

module.exports = router;
