const express = require("express");
const router = express.Router();
const adminController = require("../controllers/api/adminController.js");
const categoryController = require("../controllers/api/categoryController.js");
const userController = require("../controllers/api/userController.js");
// 引入 multer 並設定上傳資料夾
const multer = require("multer");
const upload = multer({ dest: "temp/" });

router.get("/admin/restaurants", adminController.getRestaurants);
router.get("/admin/restaurants/:id", adminController.getRestaurant);
router.delete("/admin/restaurants/:id", adminController.deleteRestaurant);
router.post(
  "/admin/restaurants",
  upload.single("image"),
  adminController.postRestaurant
);
router.put(
  "/admin/restaurants/:id",
  upload.single("image"),
  adminController.putRestaurant
);
router.get("/admin/categories", categoryController.getCategories);
router.post("/admin/categories", categoryController.postCategory);
router.put("/admin/categories/:id", categoryController.putCategory);
router.delete("/admin/categories/:id", categoryController.deleteCategory);

// JWT signin
router.post("/signin", userController.signIn);

module.exports = router;
