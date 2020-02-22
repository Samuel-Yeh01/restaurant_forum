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
        description: r.description.substring(0, 50),
        // 在輸出餐廳列表時，我們看的是「現在這間餐廳」是否有出現在「使用者的收藏清單」裡面。
        // 我們在 data 裡加入一個 isFavorited 屬性，這裡用 req.user.FavoritedRestaurants 取出使用者的收藏清單，然後 map 成 id 清單，之後用 Array 的 includes 方法進行比對，最後會回傳布林值。
        // 整段程式碼的意思就是說要來看看現在這間餐廳是不是有被使用者收藏，有的話 isFavorited 就會是 true，否則會是 false。
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id)
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
      include: [
        Category,
        { model: User, as: "FavoritedUsers" },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      // 處理單一餐廳時，我們是檢查「現在的 user」是否有出現在收藏「這間餐廳的使用者列表」裡面。
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(
        req.user.id
      );
      // 查了好多文件，LINE 63 被我 TRY 對一次了 QAQ
      restaurant.increment("viewCounts");
      return res.render(
        "restaurant",
        JSON.parse(
          JSON.stringify({
            restaurant: restaurant,
            isFavorited: isFavorited
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
