import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://wmieslnlfrrwqvxhbdtn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_l3Ha-qsAhqnK1QDeHaUYvw_ULYoCyAb";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authSection = document.getElementById("auth");
const appSection = document.getElementById("app");

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");

const authStatusEl = document.getElementById("authStatus");
const whoEl = document.getElementById("who");

const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");

const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

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

async function refreshMessages() {
  listEl.innerHTML = "";

  const { data, error } = await supabase
    .from("messages")
    .select("id, created_at, text")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    setStatus("Load error: " + error.message);
    return;
  }

  for (const row of data) {
    const li = document.createElement("li");
    li.textContent = row.text;
    listEl.appendChild(li);
  }
}

signupBtn.addEventListener("click", async () => {
  setAuthStatus("Signing up...");

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    setAuthStatus("Sign up error: " + error.message);
    return;
  }

  setAuthStatus("Signed up. Now log in.");
});

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

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  setStatus("Logged out.");
  showAuth();
});

sendBtn.addEventListener("click", async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setStatus("Not logged in.");
    return;
  }

  setStatus("Saving...");

  const { error } = await supabase
    .from("messages")
    .insert([{ text, user_id: user.id }]);

  if (error) {
    console.error(error);
    setStatus("Insert error: " + error.message);
    return;
  }

  msgInput.value = "";
  setStatus("Saved ✅");
  refreshMessages();
});

(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    showApp(session.user);
    refreshMessages();
  } else {
    showAuth();
  }
})();