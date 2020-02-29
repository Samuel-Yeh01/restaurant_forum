const db = require("../models");
const Category = db.Category;
let categoryController = {
  // 瀏覽分類
  getCategories: (req, res, callback) => {
    return Category.findAll().then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then(category => {
          return res.render("admin/categories", {
            categories: categories,
            category: category
          });
        });
      } else {
        callback({ categories: categories });
      }
    });
  },
  // 調整 getCategories

  // 新增分類
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({
        status: "error",
        message: "Category didn't exist"
      });
    } else {
      return Category.create({
        name: req.body.name
      }).then(category => {
        callback({
          status: "success",
          message: "Category was successfully created"
        });
      });
    }
  },
  // 更新 putCategory-也要加上負責修改資料 controller action：
  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({
        status: "error",
        message: "Category didn't exist"
      });
    } else {
      return Category.findByPk(req.params.id).then(category => {
        category.update(req.body).then(category => {
          callback({
            status: "success",
            message: "Category was successfully updated"
          });
        });
      });
    }
  },
  // 刪除分類
  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id).then(category => {
      category.destroy().then(category => {
        callback({ status: "success", message: "" });
      });
    });
  }
};
module.exports = categoryController;
