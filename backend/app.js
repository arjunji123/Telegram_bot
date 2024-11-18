const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const errorMiddleware = require("./middleware/error");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
 app.use(
   cors({
     origin: "https://unitrade-bot.onrender.com",
     credentials: true,
   })
 );
 app.use(
   cors({
     origin: "https://telegram-bot-git-frontuni-arjuns-projects-e072bddd.vercel.app",
     credentials: true,
   })
 );
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(bodyParser.urlencoded({ extended: false })); //For body parser
app.use(bodyParser.json());
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    secret: "woot",
    resave: false,
    httpOnly: true,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use((req, res, next) => {
  const userType = localStorage.getItem("user_type_n");
  res.locals.user = req.session.user;
  res.locals.userty = userType;
  next();
});

const blogs = require("./routes/blogRoute");
const quests = require("./routes/pageRoute");
// const coins = require("./routes/coinRoute");
const companies = require("./routes/companyRoute");
const user = require("./routes/userRoute");
const settings = require("./routes/settingRoute");
const faqs = require("./routes/faqRoute");
const testimonials = require("./routes/testimonialRoute");
// const withdrwals = require("./routes/withdrwalRoute");

app.use("/admin", user);
app.use("/admin", blogs);
app.use("/admin", companies);
app.use("/admin", quests);
// app.use("/admin", coins);
app.use("/admin", settings);
app.use("/admin", faqs);
app.use("/admin", testimonials);

// app.use("/admin", withdrwals);

app.use("/api/v1", user);
app.use("/api/v1", blogs);
app.use("/api/v1", companies);
app.use("/api/v1", quests);
app.use("/api/v1", settings);
app.use("/api/v1", faqs);
app.use("/api/v1", testimonials);
// app.use("/api/v1", withdrwals);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorMiddleware);
module.exports = app;
