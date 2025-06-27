let lastClickPos = { x: 0, y: 0 };
let timeoutInfoBox;
let lastHighlightedMesh = null;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔧 Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC9SSxRrZuBGohylOc8A2m1SmIlCXac_yQ",
  authDomain: "solar2025-b04b6.firebaseapp.com",
  projectId: "solar2025-b04b6",
  storageBucket: "solar2025-b04b6.firebasestorage.app",
  messagingSenderId: "534281457072",
  appId: "1:534281457072:web:a910c154b0b62cda0a9a75",
  measurementId: "G-N6M6Q1ME0Y"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎯 Éléments UI
const capInfoBox = document.getElementById("cap-infoBox");

let selectedMesh = null;
let isManualMove = false;

// 🔢 Nettoyer le nom du mesh
function cleanId(name) {
  return name.replace(/_primitive\d+$/, "");
}

// 🎯 Réagir au clic sur un objet 3D
scene.onPointerDown = async (evt, pickResult) => {
  if (!pickResult.hit || !pickResult.pickedMesh) return;

  const mesh = pickResult.pickedMesh;
  selectedMesh = mesh;
  const id = cleanId(mesh.name.trim());

  const canvasRect = canvas.getBoundingClientRect();
  const x = evt.clientX - canvasRect.left + 10;
  const y = evt.clientY - canvasRect.top + 10;


  // 🔍 Si c’est un panneau
  const panneauRef = doc(db, "panneaux_solaire", id);
  const panneauSnap = await getDoc(panneauRef);

  if (panneauSnap.exists() && panneauSnap.data().capteur_temperature) {
    const capteurId = panneauSnap.data().capteur_temperature;

  

    onSnapshot(collection(db, "capteurs", capteurId, "mesure_capteur"), (snapshot) => {
      const capMesuresMap = {};
      const capSortedDates = [];
      snapshot.forEach(doc => {
        capMesuresMap[doc.id] = doc.data();
        capSortedDates.push(doc.id);
      });

      const temp = capMesuresMap[capSortedDates.at(-1)]?.valeur ?? "?";

      capInfoBox.innerHTML = `
        <strong>Panneau :</strong> ${id}<br>
        <strong>ID Capteur :</strong> ${capteurId}<br>
        <strong>Température :</strong> ${temp} °C
      `;
      capInfoBox.style.left = `${x}px`;
      capInfoBox.style.top = `${y}px`;
      capInfoBox.style.display = "block";

      clearTimeout(timeoutInfoBox);
      timeoutInfoBox = setTimeout(() => {
        capInfoBox.style.display = "none";
      }, 5000);
    });

    return;
  }

  // 🔁 Sinon : onduleur → couleur noire
  onSnapshot(collection(db, "onduleur", id, "mesures"), (snapshot) => {
    const mesures = [];
    snapshot.forEach(doc => mesures.push({ id: doc.id, ...doc.data() }));
    mesures.sort((a, b) => a.id.localeCompare(b.id));
    const last = mesures.at(-1);
    if (!last) return;

    

    const puissance = parseFloat(last.P_DC_inv) || 0;
    const etat = puissance > 3000 ? "Bon" : puissance > 1000 ? "Moyen" : "Faible";

    capInfoBox.innerHTML = `
      <strong>Onduleur :</strong> ${id}<br>
      <strong>État :</strong> ${etat}<br>
      <strong>P_DC_inv :</strong> ${puissance.toFixed(2)} W
    `;
    capInfoBox.style.left = `${x}px`;
    capInfoBox.style.top = `${y}px`;
    capInfoBox.style.display = "block";

    clearTimeout(timeoutInfoBox);
    timeoutInfoBox = setTimeout(() => {
      capInfoBox.style.display = "none";
    }, 5000);
  });
};
