import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase-config.js";
import { ADMIN_EMAIL } from "./admin-session.js";

const auth = getAuth(app);
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const feedback = document.getElementById("show");

function show(message, isError = false) {
  feedback.textContent = message;
  feedback.classList.toggle("text-danger", isError);
  feedback.classList.toggle("text-success", !isError);
}

function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "An account already exists for this email. Please sign in.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a while and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "Email and password sign-in is not enabled in Firebase Authentication."
  };
  return messages[error.code] || "Authentication failed. Please try again.";
}

function isAllowedEmail(email) {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

const signInForm = document.getElementById("admin-signin-form");
signInForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const button = signInForm.querySelector('button[type="submit"]');

  if (!isAllowedEmail(email)) {
    show("This email is not authorized for admin access.", true);
    return;
  }

  button.disabled = true;
  show("Signing in...");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.replace("products.html");
  } catch (error) {
    console.error("Admin sign-in failed.", error);
    show(friendlyError(error), true);
    button.disabled = false;
  }
});

const signUpForm = document.getElementById("admin-signup-form");
signUpForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmation = document.getElementById("admin-password-confirm").value;
  const button = signUpForm.querySelector('button[type="submit"]');

  if (!isAllowedEmail(email)) {
    show("Only the authorized admin email can create an account.", true);
    return;
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/.test(password)) {
    show("Use 8 to 64 characters, including at least one letter and one number, with no spaces.", true);
    return;
  }
  if (password !== confirmation) {
    show("The passwords do not match.", true);
    return;
  }

  button.disabled = true;
  show("Creating your admin account...");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    show("Admin account created. You can now sign in.");
    signUpForm.reset();
  } catch (error) {
    console.error("Admin account setup failed.", error);
    show(friendlyError(error), true);
  } finally {
    button.disabled = false;
  }
});
