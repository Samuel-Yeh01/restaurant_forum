const db = require("../../models");
const Category = db.Category;
const categoryService = require("../../services/categoryService.js");
let categoryController = {
  // 瀏覽分類-api
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => {
      return res.json(data);
    });
  },
  // 新增分類
  postCategory: (req, res, data) => {
    categoryService.postCategory(req, res, data => {
      return res.json(data);
    });
  },
  // 新增 putCategory-也要加上負責修改資料 controller action：
  putCategory: (req, res, data) => {
    categoryService.putCategory(req, res, data => {
      return res.json(data);
    });
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
