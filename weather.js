async function afficherDerniereMeteo() {
  const meteoRef = db.collection("weather");
  const snapshot = await meteoRef.get();
  let derniere = null;
  snapshot.forEach(doc => {
    if (!derniere || doc.id > derniere.id) {
      derniere = { id: doc.id, data: doc.data() };
    }
  });

  const box = document.getElementById("infoBox");
  if (derniere) {
    const d = derniere.data;
    box.innerHTML = `
      <span title="Date de mesure">📅 ${d.datetime}</span>
      <span title="Température (°C)">🌡️ ${d.temp_C} °C</span>
      <span title="Humidité (%)">💧 ${d.humidity} %</span>
      <span title="Vitesse du vent (m/s)">🌬️ ${d.wind_speed} m/s</span>
      <span title="Nébulosité (%)">☁️ ${d.clouds_percent} %</span>
      <span title="Pression (hPa)">📈 ${d.pressure} hPa</span>`;
  } else {
    box.innerText = "Aucune donnée météo.";
  }
}

// Récupération des données météo toutes les 30 secondes
afficherDerniereMeteo();
setInterval(afficherDerniereMeteo, 30000);
