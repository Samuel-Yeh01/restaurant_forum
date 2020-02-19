const db = require("../models");
const Category = db.Category;
let categoryController = {
  // 瀏覽分類
  getCategories: (req, res) => {
    // return Category.findAll().then(categories => {
    //   return res.render(
    //     "admin/categories",
    //     JSON.parse(JSON.stringify({ categories: categories }))
    //   );
    // });
    // 調整 getCategories
    return Category.findAll().then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then(category => {
          return res.render(
            "admin/categories",
            JSON.parse(
              // 但如果網址上有 :id，也就是有傳入 req.params.id 的話，就會再多抓一個分類資料存入 category，把這筆資料傳給 view。
              JSON.stringify({ categories: categories, category: category })
            )
          );
        });
      } else {
        return res.render(
          "admin/categories",
          JSON.parse(JSON.stringify({ categories: categories }))
        );
      }
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
