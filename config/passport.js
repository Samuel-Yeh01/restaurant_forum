const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const Restaurant = db.Restaurant; //為了能從 DB 中，撈出使用者的 收藏/喜好的餐廳清單，故引入 db.Restaurant
const Like = db.Like;

// setup passport strategy
// 首先用 passport.use(new LocalStrategy()) 選用認證策略，LocalStrategy 代表我們想要在本地端自己處理跟登入相關的邏輯。

passport.use(
  new LocalStrategy(
    //然後在 LocalStrategy 裡面有一段很長的程式碼，但仔細看是兩個參數，第一個參數可以傳入客製化的選項，而第二個參數是一個 callback function，內容是驗證使用者。
    // 客製化使用者欄位名稱的部分相信大家都很熟悉了，這裡特別講一下為什麼我們要打開 passReqToCallback: true 這個選項：
    // 主要是因為剛才好不容易設置了 flash message，現在也想沿用，那麼就必須在 passport 的驗證邏輯裡，拿到 req 這個參數。

    // 如果在第一組參數裡設定了 passReqToCallback: true，就可以 callback 的第一個參數裡拿到 req，這麼一來我們就可以呼叫 req.flash() 把想要客製化的訊息放進去。
    // option/customize user field
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    // function/authenticate user
    // 接著是驗證使用者的邏輯，這段 callback 一共有 4 個參數，最後一個 cb 對應到官方文件裡的 done 這裡講師習慣寫成 cb，想強加表達 callback 的意思，也就是在驗證後要執行的另一個 callback function：
    (req, username, password, cb) => {
      User.findOne({ where: { email: username } }).then(user => {
        if (!user)
          return cb(
            null,
            false,
            req.flash("error_messages", "帳號或密碼輸入錯誤")
          );
        if (!bcrypt.compareSync(password, user.password))
          return cb(
            null,
            false,
            req.flash("error_messages", "帳號或密碼輸入錯誤！")
          );
        return cb(null, user);
        // 我們看到在 User.findOne().then() 的段落裡，要成功走到最後一行，才會 return cb(null, user)，這裡第一個 null 是 Passport 的奇妙設計，不要管他，第二個參數如果傳到 user，就代表成功登入了，並且會回傳 user。
        // 如果在前面兩關 if () { return } 被擋下來，就會回傳 cb(null, false, ...) ，只要在第二位帶入 false 就代表登入不成功。
      });
    }
  )
);

// serialize and deserialize user 序列化
// 至於最後一段序列化，是轉換資料的過程，主要的目的是節省空間。
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: db.Restaurant, as: "FavoritedRestaurants" },
      { model: db.Restaurant, as: "LikedRestaurants" },
      { model: User, as: "Followers" },
      { model: User, as: "Followings" }
    ]
  }).then(user => {
    return cb(null, user.get());
  });
});

module.exports = passport;

// 在登入以後，passport 預設會把整個 user 物件實例都存在 session 裡面，這樣的問題是會佔用許多 session 空間，而且很多資訊我們可能也用不到。

// 但其實因為 user id 是獨一無二的，只要有 user id，就能夠再另外查找出 user 物件。所以「序列化」這個技術的用意就是只存 user id，不存整個 user，而「反序列化」就是透過 user id，把整個 user 物件實例拿出來。

// 當資料很大包、會頻繁使用資料，但用到的欄位又很少時，就會考慮使用序列化的技巧來節省空間。
