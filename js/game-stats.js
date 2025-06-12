// game-stats.js: guarda los resultados de partidas en Firestore

import { db, auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

/**
 * Guarda una partida jugada por el usuario actual.
 * @param {Object} params
 * @param {string} params.nivel - Nivel jugado (facil, intermedio, avanzado)
 * @param {"ganada"|"perdida"|"abandonada"} params.resultado
 * @param {number} params.movimientos - Total de movimientos usados
 * @param {number} params.tiempo - Tiempo total en segundos
 */
export async function saveGameResult({ nivel, resultado, movimientos, tiempo }) {
  const user = auth.currentUser;
  if (!user) return;

  let nick = "invitado";

  if (!user.isAnonymous) {
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      nick = userDoc.data().nick || "usuario";
    }
  }

  const partida = {
    nivel,
    resultado,
    movimientos,
    tiempo,
    timestamp: serverTimestamp(),
    uid: user.uid,
    email: user.email || null,
    nick
  };

  try {
    await addDoc(collection(db, `usuarios/${user.uid}/partidas`), partida);
    console.log("✔ Partida guardada con nick:", nick);
  } catch (err) {
    console.error("❌ Error al guardar partida:", err);
  }
}
