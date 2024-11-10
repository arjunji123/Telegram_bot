const express = require("express");
const multer = require("multer");
const { getAllRecords } = require("../contollers/serviceController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const Model = require("../models/serviceModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, "./uploads/services");
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
const {
  // checkAdminLoginOrDashboard,
  // showLogin,
  // dashboard,
  // registerUser,
  // loginUser,
  // logout,
  // forgotPassword,
  // resetPassword,
  // getUserDetail,
  // updatePassword,
  // updateProfile,
  // allUsers,
  addFrom,
  createRecord,
  allUsers,
  getAllCompaniesApi,
  getCompanyDetailApi,
  // updateUserStatus,
  // addCoinRate,
  // showCompanyForm,
  // submitCompanyForm,
  getSingleUser,
  editUserForm,
  updateUserRecord,
  deleteRecord,
} = require("../contollers/serviceController");
var upload = multer({ storage: Storage });
// router.post("/users/update-status", updateUserStatus);
router
  .route("/" + module_slug + "/add")
  .get(isAuthenticatedUser, authorizeRoles("admin"), addFrom);

router
  .route("/" + module_slug + "/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createRecord);
// router
//   .route("/" + module_slug + "/company-form/:id")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), showCompanyForm)
//   .post(isAuthenticatedUser, authorizeRoles("admin"), submitCompanyForm);
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
router.route("/" + module_slug + "").get(isAuthenticatedUser, allUsers);
//////////////////////////////
router.route("/api-company/:id").get(getCompanyDetailApi);
router.route("/api-companies").get(getAllCompaniesApi);

module.exports = router;
