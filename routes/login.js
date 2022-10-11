const express = require("express");
const app = express();
const router = express.Router();
app.use(express.json());
const {
  loginUser,
  verifyOTP,
  home,
  signUp,
  getMyProfile,updateMyProfile, deleteMyProfile
} = require("../controllers/login");

const {auth} =require("../middleware/auth")

router.get("/home", home);
router.post("/loginUser", loginUser);
router.post("/verifyOTP", verifyOTP);
router.post("/signUp",auth, signUp);
router.get("/getMyProfile",auth, getMyProfile);
router.put("/updateMyProfile",auth,updateMyProfile)
router.delete("/deleteMyProfile",auth,deleteMyProfile)
module.exports = router;

