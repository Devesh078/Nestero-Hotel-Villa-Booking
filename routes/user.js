const express = require("express");
const router = express.Router();
const User = require("../Models/user.js");
const WrapAsync = require("../utils/WrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//Signup
router
.route("/signup")
.get(userController.renderSignup)
.post(WrapAsync(userController.signup));



router
.route("/login")
.get(userController.renderLogin)
.post(
    saveRedirectUrl,
    passport.authenticate("local", 
    { failuerRedirect:"/login",
    failuerFlash: true,
    }),
 userController.Login
);


router.get("/logout",userController.Logout);


module.exports = router;