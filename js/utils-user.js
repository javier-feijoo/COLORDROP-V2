import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';




/**
 * Obtiene el nick del usuario autenticado desde Firestore.
 * @returns {Promise<string|null>} El nick o null si no se encuentra
 */
export async function getCurrentUserNick() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const nicksRef = collection(db, "nicks");
    const q = query(nicksRef, where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const nickDoc = snapshot.docs[0];
      return nickDoc.id;
    }
  } catch (err) {
    console.error("❌ Error al buscar el nick del usuario:", err);
  }

  return null;
}

