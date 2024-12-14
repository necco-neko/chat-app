const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// 登録処理
router.post('/register', async (req, res) => {
  const { username, password } = req.body; // フォームから送られたデータを取得

  if (!username || !password) {
    return res.status(400).send('Both username and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // パスワードをハッシュ化
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.send(`
      <div>
        <p>User registered successfully !</p>
        <a href="/">Go to login page</a>
      </div>
    `);
  } catch (err) {
    if (err.code === 11000 & err.message.includes('username')) {
      // MongoDBの重複エラー(ユーザー名が既に使用されている)
      res.status(400).send(`
        <div>
          <p>This username is already taken. Please choose another one.</p>
          <a href="/register">Try again</a>
        </div>
      `);
    } else {
      // その他のエラー(予期していないエラー)
      res.status(500).send(`
        <div>
          <p>An unexpected error occurred: ${err.message}</p>
          <a href="/register">Try again</a>
        </div>
      `);
    }
  }
});

// ログイン処理
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // フォームから送られたデータを取得

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send(`
        <div>
          <p>Invalid credentials</p>
          <a href="/">Try again</a>
        </div>
      `);
    }

    const isMatch = await bcrypt.compare(password, user.password); //パスワードを比較
    if (!isMatch) {
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
  } catch (err) {
    res.status(500).send('An error occurred during login');
  }
});

// ログアウト処理
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

// アカウント削除処理
router.post('/delete-account', async (req, res) => {
  const username = req.session.user;

  if(!username) {
    return res.status(401).send(`
      <div>
        <p>Yout must be logged in to delete your account.</p>
        <a href="/">Go to login page</a>
      </div>
    `);
  }

  try {
    const result = await User.deleteOne({ username });

    if (result.deletedCount === 1) {
      console.log(`User '${username}' has been deleted.`);
      req.session.destroy((err) => {
        if (err) {
          console.log('Failed to destroy session:', err);
          return res.status(500).send('An error occurred while deleting the account.');
        }
        res.redirect('/');
      });
    } else {
      res.status(400).send('Account deletion failed');
    }
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).send('An error occurred while deleting the account.');
  }
});

module.exports = router;
