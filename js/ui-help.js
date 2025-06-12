// ui-help.js: controla el modal de ayuda del juego


export function resetHelpModal() {
  const modal = document.getElementById("helpModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.add("hidden");
  }
}

export function showHelp() {
  const modal = document.getElementById("helpModal");
  if (modal) modal.style.display = "flex";
}

export function closeHelp() {
  const modal = document.getElementById("helpModal");
  if (modal) modal.style.display = "none";
}

// Asegúrate de tener un botón o enlace con id="closeHelp" en tu HTML
// para cerrar el modal. Puedes enlazarlo así desde game.js si lo deseas:
// document.getElementById("closeHelp").addEventListener("click", closeHelp);
