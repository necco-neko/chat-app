const mongoose = require('mongoose');

// ユーザーデータのスキーマを決定(ユーザー名：必須/一意, パスワード：必須)
const userSchema = new mongoose.Schema({
    username: { type: String, require: true, unique: true},
    password: { type: String, require: true},
});

module.exports= mongoose.model('User', userSchema);