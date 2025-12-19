// ✅ Imports from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded,
  onValue, onDisconnect, set, query,
  orderByChild, limitToLast, remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 Firebase config (make sure databaseURL is correct)
const firebaseConfig = {
  apiKey: "AIzaSyB4RMbgUU5rM9K-RlGreZefwwrIj33ye-c",
  authDomain: "chatwithme-890bd.firebaseapp.com",
  databaseURL: "https://chatwithme-890bd-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ important!
  projectId: "chatwithme-890bd",
  storageBucket: "chatwithme-890bd.appspot.com",
  messagingSenderId: "318766387192",
  appId: "1:318766387192:web:b7ecf55514cd752086d00d",
  measurementId: "G-N49F04413Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References
const messagesRef = ref(db, "messages");
const presenceRef = ref(db, "presence");

// 🎭 Random username
const adjectives = ["Shadow","Neon","Silent","Cosmic","Ghost"];
const animals = ["Fox","Wolf","Tiger","Hawk","Byte"];
const username = `${adjectives[Math.floor(Math.random()*adjectives.length)]}${animals[Math.floor(Math.random()*animals.length)]}_${Math.floor(Math.random()*1000)}`;

// Random color for user messages
const userColor = `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`;

// 👥 Presence tracking
const myPresence = ref(db, "presence/" + username);
set(myPresence, true);
onDisconnect(myPresence).remove();

// Update online count
onValue(presenceRef, snap => {
  const count = snap.exists() ? Object.keys(snap.val()).length : 0;
  document.getElementById("user-count").textContent = `DreamLine: ${count} strangers online`;
});

// 💬 Chat elements
const chat = document.getElementById("chat-window");
const input = document.getElementById("msg-input");
input.focus();
let lastSent = 0;

// Send message function
function sendMessage() {
  const text = input.value.trim();
  if (!text || text.length > 300) return;

  const now = Date.now();
  if (now - lastSent < 1000) return; // 1-second cooldown
  lastSent = now;

  push(messagesRef, {
    user: username,
    text,
    time: now,
    color: userColor
  }).then(() => {
    input.value = "";
  }).catch(err => console.error("Error sending message:", err));
}

// Event listeners
document.getElementById("send-btn").onclick = sendMessage;
input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

// 📡 Receive last 50 messages
const messagesQuery = query(messagesRef, orderByChild("time"), limitToLast(50));
onChildAdded(messagesQuery, snap => {
  const { user, text, time, color } = snap.val();

  const div = document.createElement("div");
  div.className = "msg " + (user === username ? "sent" : "received");
  div.innerHTML = `<strong style="color:${color}">${user}</strong>: ${text}<br><small>${new Date(time).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small>`;

  chat.appendChild(div);
  chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });

  // Keep last 50 messages
  onValue(query(messagesRef, orderByChild("time")), snap => {
    const msgs = snap.val();
    if (!msgs) return;
    const keys = Object.keys(msgs);
    if (keys.length > 50) {
      remove(ref(db, "messages/" + keys[0]));
    }
  }, { onlyOnce: true });
});

// 🎉 User joined notifications
onChildAdded(presenceRef, snap => {
  if (snap.key !== username) {
    const div = document.createElement("div");
    div.className = "msg received";
    div.style.textAlign = "center";
    div.style.opacity = "0.6";
    div.textContent = `${snap.key} joined the chat`;
    chat.appendChild(div);
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  }
});

// 😄 Emoji picker
const picker = picmo.createPicker({ rootElement: document.getElementById("picker-container") });
const emojiBtn = document.getElementById("emoji-btn");

emojiBtn.onclick = () => {
  const pickerContainer = document.getElementById("picker-container");
  pickerContainer.style.display = pickerContainer.style.display === "block" ? "none" : "block";
};

// Close emoji picker when clicking outside
document.addEventListener("click", e => {
  const pickerContainer = document.getElementById("picker-container");
  if (!emojiBtn.contains(e.target) && !pickerContainer.contains(e.target)) {
    pickerContainer.style.display = "none";
  }
});

// Append selected emoji to input
picker.addEventListener("emoji:select", e => { input.value += e.emoji; });

