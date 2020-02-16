const db = require("../models");
const Restaurant = db.Restaurant;
const fs = require("fs");
const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll().then(restaurants => {
      res.render(
        "admin/restaurants",
        JSON.parse(JSON.stringify({ restaurants: restaurants }))
      );

      // return res.render("admin/restaurants", {
      //   restaurants: restaurants,
      //   user: req.user,
      //   isAuthenticated: req.isAuthenticated
      // });
    });
  },
  // CRUD--Create
  createRestaurant: (req, res) => {
    return res.render("admin/create");
  },

  // 新增一筆餐廳資料-新增 Controller
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    }

    const { file } = req; // equal to const file = req.file
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log("Error: ", err);
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.create({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: file ? `/upload/${file.originalname}` : null
          }).then(restaurant => {
            req.flash(
              "success_messages",
              "restaurant was successfully created"
            );
            return res.redirect("/admin/restaurants");
          });
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
  // 瀏覽一筆餐廳資料-新增 controller
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render(
        "admin/restaurant",
        JSON.parse(JSON.stringify({ restaurant: restaurant }))
      );
    });
  },
  // 編輯一筆餐廳資料-新增 controller
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render(
        "admin/create",
        JSON.parse(JSON.stringify({ restaurant: restaurant }))
      );
    });
  },
  // 更新一筆餐廳資料-新增 controller
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    }

    const { file } = req;
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log("Error: ", err);
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.findByPk(req.params.id).then(restaurant => {
            restaurant
              .update({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: file ? `/upload/${file.originalname}` : restaurant.image
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
            image: restaurant.image
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
  }
};

module.exports = adminController;
