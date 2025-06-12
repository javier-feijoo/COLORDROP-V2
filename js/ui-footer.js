// ui-footer.js: controla la barra inferior de la app durante el juego

export function setupFooterBar({ onHelp, onLogout, onRanking, onStats }) {
  const helpBtn = document.getElementById("btnHelp");
  const logoutBtn = document.getElementById("btnLogout");
  const rankingBtn = document.getElementById("btnRanking");
  const statsBtn = document.getElementById("btnStats");

  if (helpBtn && typeof onHelp === "function") {
    helpBtn.addEventListener("click", onHelp);
  }
  if (logoutBtn && typeof onLogout === "function") {
    logoutBtn.addEventListener("click", onLogout);
  }
  if (rankingBtn && typeof onRanking === "function") {
    rankingBtn.addEventListener("click", onRanking);
  }
  if (statsBtn && typeof onStats === "function") {
    statsBtn.addEventListener("click", onStats);
  }
}
// Este módulo asume que los botones tienen los siguientes IDs:
// - btnHelp
// - btnLogout
// - btnRanking
