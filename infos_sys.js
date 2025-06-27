document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  // Expose les fonctions globalement
  window.infosChercher = async function (collect, inputId, outputId) {
    const id = document.getElementById(inputId).value.trim();
    const resultDiv = document.getElementById(outputId);

    if (!id) {
      resultDiv.innerHTML = "<p style='color:orange;'>⚠️ Veuillez entrer un ID.</p>";
      return;
    }

    try {
      const doc = await db.collection(collect).doc(id).get();
      if (!doc.exists) {
        resultDiv.innerHTML = `<p style='color:red;'>❌ Aucun ${collect} trouvé avec l'ID <strong>${id}</strong>.</p>`;
      } else {
        const data = doc.data();
       const rows = Object.entries(data).map(
  ([key, val]) => `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-2 border-r font-medium text-gray-700">${key}</td>
      <td class="px-4 py-2">${val}</td>
    </tr>
  `
).join("");

       resultDiv.innerHTML = `
  <div class="overflow-x-auto rounded-md shadow-md mt-4">
    <table class="min-w-full text-sm text-left text-gray-800 border border-gray-300 bg-white">
      <thead class="bg-gray-100 border-b border-gray-300 text-gray-900 font-semibold">
        <tr>
          <th class="px-4 py-2 border-r">Champ</th>
          <th class="px-4 py-2">Valeur</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        ${rows}
      </tbody>
    </table>
  </div>
`;

        resultDiv.classList.remove("infos-hidden");
      }
    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = "<p style='color:red;'>❌ Erreur lors de la récupération des données.</p>";
    }
  };

  window.infosToggle = function (id) {
    const div = document.getElementById(id);
    div.classList.toggle("infos-hidden");
  };
});
