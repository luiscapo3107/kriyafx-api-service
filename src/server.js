// app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./services/db');
const config = require('./config/config');
const { getRedisClient, closeRedisClient } = require('./services/redisClient');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware to attach Redis client to request object
app.use(async (req, res, next) => {
    req.redisClient = await getRedisClient();
    next();
  });
  
  // Middleware to close Redis connection after response is sent
  app.use(async (req, res, next) => {
    res.on('finish', async () => {
      if (req.redisClient) {
        await closeRedisClient();
      }
    });
    next();
  });

// Routes
app.use('/api', authRoutes);
app.use('/api', dataRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Express server running...');
});

// WebSocket connection handler
wss.on('connection', async (ws) => {
  console.log('New WebSocket connection');
  
  const redisClient = await getRedisClient();
  const subscriber = redisClient.duplicate();
  
  // Function to send the latest data to the client
  const sendLatestData = async () => {
    try {
      const latestData = await redisClient.zRange('options_chain_data_zset', -1, -1);
      if (latestData.length > 0) {
        const parsedData = JSON.parse(latestData[0]);
        ws.send(JSON.stringify({ type: 'update', data: parsedData }));
        console.log('Sent latest data to client');
      } else {
        console.log('No data available in the sorted set');
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  };

  try {
    // Connect the subscriber
    await subscriber.connect();
    console.log('Subscriber connected');

    // Configure keyspace notifications
    await subscriber.sendCommand(['CONFIG', 'SET', 'notify-keyspace-events', 'AKE']);
    console.log('Keyspace notifications configured');

    // Subscribe to keyspace notifications for the sorted set
    await subscriber.subscribe('options_chain_update', async (message) => {
      console.log('Received update notification');
      await sendLatestData();
    });

    // Send initial data when client connects
    await sendLatestData();

    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      await subscriber.quit();
      console.log('Subscriber closed');
    });

  } catch (error) {
    console.error('Error setting up Redis subscriber:', error);
    ws.close();
  }
});

// Start the server
server.listen(config.port, async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log('Connected to MongoDB');
    console.log(`Server listening at http://localhost:${config.port}`);
  } catch (error) {
    console.error(`Error starting the server: ${error}`);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
  });
