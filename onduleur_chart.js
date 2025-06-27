// First chart (P_DC_inv)
const ctx = document.getElementById("combinedChart").getContext("2d");
const combinedChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: "Onduleur 1", data: [], borderColor: "blue", backgroundColor: "rgba(0,0,255,0.1)", tension: 0, fill: true },
      { label: "Onduleur 2", data: [], borderColor: "red", backgroundColor: "rgba(255,0,0,0.1)", tension: 0, fill: true },
      { label: "Onduleur 3", data: [], borderColor: "green", backgroundColor: "rgba(0,255,0,0.1)", tension: 0, fill: true }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white', font: { size: 6 } }
      },
      tooltip: {
        callbacks: { label: ctx => `${ctx.dataset.label} : ${ctx.formattedValue} W` },
        bodyFont: { size: 5 }
      }
    },
    scales: {
      x: {
        title: { display: true, text: "Heure", color: "white", font: { size: 6 } },
        ticks: {
          color: "white", font: { size: 5 },
          callback: (val) => {
            const label = combinedChart.data.labels[val];
            return label?.split(" ")[1] || label;
          },
          maxTicksLimit: 8
        }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "P_DC_inv (W)", color: "white", font: { size: 6 } },
        ticks: { color: "white", font: { size: 5 } }
      }
    }
  }
});

// Second chart (P_AC_inv)
const ctx2 = document.getElementById("combinedChart2").getContext("2d");
const combinedChart2 = new Chart(ctx2, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: "Onduleur 1", data: [], borderColor: "blue", backgroundColor: "rgba(0,0,255,0.1)", tension: 0, fill: true },
      { label: "Onduleur 2", data: [], borderColor: "red", backgroundColor: "rgba(255,0,0,0.1)", tension: 0, fill: true },
      { label: "Onduleur 3", data: [], borderColor: "green", backgroundColor: "rgba(0,255,0,0.1)", tension: 0, fill: true }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white', font: { size: 6 } }
      },
      tooltip: {
        callbacks: { label: ctx => `${ctx.dataset.label} : ${ctx.formattedValue} W` },
        bodyFont: { size: 5 }
      }
    },
    scales: {
      x: {
        title: { display: true, text: "Heure", color: "white", font: { size: 6 } },
        ticks: {
          color: "white", font: { size: 5 },
          callback: (val) => {
            const label = combinedChart2.data.labels[val];
            return label?.split(" ")[1] || label;
          },
          maxTicksLimit: 8
        }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "P_AC_inv (W)", color: "white", font: { size: 6 } },
        ticks: { color: "white", font: { size: 5 } }
      }
    }
  }
});

// Function to update date labels for both charts
function updateDateLabels(displayLabels) {
  const globalDateLabel1 = document.getElementById("globalDateLabel");
  const globalDateLabel2 = document.getElementById("globalDateLabel2");

  const date = displayLabels[0]?.split(" ")[0] || "";
  globalDateLabel1.textContent = `Date: ${date}`;
  globalDateLabel2.textContent = `Date: ${date}`;
}

const entriesMap = { 1: [], 2: [], 3: [] };
const entriesMap2 = { 1: [], 2: [], 3: [] };

// Date selectors
const startDateSelect = document.getElementById("startDate");
const endDateSelect = document.getElementById("endDate");
const startDateSelect2 = document.getElementById("startDate2");
const endDateSelect2 = document.getElementById("endDate2");

// Function to update date selectors
function updateDateSelectors(allDates) {
  [startDateSelect, endDateSelect, startDateSelect2, endDateSelect2].forEach(sel => {
    sel.innerHTML = "";
    allDates.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      sel.appendChild(opt);
    });
  });
  endDateSelect.selectedIndex = allDates.length - 1;
  endDateSelect2.selectedIndex = allDates.length - 1;
}

// Listen to Onduleur data for first chart (P_DC_inv)
function listenToOnduleur(id) {
  db.collection("onduleur").doc(id.toString()).collection("mesures")
    .onSnapshot(snapshot => {
      const entries = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.P_DC_inv !== undefined) entries.push({ id: doc.id, val: d.P_DC_inv });
      });
      entries.sort((a, b) => a.id.localeCompare(b.id));
      entriesMap[id] = entries;

      const allLabels = new Set(Object.values(entriesMap).flat().map(e => e.id));
      const sorted = Array.from(allLabels).sort();

      const currentEnd = endDateSelect.value;
      const newEnd = sorted.at(-1);
      if (!endDateSelect.options.length || newEnd !== currentEnd) {
        updateDateSelectors(sorted);
        endDateSelect.value = newEnd;
      }

      updateChartView();
    });
}

// Listen to Onduleur2 data for second chart (P_AC_inv)
function listenToOnduleur2(id) {
  db.collection("onduleur").doc(id.toString()).collection("mesures")
    .onSnapshot(snapshot => {
      const entries = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.P_AC_inv !== undefined) entries.push({ id: doc.id, val: d.P_AC_inv });
      });
      entries.sort((a, b) => a.id.localeCompare(b.id));
      entriesMap2[id] = entries;

      const allLabels = new Set(Object.values(entriesMap2).flat().map(e => e.id));
      const sorted = Array.from(allLabels).sort();

      const currentEnd = endDateSelect2.value;
      const newEnd = sorted.at(-1);
      if (!endDateSelect2.options.length || newEnd !== currentEnd) {
        updateDateSelectors(sorted);
        endDateSelect2.value = newEnd;
      }

      updateChartView2();
    });
}

// Update Chart View for first chart (P_DC_inv)
function updateChartView() {
  const allLabels = new Set(Object.values(entriesMap).flat().map(e => e.id));
  const sortedLabels = Array.from(allLabels).sort();
  const startIdx = sortedLabels.indexOf(startDateSelect.value);
  const endIdx = sortedLabels.indexOf(endDateSelect.value);
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return;

  const displayLabels = sortedLabels.slice(startIdx, endIdx + 1);
  combinedChart.data.labels = displayLabels;
  updateDateLabels(displayLabels);

  [1, 2, 3].forEach((id, idx) => {
    const dict = {};
    entriesMap[id].forEach(e => dict[e.id] = e.val);
    combinedChart.data.datasets[idx].data = displayLabels.map(l => dict[l] ?? null);
  });
  combinedChart.update();
}

// Update Chart View for second chart (P_AC_inv)
function updateChartView2() {
  const allLabels = new Set(Object.values(entriesMap2).flat().map(e => e.id));
  const sortedLabels = Array.from(allLabels).sort();
  const startIdx = sortedLabels.indexOf(startDateSelect2.value);
  const endIdx = sortedLabels.indexOf(endDateSelect2.value);
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return;

  const displayLabels = sortedLabels.slice(startIdx, endIdx + 1);
  combinedChart2.data.labels = displayLabels;
  updateDateLabels(displayLabels);

  [1, 2, 3].forEach((id, idx) => {
    const dict = {};
    entriesMap2[id].forEach(e => dict[e.id] = e.val);
    combinedChart2.data.datasets[idx].data = displayLabels.map(l => dict[l] ?? null);
  });
  combinedChart2.update();
}

// Event listeners for changing date range
startDateSelect.addEventListener("change", updateChartView);
endDateSelect.addEventListener("change", updateChartView);
startDateSelect2.addEventListener("change", updateChartView2);
endDateSelect2.addEventListener("change", updateChartView2);

// Listen to data updates for the first chart (P_DC_inv)
listenToOnduleur(1);
listenToOnduleur(2);
listenToOnduleur(3);

// Listen to data updates for the second chart (P_AC_inv)
listenToOnduleur2(1);
listenToOnduleur2(2);
listenToOnduleur2(3);
