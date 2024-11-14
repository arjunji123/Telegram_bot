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
  // addCoinRate,
  // showCompanyForm,
  // submitCompanyForm,
  getSingleUser,
  editUserForm,
  updateUserRecord,
  deleteRecord,
  approveQuest,
  disapproveQuest,
  renderTreeView,
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
  getCompanyDetailApi,
  getAllCompaniesApi,
  getUserReferralCode,
  transferCoins,
  uploadQuestScreenshotApi,
  createSellTransaction,
  getQuestHistory,
  getUserHistory,
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
  router.get('/user-tree-view/:userId', isAuthenticatedUser , renderTreeView);



router
  .route("/" + module_slug + "/add")
  .get(isAuthenticatedUser, authorizeRoles("admin"), addFrom);

router
  .route("/" + module_slug + "/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createRecord);

// Route for updating user status
router.post("/users/update-status", updateUserStatus);

router
  .route("/" + module_slug + "/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser);
router
  .route("/" + module_slug + "/edit/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), editUserForm);

router
  .route("/" + module_slug + "/update/:id")
  .post(isAuthenticatedUser, authorizeRoles("admin"), updateUserRecord);
router
  .route("/" + module_slug + "/delete/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), deleteRecord);

router.post("/approve-quest/:quest_id", approveQuest);
router.post("/disapprove-quest/:quest_id", disapproveQuest);
router.route("/sell-coin").post(isApiAuthenticatedUser, createSellTransaction);
router.get("/user-tree", isAuthenticatedUser, renderTreeView);
/*******REST API*******/

router.route("/api-register").post(registerUserApi);

router.route("/api-login").post(loginUserApi);

router.route("/api-password/forgot").post(forgotPasswordApi);

router.route("/api-password/reset/:token").put(resetPasswordApi);

router.route("/api-logout").get(logoutApi);

router.route("/api-me").get(isApiAuthenticatedUser, getUserDetailApi);
router.route("/api-company/:id").get(getCompanyDetailApi);
router.route("/api-companies").get(getAllCompaniesApi);

router.route("/referral-code").get(isApiAuthenticatedUser, getUserReferralCode);
router
  .route("/api-password/update")
  .post(isApiAuthenticatedUser, updatePasswordApi);

router.route("/api-me/update").put(isApiAuthenticatedUser, upload.single('user_photo'), updateProfileApi);

router.post(
  "/upload-screenshot/:id",
  // This should come before the upload handler
  upload.single("pay_image"),
  uploadScreenshotApi
);
router.route("/api-coin-share").post(isApiAuthenticatedUser, transferCoins);

router.post(
  "/upload-quest-screenshot/:quest_id",
  upload.array("screenshot", 5),
  uploadQuestScreenshotApi
);
router.get("/quest-history", isApiAuthenticatedUser, getQuestHistory);
router.get("/user-history", isApiAuthenticatedUser, getUserHistory);
module.exports = router;
