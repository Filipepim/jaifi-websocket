const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

 Middleware para parse de JSON
app.use(express.json());

 Health check
app.get('health', (req, res) = {
  res.json({ 
    status 'ok', 
    clients clients.size,
    timestamp new Date().toISOString()
  });
});

 Endpoint para receber dados do n8n
app.post('webhook', (req, res) = {
  console.log('📨 Dados recebidos do n8n', JSON.stringify(req.body, null, 2));
  
   Envia para todos os clientes conectados
  const data = JSON.stringify(req.body);
  let sent = 0;
  
  clients.forEach(client = {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      sent++;
    }
  });
  
  console.log(`✅ Enviado para ${sent} cliente(s)`);
  res.json({ success true, clients sent });
});

 Gerenciamento de conexões WebSocket
wss.on('connection', (ws) = {
  console.log('🔌 Novo cliente conectado');
  clients.add(ws);
  
   Envia confirmação de conexão
  ws.send(JSON.stringify({ 
    type 'connection', 
    message 'Conectado ao servidor WebSocket',
    timestamp new Date().toISOString()
  }));
  
  ws.on('message', (message) = {
    console.log('📩 Mensagem recebida', message.toString());
  });
  
  ws.on('close', () = {
    console.log('❌ Cliente desconectado');
    clients.delete(ws);
  });
  
  ws.on('error', (error) = {
    console.error('⚠️ Erro no WebSocket', error);
    clients.delete(ws);
  });
});

const PORT = process.env.PORT  3000;

server.listen(PORT, () = {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 WebSocket wslocalhost${PORT}`);
  console.log(`🔗 Webhook httplocalhost${PORT}webhook`);
  console.log(`💚 Health httplocalhost${PORT}health`);

});
