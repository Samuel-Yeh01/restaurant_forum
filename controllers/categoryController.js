const db = require("../models");
const Category = db.Category;
const categoryService = require("../services/categoryService.js");
let categoryController = {
  // 瀏覽分類
  getCategories: (req, res) => {
    // 調整 getCategories
    categoryService.getCategories(req, res, data => {
      return res.render("admin/categories", data);
    });
  },
  // 新增分類
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, data => {
      if (data["status"] === "error") {
        req.flash("error_messages", data["message"]);
        return res.redirect("back");
      }
      req.flash("success_messages", data["message"]);
      res.redirect("admin/categories", data);
    });
  },
  // 新增 putCategory-也要加上負責修改資料 controller action：
  putCategory: (req, res) => {
    categoryService.putCategory(req, res, data => {
      if (data["status"] === "error") {
        req.flash("error_messages", data["message"]);
        return res.redirect("back");
      }
      req.flash("success_messages", data["message"]);
      res.redirect("admin/categories", data);
    });
  },
  // 刪除分類
  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, data => {
      if (data["status"] === "success") {
        return res.redirect("admin/categories");
      }
    });
  }
};
module.exports = categoryController;
