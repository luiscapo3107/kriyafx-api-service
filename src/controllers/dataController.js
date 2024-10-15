// controllers/dataController.js
const { getRedisClient } = require('../services/redisClient');
const WebSocket = require('ws');

let wss; // WebSocket server instance

const setWebSocketServer = (webSocketServer) => {
  wss = webSocketServer;
};

const getOptionsChain = async (req, res) => {
  try {
    const redisClient = await getRedisClient();

    if (req.query.latest !== undefined) {
   
      const latestData = await redisClient.zRange('options_chain_data_zset', -1, -1);
      
      
      if (latestData.length === 0) {
        return res.status(404).json({ message: 'No data available' });
      }
      
      const data = JSON.parse(latestData[0]);
      return res.json(data);
    }

    // Existing logic for fetching data within a time range
    const minTimestamp = req.query.min ? parseInt(req.query.min) : '-inf';
    const maxTimestamp = req.query.max ? parseInt(req.query.max) : '+inf';

    const dataList = await redisClient.zRangeByScore('options_chain_data_zset', minTimestamp, maxTimestamp);

    const data = dataList.map((item) => JSON.parse(item));

    res.json(data);
  } catch (error) {
    console.error(`Error retrieving data from Redis: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addNewOptionsChainData = async (req, res) => {
  try {
    const redisClient = await getRedisClient();
    const data = req.body; 
    const timestamp = Date.now();
    const jsonData = JSON.stringify(data);

    await redisClient.zAdd('options_chain_data_zset', { score: timestamp, value: jsonData });
    
    // Publish the new data to the 'new_options_chain' channel
    await redisClient.publish('new_options_chain', jsonData);

    // Send the update to all connected WebSocket clients
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'update', data }));
        }
      });
    }

    res.status(201).json({ message: 'New options chain data added successfully' });
  } catch (error) {
    console.error(`Error adding new options chain data: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getOptionsChain,
  addNewOptionsChainData,
  setWebSocketServer
};
