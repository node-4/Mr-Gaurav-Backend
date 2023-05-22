const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  signInWithGoogle,
  accountVerificationOTP,
  passwordResetOtp,
  sendOtp,
  loginVendor,
  registerVonder,
  AddUser,
  ChagePaymentStatus, 
  GetALlSubdomain
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { otpLimiter } = require("../middleware/rateLimiter");
const upload = require("../middleware/fileUpload");

const router = express.Router();

// router.route("/sendOTP").post(otpLimiter, sendOTP);

router.route("/verifyRegistration").post(accountVerificationOTP);

router.route("/googleAuth").post(signInWithGoogle);

router.route("/register").post(registerUser);
// router.route('/sendotp').post(sendOtp);
router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/verify-otp").post(passwordResetOtp)

router.route("/password/reset/").post(resetPassword);

router.route("/logout").get(logout);

router.route('/subadmin').get(GetALlSubdomain)

router.route("/me/:id").get(getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update/").put(isAuthenticatedUser,  updateProfile);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, getAllUser);

router.route('/vender/login').post(loginVendor)
router.route('/vendor/register').post(registerVonder)

router.route('/user/paymentstatus/:id').post(ChagePaymentStatus)

router.route("/admin/addUser").post(  AddUser);
router
  .route("/admin/user/:id")
  .get(  getSingleUser)
  .put(  updateUserRole)
  .delete(  deleteUser)

module.exports = router;


