const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');

// Create Express application
const app = express();

// Port for the web server
const PORT = 3000;

// Configure body-parser for JSON
app.use(bodyParser.json());

// Create a Redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

// Connect to Redis
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.log('Redis error: ' + err);
});

// Basic route for the home page
app.get('/', (req, res) => {
    res.send('Welcome to the Redis CRUD Application');
});

// CREATE: Add new data to Redis
app.post('/add', (req, res) => {
    const { key, value } = req.body;
    redisClient.set(key, JSON.stringify(value), 'EX', 3600, (err, reply) => {
        if (err) return res.status(500).send('Error setting key in Redis');
        res.send(`Key ${key} set with value ${JSON.stringify(value)}`);
    });
});

// READ: Get data from Redis
app.get('/get/:key', (req, res) => {
    const { key } = req.params;
    redisClient.get(key, (err, reply) => {
        if (err) return res.status(500).send('Error retrieving key from Redis');
        if (reply) res.send({ key, value: JSON.parse(reply) });
        else res.status(404).send('Key not found');
    });
});

// UPDATE: Update data in Redis
app.put('/update/:key', (req, res) => {
    const { key } = req.params;
    const value = req.body;
    redisClient.exists(key, (err, reply) => {
        if (err) return res.status(500).send('Error checking for key in Redis');
        if (reply === 1) {
            redisClient.set(key, JSON.stringify(value), 'EX', 3600, (err, reply) => {
                if (err) return res.status(500).send('Error setting key in Redis');
                res.send(`Key ${key} updated with value ${JSON.stringify(value)}`);
            });
        } else {
            res.status(404).send('Key not found');
        }
    });
});

// DELETE: Delete data from Redis
app.delete('/delete/:key', (req, res) => {
    const { key } = req.params;
    redisClient.del(key, (err, reply) => {
        if (err) return res.status(500).send('Error deleting key from Redis');
        if (reply === 1) res.send(`Key ${key} deleted`);
        else res.status(404).send('Key not found');
    });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});