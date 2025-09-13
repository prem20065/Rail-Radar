const API_URL = "http://127.0.0.1:5000/api/data";
const SUMMARY_URL = "http://127.0.0.1:5000/api/summary";
const tbody = document.querySelector("tbody");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const updatedTime = document.getElementById("updatedTime");

// Summary cards
const totalDelaysValue = document.getElementById("totalDelaysValue");
const avgDelayValue = document.getElementById("avgDelayValue");
const affectedTrainsValue = document.getElementById("affectedTrainsValue");
const affectedStationsValue = document.getElementById("affectedStationsValue");

// Filters
const trainNameFilter = document.getElementById("trainNameFilter");
const delayReasonFilter = document.getElementById("delayReasonFilter");
const stationFilter = document.getElementById("stationFilter");
const applyFilters = document.getElementById("applyFilters");
const clearFilters = document.getElementById("clearFilters");

// Charts
let reasonChart, trendChart;

let trainData = [];
let filteredData = [];

function updateSummary() {
  fetch(SUMMARY_URL)
    .then(res => res.json())
    .then(data => {
      totalDelaysValue.textContent = data.total_delays;
      avgDelayValue.textContent = data.avg_delay;
      affectedTrainsValue.textContent = data.affected_trains;
      affectedStationsValue.textContent = data.affected_stations;
      updatedTime.textContent = "Updated: " + new Date().toLocaleString();
    });
}

function renderTable(data) {
  tbody.innerHTML = "";
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No data found.</td></tr>`;
    return;
  }
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.Train_No}</td>
      <td>${row.Station}</td>
      <td>${row.Date}</td>
      <td>${row.Scheduled_Time}</td>
      <td>${row.Actual_Time}</td>
      <td><span class="delay-badge">${row.Delay_Minutes} min</span></td>
      <td><span class="reason-badge">${row.Reason}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderReasonChart(data) {
  const ctx = document.getElementById('reasonChart').getContext('2d');
  const reasonCounts = {};
  data.forEach(row => {
    reasonCounts[row.Reason] = (reasonCounts[row.Reason] || 0) + 1;
  });
  const labels = Object.keys(reasonCounts);
  const values = Object.values(reasonCounts);
  if (reasonChart) reasonChart.destroy();
  reasonChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#eebbc3', '#6d6ee7', '#232946', '#35377d', '#f5f8fa', '#0078d7', '#ff9800'
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderTrendChart(data) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  // Group by date
  const dateMap = {};
  data.forEach(row => {
    if (!dateMap[row.Date]) dateMap[row.Date] = [];
    dateMap[row.Date].push(row.Delay_Minutes);
  });
  const dates = Object.keys(dateMap).sort();
  const numDelays = dates.map(date => dateMap[date].length);
  const avgDelays = dates.map(date => {
    const arr = dateMap[date];
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Number of Delays',
          data: numDelays,
          borderColor: '#6d6ee7',
          backgroundColor: '#6d6ee7',
          yAxisID: 'y',
        },
        {
          label: 'Average Delay (min)',
          data: avgDelays,
          borderColor: '#eebbc3',
          backgroundColor: '#eebbc3',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: 'Number of Delays' } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: 'Avg Delay (min)' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

function fetchData() {
  loading.style.display = "block";
  errorDiv.textContent = "";
  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    })
    .then(data => {
      trainData = data;
      filteredData = trainData;
      renderTable(filteredData);
      renderReasonChart(filteredData);
      renderTrendChart(filteredData);
      loading.style.display = "none";
    })
    .catch(err => {
      loading.style.display = "none";
      errorDiv.textContent = "Error loading data. Please check backend connection.";
      tbody.innerHTML = "";
      console.error(err);
    });
}

function applyFilterFunc() {
  const trainName = trainNameFilter.value.trim().toLowerCase();
  const reason = delayReasonFilter.value.trim().toLowerCase();
  const station = stationFilter.value.trim().toLowerCase();
  filteredData = trainData.filter(row =>
    (!trainName || row.Train_No.toString().toLowerCase().includes(trainName)) &&
    (!reason || row.Reason.toLowerCase().includes(reason)) &&
    (!station || row.Station.toLowerCase().includes(station))
  );
  renderTable(filteredData);
  renderReasonChart(filteredData);
  renderTrendChart(filteredData);
}

applyFilters.addEventListener("click", applyFilterFunc);
clearFilters.addEventListener("click", () => {
  trainNameFilter.value = "";
  delayReasonFilter.value = "";
  stationFilter.value = "";
  filteredData = trainData;
  renderTable(filteredData);
  renderReasonChart(filteredData);
  renderTrendChart(filteredData);
});

document.getElementById("exportCSV").addEventListener("click", () => {
  let csv = "Train,Station,Date,Scheduled,Actual,Delay,Reason\n";
  filteredData.forEach(row => {
    csv += `${row.Train_No},${row.Station},${row.Date},${row.Scheduled_Time},${row.Actual_Time},${row.Delay_Minutes},${row.Reason}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "railradar_delays.csv";
  a.click();
  URL.revokeObjectURL(url);
});

window.addEventListener("DOMContentLoaded", () => {
  updateSummary();
  fetchData();
});