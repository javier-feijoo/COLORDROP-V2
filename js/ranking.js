// ranking.js – muestra ranking global por niveles con pestañasimport { db } from './firebase-config.js';
import {
  collectionGroup,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

const rankingModal = document.getElementById("rankingModal");
const rankingContent = document.getElementById("rankingContent");
const closeRanking = document.getElementById("closeRanking");
const tabButtons = document.querySelectorAll(".tab-btn");

// Cargar y renderizar ranking por nivel
tabButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const nivel = btn.dataset.nivel;
    rankingContent.innerHTML = "<p>Cargando...</p>";

    const data = await getRankingForLevel(nivel);
    rankingContent.innerHTML = renderTable(data, nivel);
  });
});

closeRanking.addEventListener("click", () => {
  rankingModal.classList.add("hidden");
});

export async function showRankingModal() {
  rankingModal.classList.remove("hidden");
  tabButtons[0].click(); // Mostrar por defecto "facil"
}

async function getRankingForLevel(nivel) {
  const partidasQuery = query(
    collectionGroup(db, "partidas"),
    where("nivel", "==", nivel),
    where("resultado", "==", "ganada")
  );

  const snapshot = await getDocs(partidasQuery);

  const partidas = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.nick && data.nick.toLowerCase() !== "invitado") {
      partidas.push({
        nick: data.nick,
        movimientos: data.movimientos,
        tiempo: data.tiempo
      });
    }
  });

  partidas.sort((a, b) => a.movimientos - b.movimientos || a.tiempo - b.tiempo);

  return partidas.slice(0, 10);
}

function renderTable(rows, nivel) {
  if (rows.length === 0) return `<p>No hay partidas registradas para nivel ${nivel}</p>`;

  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nick</th>
          <th>Movs</th>
          <th>Tiempo</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.nick}</td>
            <td>${p.movimientos}</td>
            <td>${formatTime(p.tiempo)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}