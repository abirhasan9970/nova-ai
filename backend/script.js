// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const newChatBtn = document.getElementById('new-chat-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

// API Configuration
const API_URL = 'http://127.0.0.1:8000/api/chat';
let sessionId = localStorage.getItem('nova_session_id') || null;

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send message on Enter (Shift+Enter for new line)
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
newChatBtn.addEventListener('click', resetChat);
clearChatBtn.addEventListener('click', resetChat);

// Quick Prompts click
document.querySelectorAll('.prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        messageInput.value = btn.innerText;
        sendMessage();
    });
});

// Main function to send message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    addMessageToUI('user', message);
    
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const typingIndicator = addTypingIndicator();

    try {
        const payload = {
            message: message
        };
        
        // Only add session_id if it exists, to prevent 422 error
        if (sessionId) {
            payload.session_id = sessionId;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Server Error Details:", errData);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.session_id) {
            sessionId = data.session_id;
            localStorage.setItem('nova_session_id', sessionId);
        }

        typingIndicator.remove();
        addMessageToUI('ai', data.reply);

    } catch (error) {
        typingIndicator.remove();
        addMessageToUI('ai', 'দুঃখিত, একটি সমস্যা হয়েছে। টার্মিনাল চেক করুন।');
        console.error('Error:', error);
    }
}

function addMessageToUI(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.innerText = role === 'user' ? 'U' : 'N';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('bubble');
    bubbleDiv.innerText = text;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(bubbleDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai');
    messageDiv.id = 'typing-indicator';

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.innerText = 'N';

    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing');
    typingDiv.innerHTML = '<span></span><span></span><span></span>';

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(typingDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    return messageDiv;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function resetChat() {
    chatMessages.innerHTML = '';
    chatMessages.appendChild(welcomeScreen);
    welcomeScreen.style.display = 'flex';
    sessionId = null;
    localStorage.removeItem('nova_session_id');
    messageInput.value = '';
}
