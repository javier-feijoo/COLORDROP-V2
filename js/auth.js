// auth.js (login, registro, recuperación y sesión controlada con email y nick)

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

import { auth, db } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
  const authModal = document.getElementById("authModal");
  const title = document.getElementById("authTitle");
  const switchMode = document.getElementById("switchMode");
  const submitBtn = document.getElementById("btnSubmit");
  const closeBtn = document.getElementById("closeModal");
  const inputNick = document.getElementById("nick");
  const inputPass = document.getElementById("password");
  const inputEmail = document.getElementById("email");
  const resetLink = document.getElementById("resetPasswordLink");
  const btnReset = document.getElementById("btnResetPassword");
  const btnGuest = document.getElementById("btnGuest");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnLogoutSplash = document.getElementById("btnLogoutSplash");
  const userOptions = document.getElementById("userOptions");
  const authOptions = document.getElementById("authOptions");
  const nickDisplay = document.getElementById("nickDisplay");
  const btnToGame = document.getElementById("btnToGame");

  let mode = "login";

  switchMode?.addEventListener("click", () => {
    mode = (mode === "login") ? "register" : "login";
    title.textContent = mode === "login" ? "Iniciar sesión" : "Registrarse";
    submitBtn.textContent = mode === "login" ? "Entrar" : "Registrarse";
    switchMode.textContent = mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión";
    inputNick.classList.toggle("hidden", mode !== "register");
    inputEmail.classList.remove("hidden");
    resetLink.classList.toggle("hidden", mode !== "login");
  });

  btnLogin?.addEventListener("click", () => {
    authModal.classList.remove("hidden");
    mode = "login";
    inputNick.classList.add("hidden");
    inputEmail.classList.remove("hidden");
    resetLink.classList.remove("hidden");
  });

  btnRegister?.addEventListener("click", () => {
    authModal.classList.remove("hidden");
    mode = "register";
    inputNick.classList.remove("hidden");
    inputEmail.classList.remove("hidden");
    resetLink.classList.add("hidden");
  });

  closeBtn?.addEventListener("click", () => {
    authModal.classList.add("hidden");
  });

  btnGuest?.addEventListener("click", async () => {
    try {
      await signInAnonymously(auth);
      window.location.href = "game.html";
    } catch (err) {
      alert("Error con el modo invitado.");
      console.error("🔥 Guest error:", err);
    }
  });

  submitBtn?.addEventListener("click", async () => {
    const nick = inputNick.value.trim();
    const password = inputPass.value.trim();
    const email = inputEmail.value.trim();

    if (!email || !password || (mode === "register" && !nick)) {
      alert("Debes rellenar todos los campos obligatorios.");
      return;
    }

    if (mode === "register") {
      if (nick.toLowerCase() === "invitado") {
        alert("❌ No puedes usar 'invitado' como nombre de usuario.");
        return;
      }

      const nickRef = doc(db, "nicks", nick);
      const existing = await getDoc(nickRef);
      if (existing.exists()) {
        alert("Este nick ya está en uso.");
        return;
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(nickRef, { uid: cred.user.uid, email });
        await setDoc(doc(db, "usuarios", cred.user.uid), { nick, email });
        window.location.href = "game.html";
      } catch (err) {
        alert("Error al registrar: " + err.message);
        console.error("🔥 Register error:", err);
      }
    }

    if (mode === "login") {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "game.html";
      } catch (err) {
        alert("Error al iniciar sesión: " + err.message);
        console.error("🔥 Login error:", err);
      }
    }
  });

  btnReset?.addEventListener("click", async () => {
    const email = inputEmail.value.trim();
    if (!email) {
      alert("Introduce tu email para restablecer la contraseña.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Correo enviado para restablecer la contraseña.");
    } catch (err) {
      alert("No se pudo enviar el correo: " + err.message);
    }
  });

  btnLogoutSplash?.addEventListener("click", async () => {
    await signOut(auth);
    location.reload();
  });

  btnToGame?.addEventListener("click", () => {
    window.location.href = "game.html";
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authOptions?.classList.add("hidden");
      userOptions?.classList.remove("hidden");

      if (!user.isAnonymous) {
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (docSnap.exists()) {
          nickDisplay.textContent = docSnap.data().nick || "usuario";
        }
      } else {
        nickDisplay.textContent = "Invitado";
      }
    } else {
      userOptions?.classList.add("hidden");
      authOptions?.classList.remove("hidden");
    }
  });
});
