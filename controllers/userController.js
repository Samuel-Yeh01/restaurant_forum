const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const Restaurant = db.Restaurant;
const Comment = db.Comment;
const Favorite = db.Favorite; // 加入/移除最愛功能

// 引入 imgur API
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID || "94d3dc824c1ffdf";

const userController = {
  signUpPage: (req, res) => {
    return res.render("signup");
  },
  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash("error_messages", "兩次密碼輸入不同！");
      return res.redirect("/signup");
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash("error_messages", "信箱重複！");
          return res.redirect("/signup");
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            )
          }).then(user => {
            req.flash("success_messages", "成功註冊帳號！");
            return res.redirect("/signin");
          });
        }
      });
    }
  },

  signInPage: (req, res) => {
    return res.render("signin");
  },

  signIn: (req, res) => {
    req.flash("success_messages", "成功登入！");
    res.redirect("/restaurants");
  },

  logout: (req, res) => {
    req.flash("success_messages", "登出成功！");
    req.logout();
    res.redirect("/signin");
  },
  // 瀏覽 profile
  getUser: (req, res) => {
    // 防止用 POSTMAN 發送 PutUser 的 HTTP請求，預防別人偷改其他人的資料。
    if (Number(req.params.id) === req.user.id) {
      User.findByPk(req.params.id, {
        include: [{ model: Comment, include: [Restaurant] }]
      }).then(user => {
        // 把 Comments中的 Rests.
        // 依序 push進 commentedRests. array，讓 view 來 render
        user = JSON.parse(JSON.stringify(user));
        let commentedRests = [];
        user.Comments.map(comment => {
          commentedRests.push(comment.Restaurant);
        });
        return res.render("profile", {
          user,
          commentedRestaurants: commentedRests
        });
      });
    } else {
      req.flash("error_messages", "僅限修改自身頁面，請重新登入！");
      req.logout();
      res.redirect("/signin");
    }
  },
  // 瀏覽編輯 profile
  editUser: (req, res) => {
    // 防止用 POSTMAN 發送 PutUser 的 HTTP請求，預防別人偷改其他人的資料。
    if (Number(req.params.id) === req.user.id) {
      User.findByPk(req.params.id, { raw: true }).then(user => {
        return res.render("editProfile", { user });
      });
    } else {
      req.flash("error_messages", "僅限修改自身頁面，請重新登入！");
      req.logout();
      res.redirect("/signin");
    }
  },
  // 更新 profile
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "查無此人，請重新操作！");
      return res.redirect("back");
    }

    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              image: file ? img.data.link : null
            })
            .then(user => {
              req.flash("success_messages", "個人檔案成功更新!");
              res.redirect(`/users/${user.id}`);
            });
        });
      });
    } else {
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            image: null
          })
          .then(user => {
            req.flash("success_messages", "個人檔案成功更新!");
            res.redirect(`/users/${user.id}`);
          });
      });
    }
  },
  // 當使用者點擊按鈕時，其實新增或移除的資料，是在 Favorite model 上的紀錄，而 UserId 可以透過 Passport 提供的 req.user 取得，而 RestaurantId 要透過前端表單送進來。
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect("back");
    });
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy().then(restaurant => {
        return res.redirect("back");
      });
    });
  }
};

module.exports = userController;
