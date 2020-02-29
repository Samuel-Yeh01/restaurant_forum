const db = require("../models");
const Restaurant = db.Restaurant;
const User = db.User;
// 實作上傳圖片功能--引入 imgur 並且宣告 client ID：
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID || "94d3dc824c1ffdf";
// 從DB引入餐廳分類
const Category = db.Category;

const adminController = {
  // 瀏覽全部餐廳資料- 新增 controller
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => {
      return res.render("admin/restaurants", data);
    });
  },
  // 瀏覽一筆餐廳資料-新增 controller
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => {
      return res.render("admin/restaurant", data);
    });
  },
  // 刪除一筆餐廳資料-新增 Controller
  // 而在原本處理 view 的 controllers/adminController.js，我們可以加一個判斷式，若收到 success，就跳回後台的餐廳總表：
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      if (data["status"] === "success") {
        return res.redirect("/admin/restaurants");
      }
    });
  },
  // 回到 controllers/adminController.js，運用 data['status'] 來區分成功和失敗的狀況，分別進行不同的處理：
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, data => {
      if (data["status"] === "error") {
        req.flash("error_messages", data["message"]);
        return res.redirect("back");
      }
      req.flash("success_messages", data["message"]);
      res.redirect("/admin/restaurants");
    });
  },

  // CRUD--Create
  createRestaurant: (req, res) => {
    // return res.render("admin/create");
    Category.findAll().then(categories => {
      return res.render(
        "admin/create",
        JSON.parse(JSON.stringify({ categories: categories }))
      );
    });
  },

  // 編輯一筆餐廳資料-新增 controller
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { nest: true, raw: true }).then(
      restaurant => {
        Category.findAll({ nest: true, raw: true }).then(categories => {
          return res.render("admin/create", {
            categories: categories,
            restaurant: restaurant
          });
        });
      }
    );
    // return Restaurant.findByPk(req.params.id).then((categories, restaurant) => {
    //   return res.render(
    //     "admin/create",
    //     JSON.parse(
    //       JSON.stringify({ categories: categories }, { restaurant: restaurant })
    //     )
    //   );
    // });
  },
  // 更新一筆餐廳資料-新增 controller
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    }

    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          restaurant
            .update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              // image: file ? img.data.link : restaurant.image,
              image: file ? img.data.link : null,
              CategoryId: req.body.categoryId
            })
            .then(restaurant => {
              req.flash(
                "success_messages",
                "restaurant was successfully to update"
              );
              res.redirect("/admin/restaurants");
            });
        });
      });
    } else {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        restaurant
          .update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            // image: restaurant.image,
            image: null,
            CategoryId: req.body.categoryId
          })
          .then(restaurant => {
            req.flash(
              "success_messages",
              "restaurant was successfully to update"
            );
            res.redirect("/admin/restaurants");
          });
      });
    }
  },

  //A3: 使用者權限管理!
  getUsers: (req, res) => {
    return User.findAll().then(users => {
      // 效果：登入中使用者無須權限轉移
      let loginUser = req.user.id;
      for (user of users) {
        if (user.id === loginUser) {
          user.dataValues.showLink = false;
        } else {
          user.dataValues.showLink = true;
        }
      }
      return res.render("admin/users", {
        users: JSON.parse(JSON.stringify(users))
      });
    });
  },
  // 修改使用者權限
  putUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      user
        .update({
          isAdmin: !user.isAdmin
        })
        .then(user => {
          req.flash(
            "success_messages",
            `Authority of ${user.name} was successfully changed`
          );
          res.redirect("/admin/users");
        });
    });
  }
};

module.exports = adminController;
