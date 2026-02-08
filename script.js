import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const statusEl = document.getElementById("status");

sendBtn.addEventListener("click", async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  statusEl.textContent = "Saving...";

  const { error } = await supabase
    .from("messages")
    .insert([{ text }]);

  if (error) {
    console.error(error);
    statusEl.textContent = "Error: " + error.message;
    return;
  }

  msgInput.value = "";
  statusEl.textContent = "Saved ✅";
});
