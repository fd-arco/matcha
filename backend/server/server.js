const express = require('express');
const http = require("http");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const {initWebSocket} = require("./websocket/websocket");


dotenv.config({path: "./.env"});

const app = express();
const server = http.createServer(app);
initWebSocket(server);

app.use(express.json());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/fakeprofilephotos", express.static("fakeprofilephotos"));
app.use("/auth", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/messages", require("./routes/messages"));
app.use("/notifications", require("./routes/notifications"));
app.use("/likes", require("./routes/likes"));
app.use("/misc", require("./routes/misc"));

app.get('/api', (req, res) => res.json({ message: 'API is running!' }));

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});













