const db = require("../../models");
const Category = db.Category;
const categoryService = require("../../services/categoryService.js");
let categoryController = {
  // 瀏覽分類
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => {
      return res.json(data);
    });
  },
  // 新增分類
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    } else {
      return Category.create({
        name: req.body.name
      }).then(category => {
        res.redirect("/admin/categories");
      });
    }
  },
  // 新增 putCategory-也要加上負責修改資料 controller action：
  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    } else {
      return Category.findByPk(req.params.id).then(category => {
        category.update(req.body).then(category => {
          res.redirect("/admin/categories");
        });
      });
    }
  },
  // 刪除分類
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id).then(category => {
      category.destroy().then(category => {
        res.redirect("/admin/categories");
      });
    });
  }
};
module.exports = categoryController;
