import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Null when env vars are missing so the form can fail loudly in dev
// instead of crashing the whole page at import time.
export const supabase = url && key ? createClient(url, key) : null;

// The sign-in link in the owner's email lands on the home page when this
// address is not on Supabase's redirect list. Admin.jsx sets this flag when it
// sends the link, so once the session exists we carry on to the panel.
if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event !== "SIGNED_IN" || window.location.pathname.replace(/\/+$/, "") === "/admin") return;
    try {
      if (localStorage.getItem("adminLogin")) {
        localStorage.removeItem("adminLogin");
        window.location.replace("/admin");
      }
    } catch {
      /* storage blocked: stay where we are */
    }
  });
}
