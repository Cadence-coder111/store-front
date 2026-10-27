import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase-config.js";

export const ADMIN_EMAIL = "adminEnd@gmail.com";
const auth = getAuth(app);

function currentUser() {
  return new Promise((resolve, reject) => {
    let unsubscribe;
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (unsubscribe) unsubscribe();
      callback(value);
    };
    unsubscribe = onAuthStateChanged(auth,
      user => finish(resolve, user),
      error => finish(reject, error));
    if (settled) unsubscribe();
  });
}

export async function requireAdmin() {
  const user = await currentUser();
  const isAllowed = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.emailVerified;

  if (!isAllowed) {
    if (user) await signOut(auth);
    window.location.replace("signIn.html");
    throw new Error("A verified administrator account is required.");
  }

  const profile = document.getElementById("admin-profile");
  if (profile) profile.textContent = user.displayName || user.email;

  const logout = document.getElementById("admin-signout");
  logout?.addEventListener("click", async () => {
    logout.disabled = true;
    try {
      await signOut(auth);
      window.location.replace("signIn.html");
    } catch (error) {
      console.error("Could not sign out administrator.", error);
      logout.disabled = false;
    }
  });

  return user;
}
