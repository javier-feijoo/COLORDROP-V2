// game.js principal (modularizado)
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';
import { initGame, startGame, restartGame, abandonGameAndGoToMenu } from './game-core.js';
import { setupFooterBar } from './ui-footer.js';
import { resetHelpModal, showHelp, closeHelp } from './ui-help.js';

import { getCurrentUserNick } from './utils-user.js';
import { showUserStats } from './user-stats.js';
import { showRankingModal } from './ranking.js';


// Verificar sesión
onAuthStateChanged(auth, async (user) => {
  const userNameEl = document.getElementById("userName");
  if (user) {
    const nick = await getCurrentUserNick();
    userNameEl.textContent = nick || "Invitado";
  } else {
    window.location.href = "index.html";
  }
});

document.getElementById("btnRetry")?.addEventListener("click", () => {
  restartGame(); // guarda como abandonada
});

document.getElementById("btnMenu")?.addEventListener("click", () => {
  abandonGameAndGoToMenu(); // guarda como abandonada y vuelve al menú
});
document.getElementById("btnStart").addEventListener("click", startGame);

document.getElementById("animationSpeed").addEventListener("input", e => {
  const animationSpeed = parseInt(e.target.value);
  const label = document.getElementById("speedLabel");
  const levels = ["Desactivada", "Muy lenta", "Lenta", "Media", "Rápida", "Muy rápida"];
  label.textContent = levels[animationSpeed] || "Media";
});
 
document.getElementById("closeHelp").addEventListener("click", closeHelp); //boton cerrar del modal
document.getElementById("closeStats")?.addEventListener("click", () => {
  document.getElementById("statsModal").classList.add("hidden");
});




// Barra inferior: listeners
setupFooterBar({
  onHelp: showHelp,
  onLogout: () => {
    signOut(auth).then(() => window.location.href = "index.html");
  },
  onRanking: showRankingModal,
  onStats: showUserStats
});

// Iniciar juego
initGame();
