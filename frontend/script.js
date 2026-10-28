const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const newChatBtn = document.getElementById('new-chat-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

const API_URL = 'http://127.0.0.1:8000/api/chat';
let sessionId = localStorage.getItem('nova_session_id') || null;

messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);
newChatBtn.addEventListener('click', resetChat);
clearChatBtn.addEventListener('click', resetChat);

document.querySelectorAll('.prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        messageInput.value = btn.innerText;
        sendMessage();
    });
});

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    addMessageToUI('user', message);
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const typingIndicator = addTypingIndicator();

    try {
        const payload = { message: message };
        if (sessionId) payload.session_id = sessionId;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network error');

        const newSessionId = response.headers.get('X-Session-ID');
        if (newSessionId) {
            sessionId = newSessionId;
            localStorage.setItem('nova_session_id', sessionId);
        }

        typingIndicator.remove();

        // এখানে এআই এর জন্য নতুন বাবল তৈরি করা হচ্ছে
        const aiMessageDiv = addEmptyAIMessage();
        const bubbleDiv = aiMessageDiv.querySelector('.bubble');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkText = decoder.decode(value, { stream: true });
            fullText += chunkText;
            bubbleDiv.innerText = fullText;
            scrollToBottom();
        }

    } catch (error) {
        typingIndicator.remove();
        addMessageToUI('ai', 'দুঃখিত, একটি সমস্যা হয়েছে। সার্ভার চালু আছে কিনা চেক করুন।');
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

function addEmptyAIMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai');

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.innerText = 'N';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('bubble');

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    return messageDiv;
}

function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai');
    
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