// app.js
const socket = io();

// Handle socket connection events
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

$(document).ready(() => {
    console.log("Document is ready");

    const $messageForm = $('#message-form');
    const $loadingIndicator = $('#loading-indicator');
    const $messageInput = $('#message-input');
    const $chatMessages = $('#chat-messages');
    const $errorMessage = $('#error-messages');

    $messageForm.submit((event) => {
        event.preventDefault();
        const message = $messageInput.val();
        if (message) {
            $loadingIndicator.show();
            socket.emit('message', { message });
            $messageInput.val('');
        }
    });

    socket.on('message', (data) => {
        $chatMessages.append(`<div class="message user">${data.message}</div>`);
    });

    socket.on('openai-response', (data) => {
        $loadingIndicator.hide();
        $chatMessages.append(`<div class="message bot">${data.reply}</div>`);
    });

    socket.on('error', (data) => {
        $loadingIndicator.hide();
        $errorMessage.text(data.message);
    });
});
