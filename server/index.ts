import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { store } from './db/store.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// API REST di supporto e verifica stato
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    time: new Date().toISOString(),
    ordersCount: store.orders.length,
    ingredientsCount: store.ingredients.length
  });
});

app.get('/api/state', (req, res) => {
  res.json(store.getAllData());
});

import path from 'path';
import fs from 'fs';

// Serve dist frontend static files if built
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.includes(path.sep + 'assets' + path.sep) || filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Setup Socket.IO Event Handlers & Background Takeaway Cron Job
setupSocketHandlers(io);

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🍕 GESTIONALE PIZZERIA PRO - SERVER REAL-TIME ATTIVO`);
  console.log(`📱 Locale:       http://localhost:${PORT}`);
  console.log(`📡 Da Smartphone/Tablet (stesso Wi-Fi): http://10.173.129.234:${PORT}`);
  console.log(`=======================================================`);
});
