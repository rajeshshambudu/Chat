
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded,
  onValue, onDisconnect, set, query,
  orderByChild, limitToLast, remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔥 Replace with your Firebase config */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4RMbgUU5rM9K-RlGreZefwwrIj33ye-c",
  authDomain: "chatwithme-890bd.firebaseapp.com",
  projectId: "chatwithme-890bd",
  storageBucket: "chatwithme-890bd.firebasestorage.app",
  messagingSenderId: "318766387192",
  appId: "1:318766387192:web:b7ecf55514cd752086d00d",
  measurementId: "G-N49F04413Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const messagesRef = ref(db, "messages");
const presenceRef = ref(db, "presence");

/* 🎭 Stranger Name */
const adjectives = ["Shadow","Neon","Silent","Cosmic","Ghost"];
const animals = ["Fox","Wolf","Tiger","Hawk","Byte"];
const username = `${adjectives[Math.floor(Math.random()*5)]}${animals[Math.floor(Math.random()*5)]}_${Math.floor(Math.random()*1000)}`;

/* 👥 Presence */
const myPresence = ref(db, "presence/" + username);
set(myPresence, true);
onDisconnect(myPresence).remove();

onValue(presenceRef, snap => {
  const count = snap.exists() ? Object.keys(snap.val()).length : 0;
  document.getElementById("user-count").textContent =
    `${count} strangers online`;
});

/* 💬 Send Message */
const chat = document.getElementById("chat-window");
const input = document.getElementById("msg-input");
let lastSent = 0;

function sendMessage() {
  const text = input.value.trim();
  if (!text || text.length > 300) return;
  const now = Date.now();
  if (now - lastSent < 1000) return;
  lastSent = now;

  push(messagesRef, { user: username, text, time: now });
  input.value = "";

  // Keep last 50 messages
  onValue(query(messagesRef, orderByChild("time")), snap => {
    const msgs = snap.val();
    if (!msgs) return;
    const keys = Object.keys(msgs);
    if (keys.length > 50) {
      remove(ref(db, "messages/" + keys[0]));
    }
  }, { onlyOnce: true });
}

document.getElementById("send-btn").onclick = sendMessage;
input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

/* 📡 Receive Messages */
const q = query(messagesRef, orderByChild("time"), limitToLast(50));
onChildAdded(q, snap => {
  const { user, text, time } = snap.val();
  const div = document.createElement("div");
  div.className = "msg " + (user === username ? "sent" : "received");
  div.textContent = `${user}: ${text}`;

  const small = document.createElement("small");
  small.textContent = new Date(time).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
  div.appendChild(small);

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

/* 😄 Emoji Picker */
const picker = picmo.createPicker({ rootElement: document.getElementById("picker-container") });
document.getElementById("emoji-btn").onclick = () => {
  const p = document.getElementById("picker-container");
  p.style.display = p.style.display === "block" ? "none" : "block";
};
picker.addEventListener("emoji:select", e => { input.value += e.emoji; });
