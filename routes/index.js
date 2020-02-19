const restController = require("../controllers/restController.js");
const adminController = require("../controllers/adminController.js"); // 加入這行
const userController = require("../controllers/userController.js"); //引入 userController
const categoryController = require("../controllers/categoryController.js"); //引入瀏覽分類
// LINE 4&5  為引入 multer
const multer = require("multer");
const upload = multer({ dest: "temp/" });

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/signin");
  };
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) {
        return next();
      }
      return res.redirect("/");
    }
    res.redirect("/signin");
  };
  //新增：接收 passport
  // 建立網站前台入口
  //如果使用者訪問首頁，就導向 /restaurants 的頁面
  app.get("/", authenticated, (req, res) => res.redirect("/restaurants"));

  //在 /restaurants 底下則交給 restController.getRestaurants 來處理
  app.get("/restaurants", restController.getRestaurants);

  // 建立網站後台入口
  // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get("/admin", authenticatedAdmin, (req, res) =>
    res.redirect("/admin/restaurants")
  );

  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  app.get(
    "/admin/restaurants",
    authenticatedAdmin,
    adminController.getRestaurants
  );

  // 建立使用者註冊流程
  app.get("/signup", userController.signUpPage);
  app.post("/signup", userController.signUp);

  app.get("/signin", userController.signInPage);
  app.post(
    "/signin",
    passport.authenticate("local", {
      failureRedirect: "/signin",
      failureFlash: true
    }),
    userController.signIn
    // 注意在 POST /signin 的路由裡，我們呼叫了 passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true })，讓 Passport 直接做身份驗證，因為當 userController.signIn 收到 request 時，就一定是登入後的使用者了，這是為什麼剛才在 userController.signIn 沒看到驗證的邏輯。
  );
  app.get("/logout", userController.logout);

  // CRUD--Create
  app.get(
    "/admin/restaurants/create",
    authenticatedAdmin,
    adminController.createRestaurant
  );
  app.post(
    "/admin/restaurants",
    // 修改後台新增餐廳的路由
    upload.single("image"),
    authenticatedAdmin,
    adminController.postRestaurant
  );
  // 瀏覽一筆餐廳資料 -新增路由
  app.get(
    "/admin/restaurants/:id",
    // 路由字串裡的 :id 是在跟 Express 説這是一個會變動的欄位，請幫我匹配到這個網址，並且把 req.params.id 設成同樣的值，傳給 controller 用。
    // 因此我們可以在 controller 使用 req.params.id 取得動態的 id。
    authenticatedAdmin,
    adminController.getRestaurant
  );
  // 編輯一筆餐廳資料-新增路由
  app.get(
    "/admin/restaurants/:id/edit",
    authenticatedAdmin,
    adminController.editRestaurant
  );
  //編輯一筆餐廳資料-新增路由
  app.put(
    "/admin/restaurants/:id",
    authenticatedAdmin,
    // 修改後台編輯餐廳的路由
    upload.single("image"),
    adminController.putRestaurant
  );
  //刪除一筆餐廳資料-新增路由
  app.delete(
    "/admin/restaurants/:id",
    authenticatedAdmin,
    adminController.deleteRestaurant
  );

  //帳號權限管理-新增路由
  app.get("/admin/users", authenticatedAdmin, adminController.getUsers);
  app.put("/admin/users/:id", authenticatedAdmin, adminController.putUser);

  // 瀏覽分類-新增路由 (for line 4)
  app.get(
    "/admin/categories",
    authenticatedAdmin,
    categoryController.getCategories
  );
  // 新增分類-新增路由 (for line 4)
  app.post(
    "/admin/categories",
    authenticatedAdmin,
    categoryController.postCategory
  );
};
