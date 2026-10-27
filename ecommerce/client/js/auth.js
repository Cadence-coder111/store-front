
import "./firebase.js"; // starts Firebase with your project settings
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(getApp());
const keep = user => localStorage.setItem("gb_user", JSON.stringify({ uid: user.uid, name: user.displayName || "", email: user.email || "", photo: user.photoURL || "" }));


window.gbAuth = {
  async signUp(first, last, email, pass) {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(user, { displayName: first + " " + last }).catch(() => { });
    keep(user);
    return user;
  },
  async signIn(email, pass) {
    const { user } = await signInWithEmailAndPassword(auth, email, pass);
    keep(user);
    return user;
  }
};

const btn = document.getElementById("google-btn");
const show = m => { const el = document.getElementById("show"); if (el) el.textContent = m; };

const problems = {
  "auth/popup-closed-by-user": "Google sign-in was closed before it finished. Please try again.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled. Please try again.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  "auth/network-request-failed": "No internet connection. Please check it and try again.",
  "auth/operation-not-allowed": "Google sign-in is not turned on yet in Firebase (Authentication > Sign-in method > Google).",
  "auth/unauthorized-domain": "This web address is not allowed yet. In Firebase go to Authentication > Settings > Authorized domains and add it (for Live Server add 127.0.0.1)."
};

btn?.addEventListener("click", async () => {
  btn.disabled = true; show("");
  try {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    keep(user);
    show("Signed in as " + (user.displayName || user.email) + ". Redirecting...");
    setTimeout(() => { location.href = "index.html"; }, 1000);
  } catch (err) {
    console.error(err);
    show(problems[err.code] || "Could not sign in with Google: " + (err.message || err.code));
    btn.disabled = false;
  }
});
