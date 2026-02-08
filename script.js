import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1️⃣ Replace with your Supabase info
const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2️⃣ DOM elements
const authSection = document.getElementById("auth");
const appSection = document.getElementById("app");

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");

const authStatusEl = document.getElementById("authStatus");
const whoEl = document.getElementById("who");

const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

// 3️⃣ Helper functions
function setAuthStatus(text) {
  authStatusEl.textContent = text;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function showApp(user) {
  authSection.style.display = "none";
  appSection.style.display = "block";
  whoEl.textContent = user.email ?? "(user)";
}

function showAuth() {
  authSection.style.display = "block";
  appSection.style.display = "none";
  whoEl.textContent = "";
}

// 4️⃣ Refresh user's messages
async function refreshMessages() {
  listEl.innerHTML = "";

  const { data, error } = await supabase
    .from("messages")
    .select("id, created_at, text")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    setStatus("Error loading messages: " + error.message);
    return;
  }

  for (const row of data) {
    const li = document.createElement("li");
    li.textContent = row.text;
    listEl.appendChild(li);
  }
}

// 5️⃣ Login handler
loginBtn.addEventListener("click", async () => {
  setAuthStatus("Logging in...");

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setAuthStatus("Login error: " + error.message);
    return;
  }

  setAuthStatus("");
  showApp(data.user);
  setStatus("Logged in ✅");
  refreshMessages();
});

// 6️⃣ Logout handler
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  setStatus("Logged out.");
  showAuth();
});

// 7️⃣ Insert message handler
sendBtn.addEventListener("click", async () => {
  const text = msgInput.value.trim();

  if (!text) {
    setStatus("Please enter a message.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setStatus("You must be logged in.");
    return;
  }

  setStatus("Saving...");

  const { error } = await supabase
    .from("messages")
    .insert([{ text, user_id: user.id }]);

  if (error) {
    console.error(error);
    setStatus("Error saving: " + error.message);
    return;
  }

  msgInput.value = "";
  setStatus("Saved ✅");
  refreshMessages();
});

// 8️⃣ Auto-login if session exists
(async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    showApp(session.user);
    setStatus("Logged in ✅");
    refreshMessages();
  } else {
    showAuth();
  }
})();