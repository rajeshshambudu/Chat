import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildRemoved, query, limitToLast, orderByChild, remove, onValue, onDisconnect, set } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Initialize Lucide Icons
lucide.createIcons();

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

// 1. User Logic
let user = localStorage.getItem('nexusUser') || prompt("Enter Call-sign:") || "Guest_" + Math.floor(Math.random() * 1000);
localStorage.setItem('nexusUser', user);

// 2. Presence Logic (X Online)
const userPresenceRef = ref(db, 'presence/' + user);
const presenceFolderRef = ref(db, 'presence');
const connectedRef = ref(db, '.info/connected');

onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
        onDisconnect(userPresenceRef).remove();
        set(userPresenceRef, true);
    }
});

onValue(presenceFolderRef, (snap) => {
    document.getElementById('user-count').innerText = `${snap.size || 0} Operatives Online`;
});

// 3. Message Logic
const chatWindow = document.getElementById('chat-window');
const msgInput = document.getElementById('msg-input');

const postMessage = () => {
    if (msgInput.value.trim()) {
        push(messagesRef, { user, text: msgInput.value, timestamp: Date.now() });
        msgInput.value = "";
    }
};

document.getElementById('send-btn').onclick = postMessage;
msgInput.onkeypress = (e) => e.key === 'Enter' && postMessage();

// 4. Stream Messages
const q = query(messagesRef, orderByChild('timestamp'), limitToLast(50));
onChildAdded(q, (snapshot) => {
    const { user: author, text, timestamp } = snapshot.val();
    const isMe = author === user;
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isMe ? 'sent' : 'received'}`;
    msgDiv.innerHTML = `<strong>${author}</strong>${text}<small>${timeStr}</small>`;
    
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
});

// 5. Admin Cleanup
document.getElementById('clear-btn').onclick = () => {
    if (prompt("Admin Authorization Required:") === "admin123") remove(messagesRef);
};
onChildRemoved(messagesRef, () => chatWindow.innerHTML = "");

// 6. Emoji Picker
const picker = picmo.createPicker({ rootElement: document.getElementById('picker-container') });
document.getElementById('emoji-btn').onclick = () => {
    const container = document.getElementById('picker-container');
    container.style.display = container.style.display === 'block' ? 'none' : 'block';
};
picker.addEventListener('emoji:select', (e) => {
    msgInput.value += e.emoji;
    document.getElementById('picker-container').style.display = 'none';
});
