// index.js

require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const openai = require('openai');
const path = require('path');

app.use(express.static(__dirname));


const PORT = process.env.PORT || 3000;

const Message = mongoose.model('Message', {
    content: String,
    timestamp: { type: Date, default: Date.now },
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('message', async (data) => {
        const { message } = data;

        // Save message to MongoDB
        const newMessage = new Message({ content: message });
        await newMessage.save();

        // Broadcast message to all connected clients
        io.emit('message', { message });
    });
});

const openaiApiKey = process.env.OPENAI_API_KEY

const openaiInstance = new openai.OpenAI({ key: openaiApiKey });

app.use(express.json());

app.post('/openai', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await openaiInstance.chat.completions.create({
            model: 'text-davinci-003',
            prompt: message,
            max_tokens: 2048,
            temperature: 1,
        });

        res.json({ reply: response.choices[0].text.trim() });

    } catch (error) {
        console.error(error.message);
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        io.emit('error', { message: error.message });
    }
});
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
