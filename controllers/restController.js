const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
// 餐廳列表分頁功能
const pageLimit = 10;
// 瀏覽評論分頁功能
const Comment = db.Comment;
const User = db.User;

const restController = {
  //前台瀏覽餐廳-總表
  getRestaurants: (req, res) => {
    let offset = 0;
    let whereQuery = {};
    let categoryId = "";
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit;
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId);
      whereQuery["CategoryId"] = categoryId;
    }
    Restaurant.findAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      // data for pagination
      let page = Number(req.query.page) || 1; // 邏輯運算子 MDN https://mzl.la/2vKwE2d
      let pages = Math.ceil(result.count / pageLimit);
      let totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      );
      let prev = page - 1 < 1 ? 1 : page - 1;
      let next = page + 1 > pages ? pages : page + 1;
      // clean up restaurant data
      const data = result.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50)
      }));
      Category.findAll().then(categories => {
        return res.render(
          "restaurants",
          JSON.parse(
            JSON.stringify({
              restaurants: data,
              categories: categories,
              categoryId: categoryId,
              page: page,
              totalPage: totalPage,
              prev: prev,
              next: next
            })
          )
        );
      });
    });
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      // 解法： Eager Loading-https://sequelize.org/master/manual/eager-loading.html
      include: [Category, { model: Comment, include: [User] }]
      // include: [Category, Comment]
    }).then(restaurant => {
      return res.render(
        "restaurant",
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

// const db = require("../models");
// const Restaurant = db.Restaurant;
// const Category = db.Category;
// const restController = {
//   //前台瀏覽餐廳-總表
//   getRestaurants: (req, res) => {
//     Restaurant.findAll({ include: Category }).then(restaurants => {
//       const data = restaurants.map(r => ({
//         ...r.dataValues,
//         description: r.dataValues.description.substring(0, 50)
//       }));

//       Category.findAll().then(categories => {
//         // 取出 categories
//         return res.render(
//           "restaurants",
//           JSON.parse(
//             JSON.stringify({
//               restaurants: data,
//               categories: categories,
//               categoryId: categoryId
//             })
//           )
//         );
//       });
//     });
//   },
//   // 前台瀏覽餐廳-個別資料
//   getRestaurant: (req, res) => {
//     return Restaurant.findByPk(req.params.id, {
//       include: Category
//     }).then(restaurant => {
//       return res.render(
//         "restaurant",
//         JSON.parse(
//           JSON.stringify({
//             restaurant: restaurant
//           })
//         )
//       );
//     });
//   }
// };
// module.exports = restController;
