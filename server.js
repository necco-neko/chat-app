// 必要なモジュールを読み込む
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Expressアプリケーションを作成
const app = express();

// HTTPサーバーを作成(ExpressをHTTPサーバーとして利用)
const server = http.createServer(app);

// Socket.IOサーバーを作成(HTTPサーバーにリアルタイム通信を追加)
const io = new Server(server);

// 静的ファイルを提供(フロントエンドのファイルを'public/'から配信)
app.use(express.static('public'));

//ルートの定義(ブラウザでアクセスした際の初期画面を設定)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected'); // クライアントが接続したときにログを出力

    // クライアントからの「chat messaga」イベントをリッスン
    socket.on('chat message', (msg) => {
        console.log('Message receievd: ' + msg);
        io.emit('chat message', msg);
    });

    // クライアントが切断したときのイベント
    socket.on('disconnect', () => {
        console.log('A user disconnected'); // 切断時にログを出力
    });
});

// サーバーを起動(ポート3000でリッスン開始)
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000'); // サーバー起動時にログ出力
});