const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;

const adminController = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => {
      callback({ restaurants: restaurants });
    });
  },
  // 瀏覽一筆餐廳資料-新增 controller
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(
      restaurant => {
        callback({ restaurant: restaurant });
      }
    );
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

  // 新增一筆餐廳資料-新增 Controller
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    }

    const { file } = req; // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log("Error: ", err);
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null
        }).then(restaurant => {
          req.flash("success_messages", "restaurant was successfully created");
          return res.redirect("/admin/restaurants");
        });
      });
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null
      }).then(restaurant => {
        req.flash("success_messages", "restaurant was successfully created");
        return res.redirect("/admin/restaurants");
      });
    }
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
  // 刪除一筆餐廳資料-新增 Controller
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy().then(restaurant => {
        res.redirect("/admin/restaurants");
      });
    });
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
