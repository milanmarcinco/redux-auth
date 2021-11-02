const express = require("express");
const router = express.Router();

const {
  register,
  logIn,
  renewToken,
  changePassword,
  updateProfile,
  logOut,
  logOutAll,
  deleteProfile,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", logIn);
router.post("/renew-token", renewToken);
router.post("/change-password", changePassword);
router.post("/update-profile", updateProfile);
router.post("/logout", logOut);
router.post("/logout-all", logOutAll);
router.post("/delete-profile", deleteProfile);

module.exports = router;
