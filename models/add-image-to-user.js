"use strict";
module.exports = (sequelize, DataTypes) => {
  const addImageToUser = sequelize.define(
    "add-image-to-user",
    {
      image: DataTypes.STRING
    },
    {}
  );
  addImageToUser.associate = function(models) {
    // associations can be defined here
  };
  return addImageToUser;
};
