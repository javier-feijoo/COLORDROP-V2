// user-stats.js: calcula estadísticas del usuario actual

import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

/**
 * Recupera las estadísticas del usuario autenticado
 * @returns {Promise<Object>} resumen de partidas por nivel y resultado
 */
export async function getUserStats() {
  const user = auth.currentUser;
  if (!user) return null;

  const partidasRef = collection(db, `usuarios/${user.uid}/partidas`);
  const snapshot = await getDocs(partidasRef);

  const stats = {
    total: 0,
    ganadas: 0,
    perdidas: 0,
    abandonadas: 0,
    niveles: {
      facil: { total: 0, ganadas: 0, perdidas: 0, abandonadas: 0, ganadasList: [] },
      intermedio: { total: 0, ganadas: 0, perdidas: 0, abandonadas: 0, ganadasList: [] },
      avanzado: { total: 0, ganadas: 0, perdidas: 0, abandonadas: 0, ganadasList: [] }
    }
  };

  snapshot.forEach(doc => {
    const p = doc.data();
    const resultado = p.resultado;
    const nivel = p.nivel;
    stats.total++;

    if (resultado === "ganada") stats.ganadas++;
    else if (resultado === "perdida") stats.perdidas++;
    else if (resultado === "abandonada") stats.abandonadas++;

    const nivelStats = stats.niveles[nivel];
    if (nivelStats) {
      nivelStats.total++;
      if (resultado === "ganada") {
        nivelStats.ganadas++;
        nivelStats.ganadasList.push(p);
      } else if (resultado === "perdida") {
        nivelStats.perdidas++;
      } else if (resultado === "abandonada") {
        nivelStats.abandonadas++;
      }
    }
  });

  return stats;
}

/**
 * Muestra estadísticas dentro del modal #statsModal
 */
export async function showUserStats() {
  const modal = document.getElementById("statsModal");
  const content = document.getElementById("statsContent");

  const stats = await getUserStats();
  if (!stats) {
    content.innerHTML = `<p>No hay sesión activa.</p>`;
    modal.classList.remove("hidden");
    return;
  }

content.innerHTML = `
  <div class="nivel-titulo-p"> <span class="etiqueta">Total de partidas: ${stats.total}</span></div>
  <ul>
  <li>Ganadas: ${stats.ganadas}</li>
  <li>Perdidas: ${stats.perdidas}</li>
  <li>Abandonadas: ${stats.abandonadas}</li>
  </ul>
  
  ${Object.entries(stats.niveles).map(([nivel, data]) => {
    const mejores = data.ganadasList.sort((a, b) => a.movimientos - b.movimientos || a.tiempo - b.tiempo)[0];

    return `
      <div class="nivel">
        <div class="nivel-titulo"><strong>${nivel.toUpperCase()}:</strong></div>
        <ul>
          <li>Total: ${data.total}</li>
          <li>Ganadas: ${data.ganadas}</li>
          <li>Perdidas: ${data.perdidas}</li>
          <li>Abandonadas: ${data.abandonadas}</li>
          <li class="mejor">🏅 Mejor: ${mejores ? `${mejores.movimientos} movs / ${mejores.tiempo}s` : 'N/A'}</li>
        </ul>
      </div>
    `;
  }).join("")}
`;


  modal.classList.remove("hidden");
}

// Vincula botón de cerrar
document.getElementById("closeStats")?.addEventListener("click", () => {
  document.getElementById("statsModal").classList.add("hidden");
});
