// histo.js
async function chargerHistoriqueCapteur() {
  const id = document.getElementById('capteurID').value.trim();
  const container = document.getElementById('resultCapteurHistory');
  container.innerHTML = '';

  if (!id) return container.innerHTML = "<p style='color:orange;'>Veuillez entrer un ID valide.</p>";

  try {
    const snap = await firebase.firestore().collection("capteurs").doc(id).collection("mesure_capteur")
      .orderBy(firebase.firestore.FieldPath.documentId()).get();

    if (snap.empty) {
      container.innerHTML = "<p style='color:red;'>Aucune mesure trouvée.</p>";
      return;
    }

    let table = `<table><thead><tr><th>Horodatage</th><th>Valeur</th></tr></thead><tbody>`;
    snap.forEach(doc => {
      const { valeur } = doc.data();
      table += `<tr><td>${doc.id}</td><td>${valeur}</td></tr>`;
    });
    table += `</tbody></table>`;
    container.innerHTML = table;
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Erreur de chargement.</p>";
  }
}

async function chargerHistoriqueOnduleur() {
  const id = document.getElementById('onduleurID').value.trim();
  const container = document.getElementById('resultOnduleurHistory');
  container.innerHTML = '';

  if (!id) return container.innerHTML = "<p style='color:orange;'>Veuillez entrer un ID valide.</p>";

  try {
    const snap = await firebase.firestore().collection("onduleur").doc(id).collection("mesures")
      .orderBy(firebase.firestore.FieldPath.documentId()).get();

    if (snap.empty) {
      container.innerHTML = "<p style='color:red;'>Aucune mesure trouvée.</p>";
      return;
    }

    const allKeys = new Set();
    const data = [];

    snap.forEach(doc => {
      const entry = doc.data();
      entry.__id = doc.id;
      Object.keys(entry).forEach(k => allKeys.add(k));
      data.push(entry);
    });

    const headers = Array.from(allKeys).filter(k => k !== '__id');
    let table = `<table><thead><tr><th>Horodatage</th>${headers.map(k => `<th>${k}</th>`).join('')}</tr></thead><tbody>`;
    data.forEach(row => {
      table += `<tr><td>${row.__id}</td>${headers.map(k => `<td>${row[k] ?? '-'}</td>`).join('')}</tr>`;
    });
    table += `</tbody></table>`;
    container.innerHTML = table;

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Erreur de chargement.</p>";
  }
}

function toggleVisibility(id) {
  const el = document.getElementById(id);
  el.classList.toggle('histo-hidden');
}

function exporterEnDocument(containerId) {
  const table = document.getElementById(containerId).querySelector("table");
  if (!table) {
    alert("Aucune table trouvée à exporter.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, "Historique");
  XLSX.writeFile(wb, "historique.xlsx");
}
