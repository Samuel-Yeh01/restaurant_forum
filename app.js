const express = require("express");
const handlebars = require("express-handlebars"); // 引入 handlebars
const db = require("./models"); // 引入資料庫
const app = express();
const port = 3000;
const bodyParser = require("body-parser"); // add this
const flash = require("connect-flash");
const session = require("express-session");

// setup handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" })); // Handlebars 註冊樣板引擎(for 第2行)
app.set("view engine", "handlebars"); // 設定使用 Handlebars 做為樣板引擎

// setup bodyParser
app.use(bodyParser.urlencoded({ extended: true })); // for 第6行

// setup session and flash
app.use(session({ secret: "secret", resave: false, saveUninitialized: false })); // for 第7&8行
app.use(flash()); // for 第7&8行

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

// listen to port 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require("./routes")(app);
