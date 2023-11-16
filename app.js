// app.js
const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

$(document).ready(() => {
    console.log("Document is ready");
    const $messageInput = $('#message-input');
    const $sendButton = $('#send-button');
    const $chatMessages = $('#chat-messages');
    const $errorMessage = $('#error-messages');

    $sendButton.click(() => {
        const message = $messageInput.val();
        if (message) {
            // Send the user's message to the server
            socket.emit('message', { message });
    
            // Send message to OpenAI API
            $.post('/openai', { message }, (data) => {
                if (data.error) {
                    // Display the error message to the user
                    $errorMessage.text(data.error);
                } else {
                    const reply = data.reply;
    
                    // Display the OpenAI response in the chat interface
                    $chatMessages.append(`<div class="message bot">${reply}</div>`);
    
                    // Display the user's message in the chat interface
                    $chatMessages.append(`<div class="message user">${message}</div>`);
                }
            });
    
            // Clear the input field
            $messageInput.val('');
        }
    });

    socket.on('message', (data) => {
        // Display messages received from chat GPT
        $chatMessages.append(`<div class="message">${data.message}</div>`);
    });

    socket.on('error', (data) => {
        $errorMessage.text(data.message);
    });
});
