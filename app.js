const express = require("express");
const handlebars = require("express-handlebars");
const db = require("./models");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const passport = require("./config/passport");

// 設定 view engine 使用 handlebars
app.engine(
  "handlebars",
  handlebars({
    defaultLayout: "main",
    helpers: require("./config/handlebars-helpers")
  })
);
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(methodOverride("_method"));
// app.use('/upload', express.static(__dirname + '/upload'))

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  res.locals.user = req.user;
  next();
});

app.listen(port, () => {
  db.sequelize.sync(); // 跟資料庫同步
  console.log(`Example app listening on port ${port}`);
});

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require("./routes")(app);
// const express = require("express");
// const handlebars = require("express-handlebars"); // 引入 handlebars
// const db = require("./models"); // 引入資料庫
// const app = express();
// const port = process.env.PORT || 3000; //根據環境變數監聽 Port,如果有環境變數，就用環境變數提供的值，否則的話就用預設值 3000。
// const bodyParser = require("body-parser"); // add this
// const flash = require("connect-flash");
// const session = require("express-session");
// const passport = require("./config/passport"); //導入 passport
// const methodOverride = require("method-override"); //導入 method-override

// require("dotenv").config(); //Node.js 使用 .env 加上環境變數--隱藏敏感資訊

// // setup handlebars
// app.engine(
//   "handlebars",
//   handlebars({
//     defaultLayout: "main",
//     // 掛載 Helper 設定(for 新增　handlebars 部分功能)
//     helpers: require("./config/handlebars-helpers")
//   })
// ); // Handlebars 註冊樣板引擎(for 第2行)
// app.set("view engine", "handlebars"); // 設定使用 Handlebars 做為樣板引擎

// // setup bodyParser
// app.use(bodyParser.urlencoded({ extended: true })); // for 第6行
// app.use(bodyParser.json());

// // setup session and flash
// app.use(session({ secret: "secret", resave: false, saveUninitialized: false })); // for 第7&8行
// app.use(flash()); // for 第7&8行

// // setup passport
// app.use(passport.initialize());
// app.use(passport.session());

// app.use((req, res, next) => {
//   // 把 req.flash 放到 res.locals 裡面
//   res.locals.success_messages = req.flash("success_messages");
//   res.locals.error_messages = req.flash("error_messages");
//   // 在 res.locals 裡加入 user 變數
//   res.locals.user = req.user;
//   next();
// });

// // 設定 method-override(for line 10)
// app.use(methodOverride("_method"));

// // 設定靜態檔案路徑 /upload
// app.use("/upload", express.static(__dirname + "/upload"));

// // listen to port 3000
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}!`);
// });

// // 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
// require("./routes")(app);
