const WebSocket = require('ws');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const http = require('http');

// 1. Tạo Web Server để giữ bot sống
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot AI Minecraft dang chay...');
});

// 2. CẤU HÌNH AI - DÁN KEY CỦA BẠN VÀO DÒNG DƯỚI ĐÂY
const genAI = new GoogleGenerativeAI("AIzaSyBcxpJbMM9hvV977B9mxceYCdpjI4MPbdM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 3. Thiết lập WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Server Minecraft da ket noi!');
  
  // Đăng ký nhận tin nhắn chat
  ws.send(JSON.stringify({
    "header": { "version": 1, "requestId": "1", "messageType": "commandRequest", "messagePurpose": "subscribe" },
    "body": { "eventName": "PlayerMessage" }
  }));

  ws.on('message', async (data) => {
    const msg = JSON.parse(data);
    if (msg.body && msg.body.eventName === 'PlayerMessage') {
      const content = msg.body.properties.Message;
      
      // Nếu tin nhắn bắt đầu bằng dấu !
      if (content.startsWith("!")) {
        const prompt = content.substring(1);
        try {
          const result = await model.generateContent(prompt);
          const response = result.response.text().replace(/\n/g, " ");
          
          // Trả kết quả vào game
          const tellraw = { rawtext: [{ text: `§b[AI]§f: ${response}` }] };
          ws.send(JSON.stringify({
            "header": { "version": 1, "requestId": "2", "messageType": "commandRequest", "messagePurpose": "commandRequest" },
            "body": { "commandLine": `tellraw @a ${JSON.stringify(tellraw)}` }
          }));
        } catch (e) {
          console.error("Loi AI:", e);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Bot dang lang nghe tai port ${PORT}`);
});
