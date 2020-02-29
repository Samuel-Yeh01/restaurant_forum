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
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, data => {
      return res.json(data);
    });
  },
  // 新增 putCategory-也要加上負責修改資料 controller action：
  putCategory: (req, res) => {
    categoryService.putCategory(req, res, data => {
      return res.json(data);
    });
  },
  // 刪除分類
  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, data => {
      return res.json(data);
    });
  }
};
module.exports = categoryController;
