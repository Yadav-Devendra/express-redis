const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

// Connect to Redis
const redis = new Redis({
    host: '127.0.0.1', // Replace with your Redis host
    port: 6379         // Replace with your Redis port
  });

const app = express();

const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// GET endpoint to retrieve all data from Redis
app.get('/fetchall', async (req, res) => {
    try {
      const keys = await redis.keys('*');
      const allData = {};
  
      for (const key of keys) {
        const value = await redis.get(key);
        console.log(`Key ${key} fetched with value:`, value); // Log fetched value
  
        try {
          allData[key] = JSON.parse(value);
        } catch (parseError) {
          console.error(`Error parsing JSON for key ${key}:`, parseError);
          console.error(`Raw value: ${value}`);
          // Optionally keep the raw value or skip
          allData[key] = value; // Store raw value if parsing fails, to help with debugging
        }
      }
  
      res.send({ allData });
    } catch (error) {
      console.error('Error fetching all data from Redis:', error);
      res.status(500).send({ message: 'Error fetching all data from Redis', error: error.message });
    }
  });

// GET endpoint to retrieve specific data from Redis
app.get('/fetch/:key', async (req, res) => {
    const { key } = req.params;
    try {
      const value = await redis.get(key);
      console.log(value)
      console.log(`Attempting to parse value: ${value}`); // Log the exact string being parsed
  
      if (value) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({key:value}));
      } else {
        res.status(404).send({ message: 'Key not found in Redis' });
      }
    } catch (error) {
      console.error('Error fetching data from Redis:', error);
      res.status(500).send({ message: 'Error fetching data from Redis', error: error.message });
    }
  });

// redis.set("key", "devendra"); // Returns a promise which resolves to "OK" when the command succeeds.

// // ioredis supports the node.js callback style
// redis.get("name", (err, result) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(result); // Prints "value"
//   }
// });

// // Or ioredis returns a promise if the last argument isn't a function
// redis.get("name").then((result) => {
//   console.log(result); // Prints "value"
// });


// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});