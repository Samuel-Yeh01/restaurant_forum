const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
// 餐廳列表分頁功能
const pageLimit = 10;
// 瀏覽評論分頁功能
const Comment = db.Comment;
const User = db.User;

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0; // 偏移幾筆後"開始"算~
    let whereQuery = {};
    let categoryId = "";

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit;
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId);
      whereQuery["CategoryId"] = categoryId;
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      nest: true,
      raw: true,
      offset,
      limit: pageLimit
    }).then(result => {
      let page = Number(req.query.page) || 1; // 邏輯運算子 MDN https://mzl.la/2vKwE2d
      let pages = Math.ceil(result.count / pageLimit);
      let totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1 // array是給handlebars的each-helper用的，產生分頁按鈕的數字
      );
      let prev = page - 1 < 1 ? 1 : page - 1; //三元運算子 MDN https://mzl.la/2HK5iff
      let next = page + 1 > pages ? pages : page + 1;
      const data = result.rows.map(r => ({
        ...r, //spread operator
        description: r.description.substring(0, 50)
      }));
      Category.findAll({ raw: true }).then(categories => {
        return res.render("restaurants", {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        });
      });
    });
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      // 解法： Eager Loading-https://sequelize.org/master/manual/eager-loading.html
      include: [Category, { model: Comment, include: [User] }]
    }).then(restaurant => {
      // 查了好多文件，LINE 63 被我 TRY 對一次了 QAQ
      restaurant.increment("viewCounts");
      return res.render(
        "restaurant",
        JSON.parse(
          JSON.stringify({
            restaurant: restaurant
          })
        )
      );
    });
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      // 參考 basecamp 上 Ellen 老師的建議：
      // 現在 res.render 只受理 JS 的原生物件，意即「資料庫回傳的特殊物件」無法直接傳進 template
      // 1. 單純的 model instance 建議用 raw: true：
      // 2. 有關聯式到其他 model，可以用 { raw: true, nest: true } ：
      // 3. 只有一筆資料 (findOne) 的話，也可以直接在傳入 template 時，針對該 instance 直接用 .get() 去取得就好了
      // raw: true,
      // nest: true,
      raw: true,
      nest: true,
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render("feeds", {
          restaurants: restaurants,
          comments: comments
        });
      });
    });
  },
  // Add dashboard page
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, { model: Comment, include: [User] }]
    }).then(restaurant => {
      return res.render(
        "dashboard",
        JSON.parse(
          JSON.stringify({
            restaurant: restaurant
          })
        )
      );
    });
  }
};

module.exports = restController;
