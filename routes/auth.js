const express = require('express');
const router = express.Router();
const session = require('express-session');

const users = {}; // 簡単な例としてメモリに保存（後でDBに変更）

// 登録処理
router.post('/register', async (req, res) => {
  const { username, password } = req.body; // フォームから送られたデータを取得

  if (!username || !password) {
    return res.status(400).send('Both username and password are required');
  }

  // ユーザーがすでに存在する場合
  if (users[username]) {
    return res.status(400).send(`
        <div>
            <p>Username already exists</p>
            <a href="/">Go to login page</a>
        </div>
    `);
  }

  users[username] = { password };
  console.log('Registerd user', users);
  res.send(`
    <div>
        <p>User registered successfully !</p>
        <a href="/">Go to login page</a>
    </div>
  `);
});

// ログインエンドポイント
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // フォームから送られたデータを取得

  // 情報が存在しない
  if (!username && !password) {
    return res.status(400).send(`
        <div>
            <p>Username or password does not exist</p>
            <a href="/">Try again</a>
        </div>
    `);
  }

  // 入力が登録情報と異なる
  if (!users[username] || users[username].password !== password) {
    return res.status(400).send(`
        <div>
            <p>Invalid credentials</p>
            <a href="/">Try again</a>
        </div>
    `);
  }

  // ログイン成功
  req.session.user = username;
  res.redirect('/chat');
});

module.exports = router;
