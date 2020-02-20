const moment = require("moment");

module.exports = {
  ifCond: function(a, b, options) {
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  // 新增 moment 函式
  moment: function(a) {
    return moment(a).fromNow();
  }
};
