// --- Couleur selon température
function getColor(temp) {
  if (temp < 10) return "#00bfff";
  if (temp < 20) return "#f8cf5a ";
  if (temp < 30) return "#de701b ";
    if (temp < 40) return "#dc4f0d ";
  if (temp < 50) return "#e98138";
  return "#d54623";
}

// --- Initialisation Chart.js
const capteurCtx = document.getElementById("capteurChart").getContext("2d");
const capteurChart = new Chart(capteurCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Température (°C)",
      data: [],
      backgroundColor: [],
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "white", stepSize: 20 },
        title: { display: true, text: "Température (°C)", color: "white" }
      },
      x: {
        ticks: {
          color: "white",
          font: { size: 8 },
          autoSkip: true,
          maxRotation: 50,
          minRotation: 45,
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.startsWith('T') ? label.substring(1) : label;
          }
        },
        title: { display: true, text: "ID Capteur", color: "white" }
      }
    },
    plugins: {
      legend: { labels: { color: "white" } }
    }
  }
});

// --- Chargement des mesures
async function chargerDernieresMesures() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("loaderText").style.display = "inline";

  const capteursSnap = await firebase.firestore().collection("capteurs").get();
  const promises = capteursSnap.docs.map(doc => {
    const capteurId = doc.id;
    return firebase.firestore()
      .collection("capteurs")
      .doc(capteurId)
      .collection("mesure_capteur")
      .get()
      .then(mesuresSnap => {
        let derniereDate = null, derniereValeur = null;
        mesuresSnap.forEach(m => {
          if (!derniereDate || m.id > derniereDate) {
            derniereDate = m.id;
            derniereValeur = m.data().valeur;
          }
        });
        return { capteurId, derniereValeur };
      });
  });

  const results = await Promise.all(promises);
  const labels = [], valeurs = [], couleurs = [];

  for (const { capteurId, derniereValeur } of results) {
    if (derniereValeur !== null) {
      labels.push(capteurId);
      valeurs.push(derniereValeur);
      couleurs.push(getColor(derniereValeur));
    }
  }

  capteurChart.data.labels = labels;
  capteurChart.data.datasets[0].data = valeurs;
  capteurChart.data.datasets[0].backgroundColor = couleurs;
  capteurChart.update();

  document.getElementById("loader").style.display = "none";
  document.getElementById("loaderText").style.display = "none";
}

// --- Démarrage
chargerDernieresMesures();
setInterval(chargerDernieresMesures, 30000); // toutes les 30 sec
// Couleurs pour les 3 onduleurs
const onduleurColors = ["#ec9628", "#4caf50", "#00bcd4"];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Création du graphe de POA
const poaCtx = document.getElementById("poaChart").getContext("2d");
const poaChart = new Chart(poaCtx, {
  type: "doughnut",
  data: {
    labels: ["Onduleur 1", "Onduleur 2", "Onduleur 3"],
    datasets: [{
      label: "POA",
      data: [0, 0, 0],
      backgroundColor: onduleurColors,
      borderColor: "#222",
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: "white" }
      },
      title: {
        display: true,
        text: "POA des Onduleurs",
        color: "white"
      }
    }
  }
});

// Fonction de chargement du POA
async function chargerPOA() {
  const db = firebase.firestore();
  const poaValues = [0, 0, 0];

  for (let i = 1; i <= 3; i++) {
    const snap = await db.collection("onduleur").doc(i.toString()).collection("mesures").get();
    let lastDoc = null;
    snap.forEach(doc => {
      if (!lastDoc || doc.id > lastDoc.id) lastDoc = doc;
    });
    if (lastDoc && lastDoc.data().POA !== undefined) {
      poaValues[i - 1] = lastDoc.data().POA;
    }
  }

  poaChart.data.datasets[0].data = poaValues;
  poaChart.update();
}

// Appel initial + mise à jour toutes les 30s
chargerPOA();
setInterval(chargerPOA, 30000);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === Graphique Radar pour Freq ===
// === Nouveau graphique en ligne pour Freq ===
const freqCtx = document.getElementById("freqChart").getContext("2d");
const freqChart = new Chart(freqCtx, {
  type: "line",
  data: {
    labels: ["Onduleur 1", "Onduleur 2", "Onduleur 3"],
    datasets: [{
      label: "Fréquence (Hz)",
      data: [0, 0, 0],
      backgroundColor: "rgba(139, 92, 246, 0.2)",
      borderColor: "rgba(139, 92, 246, 1)",
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: "white",
      pointBorderColor: "#8b5cf6",
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: "white" }
      },
      title: {
        display: true,
        text: "Fréquence (Hz) par Onduleur",
        color: "white"
      }
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "#333" },
        title: {
          display: true,
          text: "Onduleurs",
          color: "white"
        }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "white" },
        grid: { color: "#444" },
        title: {
          display: true,
          text: "Hz",
          color: "white"
        }
      }
    }
  }
});

// === Charger Freq
async function chargerFreq() {
  const db = firebase.firestore();
  const freqs = [0, 0, 0];

  for (let i = 1; i <= 3; i++) {
    const snap = await db.collection("onduleur").doc(i.toString()).collection("mesures").get();
    let lastDoc = null;
    snap.forEach(doc => {
      if (!lastDoc || doc.id > lastDoc.id) lastDoc = doc;
    });
    if (lastDoc && lastDoc.data().Freq !== undefined) {
      freqs[i - 1] = lastDoc.data().Freq;
    }
  }

  freqChart.data.datasets[0].data = freqs;
  freqChart.update();
}

// Appel initial + auto-refresh
chargerFreq();
setInterval(chargerFreq, 30000);
///////////////////////////////////////////////////
// === Graphique horizontal pour I_DC_inv ===
const idcCtx = document.getElementById("idcInvChart").getContext("2d");
const idcInvChart = new Chart(idcCtx, {
  type: "bar",
  data: {
    labels: ["Onduleur 1", "Onduleur 2", "Onduleur 3"],
    datasets: [{
      label: "Courant DC (I_DC_inv en A)",
      data: [0, 0, 0],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      borderRadius: 8
    }]
  },
  options: {
    indexAxis: 'y', // <== barre horizontale
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: "white" }
      },
      title: {
        display: true,
        text: "Courant I_DC_inv (A) par Onduleur",
        color: "white"
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "white" },
        grid: { color: "#333" },
        title: {
          display: true,
          text: "Ampères (A)",
          color: "white"
        }
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "#444" }
      }
    }
  }
});

// === Charger I_DC_inv
async function chargerIDCinv() {
  const db = firebase.firestore();
  const idcValues = [0, 0, 0];

  for (let i = 1; i <= 3; i++) {
    const snap = await db.collection("onduleur").doc(i.toString()).collection("mesures").get();
    let lastDoc = null;
    snap.forEach(doc => {
      if (!lastDoc || doc.id > lastDoc.id) lastDoc = doc;
    });
    if (lastDoc && lastDoc.data().I_DC_inv !== undefined) {
      idcValues[i - 1] = lastDoc.data().I_DC_inv;
    }
  }

  idcInvChart.data.datasets[0].data = idcValues;
  idcInvChart.update();
}

// Appel initial + refresh
chargerIDCinv();
setInterval(chargerIDCinv, 30000);
/////////////////////////////////////////////////////////////////////////////////
// === Graphique en secteur polaire pour Troom_1 ===
const troomCtx = document.getElementById("troomChart").getContext("2d");
const troomChart = new Chart(troomCtx, {
  type: "line",  // 🔄 Changement ici : line au lieu de bar
  data: {
    labels: ["Onduleur 1", "Onduleur 2", "Onduleur 3"],
    datasets: [{
      label: "Troom_1 (°C)",
      data: [0, 0, 0],
      backgroundColor: "rgba(14, 165, 233, 0.2)",
      borderColor: "#38bdf8",
      pointBackgroundColor: ["#ec4899", "#f97316", "#06b6d4"],
      pointBorderColor: "#fff",
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "🌡️ Température interne Troom_1 (°C)",
        color: "white"
      },
      legend: {
        labels: { color: "white" }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Température (°C)", color: "white" },
        ticks: { color: "white" },
        grid: { color: "#333" }
      },
      x: {
        ticks: { color: "white" },
        grid: { color: "#444" }
      }
    }
  }
});


async function chargerTroom() {
  const db = firebase.firestore();
  const troomValues = [0, 0, 0];

  for (let i = 1; i <= 3; i++) {
    const snap = await db.collection("onduleur").doc(i.toString()).collection("mesures").get();
    let lastDoc = null;
    snap.forEach(doc => {
      if (!lastDoc || doc.id > lastDoc.id) lastDoc = doc;
    });
    if (lastDoc && lastDoc.data().Troom_1 !== undefined) {
      troomValues[i - 1] = lastDoc.data().Troom_1;
    }
  }

  troomChart.data.datasets[0].data = troomValues;
  troomChart.update();
}

chargerTroom();
setInterval(chargerTroom, 30000);
//////////////////////////////////////////////////
// === Graphique en bulles pour U_DC_inv ===
const udcCtx = document.getElementById("udcChart").getContext("2d");
const udcChart = new Chart(udcCtx, {
  type: "pie", // ✅ changement ici
  data: {
    labels: ["Onduleur 1", "Onduleur 2", "Onduleur 3"],
    datasets: [{
      label: "U_DC_inv",
      data: [0, 0, 0],
      backgroundColor: ["#60a5fa", "#34d399", "#f87171"],
      borderColor: ["#3b82f6", "#10b981", "#ef4444"],
      borderWidth: 2,
        hoverOffset: 20  // ✅ ajoute ceci pour effet au survol
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "🔌 U_DC_inv par Onduleur",
        color: "white",
        font: {
          size: 18
        }
      },
      legend: {
        labels: {
          color: "white",
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: context => `U_DC_inv: ${context.parsed} V`
        }
      }
    }
  }
});

// === Fonction pour charger U_DC_inv depuis Firebase ===
async function chargerUDC() {
  const db = firebase.firestore();
  const values = [0, 0, 0];

  for (let i = 1; i <= 3; i++) {
    const snap = await db.collection("onduleur").doc(i.toString()).collection("mesures").get();
    let lastDoc = null;
    snap.forEach(doc => {
      if (!lastDoc || doc.id > lastDoc.id) lastDoc = doc;
    });
    if (lastDoc && lastDoc.data().U_DC_inv !== undefined) {
      values[i - 1] = lastDoc.data().U_DC_inv;
    }
  }

  // ✅ Mise à jour du pie chart
  udcChart.data.datasets[0].data = values;
  udcChart.update();
}

// ✅ Lancer et mettre à jour régulièrement
chargerUDC();
setInterval(chargerUDC, 30000);


////////////////////////////////////////////////////////////
const historiqueCtx = document.getElementById("historiqueChart").getContext("2d");

const historiqueChart = new Chart(historiqueCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "🌡️ Température historique (°C)",
      data: [],
      borderColor: "#facc15",
      backgroundColor: "rgba(250, 204, 21, 0.2)",
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#ffffff",
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: true,
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    layout: { padding: 10 },
    plugins: {
      title: {
        display: true,
        text: "📈 Variation de la température du capteur sélectionné",
        color: "#ffffff",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        labels: {
          color: "#fefefe",
          font: { size: 14, weight: "bold" }
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#222",
        titleColor: "#facc15",
        bodyColor: "#fff",
        borderColor: "#facc15",
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        ticks: { color: "#dddddd", font: { size: 11, style: "italic" } },
        title: { display: true, text: "🕒 Heure", color: "#aaa", font: { size: 14, weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        beginAtZero: false,
        ticks: { color: "#dddddd", font: { size: 12 } },
        title: { display: true, text: "🌡️ Température (°C)", color: "#aaa", font: { size: 14, weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.06)" }
      }
    }
  }
});

// === Charger les capteurs dans le select
async function chargerListeCapteurs() {
  const select = document.getElementById("capteurSelect");
  const snap = await firebase.firestore().collection("capteurs").get();

  snap.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.id;
    select.appendChild(option);
  });
}

// === Quand un capteur est sélectionné → charger les dates uniques
async function onCapteurChange() {
  const capteurId = document.getElementById("capteurSelect").value;
  const dateSelect = document.getElementById("dateSelect");
  dateSelect.innerHTML = '<option disabled selected>Chargement...</option>';

  const snap = await firebase.firestore()
    .collection("capteurs")
    .doc(capteurId)
    .collection("mesure_capteur")
    .get();

  const datesSet = new Set();
  snap.forEach(doc => {
    const id = doc.id;
    const dateOnly = id.split(/[T\s]/)[0]; // ✅ supporte T ou espace
    datesSet.add(dateOnly);
  });

  const dates = Array.from(datesSet).sort();
  dateSelect.innerHTML = '<option disabled selected>-- Date --</option>';
  dates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });
}

// === Afficher les mesures pour la date sélectionnée
async function afficherHistoriqueCapteur() {
  const capteurId = document.getElementById("capteurSelect").value;
  const selectedDate = document.getElementById("dateSelect").value;
  if (!capteurId || !selectedDate) return;

  const snap = await firebase.firestore()
    .collection("capteurs")
    .doc(capteurId)
    .collection("mesure_capteur")
    .orderBy(firebase.firestore.FieldPath.documentId())
    .get();

  const heures = [], valeurs = [];
  snap.forEach(doc => {
    if (doc.id.startsWith(selectedDate)) {
      const heure = doc.id.split(/[T\s]/)[1]; // ✅ récupère HH:mm:ss
      heures.push(heure);
      valeurs.push(doc.data().valeur);
    }
  });

  if (valeurs.length === 0) {
    historiqueChart.data.labels = [];
    historiqueChart.data.datasets[0].data = [];
    historiqueChart.update();
    return;
  }

  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const range = max - min || 1;
  const rel = val => (val - min) / range;

  const gradient = historiqueCtx.createLinearGradient(0, 0, 0, 300);
  valeurs.forEach((val, idx) => {
    const ratio = rel(val);
    const color =
      ratio < 0.33 ? "#3b82f6" :
      ratio < 0.66 ? "#facc15" :
                     "#ef4444";
    gradient.addColorStop(idx / valeurs.length, color);
  });

  historiqueChart.data.labels = heures;
  historiqueChart.data.datasets[0].data = valeurs;
  historiqueChart.data.datasets[0].borderColor = gradient;
  historiqueChart.data.datasets[0].backgroundColor = "rgba(250, 204, 21, 0.1)";
  historiqueChart.update();
}

// === Initialisation
window.onload = () => {
  chargerListeCapteurs();
  setInterval(() => {
    afficherHistoriqueCapteur();
  }, 30000);
};
