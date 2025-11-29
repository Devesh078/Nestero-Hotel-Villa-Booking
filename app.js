// ENVIRONMENT SETUP
if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

// ROUTE IMPORTS
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

// DATABASE CONNECTION
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");

    //Start Express server *after successful DB connection*
    startServer();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

main();

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error (after initial connect):", err);
});

// EXPRESS APP SETUP
function startServer() {
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.engine("ejs", ejsMate);
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride("_method"));
  app.use(express.static(path.join(__dirname, "/public")));

  // SESSION CONFIGURATION
  const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
  });

  store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
  });

  const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  };

  app.use(session(sessionOptions));
  app.use(flash());

  // PASSPORT CONFIGURATION
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  // FLASH + CURRENT USER MIDDLEWARE
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
  });

  // Optional debug log
  app.use((req, res, next) => {
    console.log(" currUser available to EJS:", res.locals.currUser);
    next();
  });

  // ROUTES
  app.use("/listings", listingRouter);
  app.use("/listings/:id/reviews", reviewRouter);
  app.use("/bookings", bookingRouter);
  app.use("/", userRouter);

  // ERROR HANDLING
  app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
  });

  app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error.ejs", { message });
  });

  // SERVER START
  app.listen(8001, () => {
    console.log("Server running on port 8001");
  });
}
