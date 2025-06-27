document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("meteoMsgBtn");
  const toast = document.getElementById("toastMeteo");

  if (!btn || !toast) return;

  btn.addEventListener("click", async () => {
    toast.innerText = "Chargement des données météo...";
    toast.style.display = "block";

    try {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=34.02&longitude=-6.84&hourly=direct_radiation,cloudcover,precipitation&timezone=Africa%2FCasablanca");
      const data = await res.json();

      const times = data.hourly.time;
      const radiation = data.hourly.direct_radiation;
      const clouds = data.hourly.cloudcover;
      const rain = data.hourly.precipitation;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoTomorrow = tomorrow.toISOString().slice(0, 10);
      const dateFR = tomorrow.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

      let rad = [], cld = [], rn = [];
      for (let i = 0; i < times.length; i++) {
        if (times[i].startsWith(isoTomorrow)) {
          rad.push(radiation[i]);
          cld.push(clouds[i]);
          rn.push(rain[i]);
        }
      }

      const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
      const radMean = mean(rad);
      const cloudMean = mean(cld);
      const rainSum = rn.reduce((a, b) => a + b, 0);

      let msg = `Demain le ${dateFR} à Rabat : 🌧️ Ciel couvert ou pluie. Faible production attendue.`;
      if (radMean > 600 && cloudMean < 30 && rainSum < 1) {
        msg = `Demain le ${dateFR} à Rabat : ☀️ Journée ensoleillée. Bonne production attendue.`;
      } else if (radMean > 400 && cloudMean < 60 && rainSum < 2) {
        msg = `Demain le ${dateFR} à Rabat : 🌤️ Ensoleillement modéré. Production moyenne attendue.`;
      }

      toast.innerText = msg;
    } catch (err) {
      toast.innerText = "❌ Erreur de chargement météo.";
      console.error(err);
    }

    setTimeout(() => {
      toast.style.display = "none";
    }, 10000);
  });
});
