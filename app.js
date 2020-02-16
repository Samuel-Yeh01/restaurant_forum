const express = require("express");
const handlebars = require("express-handlebars"); // 引入 handlebars
const db = require("./models"); // 引入資料庫
const app = express();
const port = 3000;
const bodyParser = require("body-parser"); // add this
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("./config/passport"); //導入 passport
const methodOverride = require("method-override"); //導入 method-override

// setup handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" })); // Handlebars 註冊樣板引擎(for 第2行)
app.set("view engine", "handlebars"); // 設定使用 Handlebars 做為樣板引擎

// setup bodyParser
app.use(bodyParser.urlencoded({ extended: true })); // for 第6行

// setup session and flash
app.use(session({ secret: "secret", resave: false, saveUninitialized: false })); // for 第7&8行
app.use(flash()); // for 第7&8行

// setup passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // 把 req.flash 放到 res.locals 裡面
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  // 在 res.locals 裡加入 user 變數
  res.locals.user = req.user;
  next();
});

// 設定 method-override(for line 10)
app.use(methodOverride("_method"));

// listen to port 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require("./routes")(app, passport);
