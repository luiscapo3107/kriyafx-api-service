// controllers/dataController.js
const { getRedisClient } = require('../services/redisClient');

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

    // Existing logic for fetching data within a time range > GET /api/options-chain?min=1234567890&max=9876543210
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

module.exports = {
  getOptionsChain,
};