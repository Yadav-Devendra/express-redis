import express from 'express';
import bodyParser from 'body-parser';
import redis from 'redis';

const app = express();
app.use(bodyParser.json());

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

app.post('/users', (req, res) => {
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
        return res.status(400).json({ error: 'Please provide id, name, and email' });
    }

    const user = { name, email };
    client.hSet(`user:${id}`, user, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving user to Redis' });
        }
        return res.status(201).json({ message: 'User created successfully' });
    });
});


app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    client.hGetAll(`user:${id}`, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving user from Redis' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    });
});

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Please provide name and email' });
    }

    const user = { name, email };
    client.hSet(`user:${id}`, user, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating user in Redis' });
        }
        return res.status(200).json({ message: 'User updated successfully' });
    });
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    client.del(`user:${id}`, (err, response) => {
        if (err) {
            return res.status(500).json({ error: 'Error deleting user from Redis' });
        }
        if (response === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully' });
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});