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
    userType: String,
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
        const userMessage = new Message({ content: message, userType: 'user' });
        await userMessage.save();

        io.emit('message', { message });

        // Add the user's message to the conversation history
        conversationHistory.push({ role: 'user', content: message });

        try {
            const response = await openaiInstance.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: conversationHistory,
                max_tokens: 2048,
                temperature: 1,
            });

            const aiResponse = response.choices[0].message.content;

            const chatBotMessage = new Message({ content: aiResponse, userType: 'chatBot' });
            await chatBotMessage.save();

            conversationHistory.push({ role: 'assistant', content: aiResponse });

            io.emit('openai-response', { reply: aiResponse.trim() });
        } catch (error) {
            console.error(error.message);
            console.error(error);
            io.emit('error', { message: error.message });
        }
    });
});

const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiInstance = new openai.OpenAI({ key: openaiApiKey });

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

let conversationHistory = []; // Initialize an array to store conversation history
