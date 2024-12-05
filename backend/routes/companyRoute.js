const express = require("express");
const multer = require("multer");
const { getAllRecords } = require("../contollers/companyController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isApiAuthenticatedUser,
} = require("../middleware/auth");
const Model = require("../models/companyModel");
const module_slug = Model.module_slug;
const router = express.Router();

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, "./uploads/companies");
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
const {
  loginCompanyApi,
  addFrom,
  createRecord,
  allUsers,
  getAllCompaniesApi,
  getCompanyDetailApi,
  getSingleUser,
  editUserForm,
  updateUserRecord,
  deleteRecord,
} = require("../contollers/companyController");
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
router.route("/api-login-company").post(loginCompanyApi);

module.exports = router;
