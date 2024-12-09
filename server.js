// 必要なモジュールを読み込む
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');

// Expressアプリケーションを作成
const app = express();

// HTTPサーバーを作成(ExpressをHTTPサーバーとして利用)
const server = http.createServer(app);

// Socket.IOサーバーを作成(HTTPサーバーにリアルタイム通信を追加)
const io = new Server(server);

// セッション設定
const sessionMiddleware = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
});

// セッションをExpressアプリに適用
app.use(sessionMiddleware);

// Socket.IOにExpressセッションを共有
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// JSONとURLエンコードされたデータの解析を有効にする
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 認証ルートの設定
app.use(authRoutes);

// 初期画面：ログインページ
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// チャット画面：ログイン処理
app.get('/chat', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.redirect('/'); // 未ログインなら初期画面(ログイン画面)へリダイレクト
    }
});

// ログアウト処理
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).send('An error occured while logging out');
        }
        res.redirect('/'); // ログアウト後はログイン画面に遷移
    });
});

// ユーザー登録画面
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// 静的ファイルを提供(フロントエンドのファイルを'public/'から配信)
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IOの処理
io.on('connection', (socket) => {
    // セッション情報を取得
    const session = socket.request.session;

    //ユーザー名を取得
    const username = session.user || 'Anonymous';

    // ユーザーが見つからない場合
    if (!session.user) {
        console.log('No user session found');
    }

    // 接続したユーザーをログに出力
    console.log(`User ${username} connected`);

    // クライアントからの「chat messaga」イベントをリッスン
    socket.on('chat message', (msg) => {
        console.log(`${username}: ${msg}`);
        io.emit('chat message', {user: username, text: msg});
    });

    // クライアントが切断したときのイベント
    socket.on('disconnect', () => {
        console.log(`${username} disconnected`); // 切断時にログを出力
    });
});

// サーバーを起動(ポート3000でリッスン開始)
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000'); // サーバー起動時にログ出力
});