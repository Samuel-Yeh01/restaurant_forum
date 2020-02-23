"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN, // 加入 isAdmin 欄位
      image: DataTypes.STRING
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Comment);
    User.belongsToMany(models.Restaurant, {
      through: models.Favorite,
      foreignKey: "UserId",
      as: "FavoritedRestaurants"
    });
    User.belongsToMany(models.Restaurant, {
      through: models.Like,
      foreignKey: "UserId",
      as: "LikedRestaurants"
    });

    // 定義資料模型：Followship
    // 這邊因為是自關聯的緣故，所以看起來很像在念繞口令，但只要掌握兩個原則即可，假設我的 userId 是 5：
    // 1. 找出所有 followingId 是 5 的人，就是我的 follower
    // 2. 找出所有 followerId 是 5 的人，就是我在 following 的人

    // 1.
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: "followingId",
      as: "Followers"
    });
    // 2.
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: "followerId",
      as: "Followings"
    });
  };
  return User;
};
