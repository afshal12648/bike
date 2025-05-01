const readingInput = document.getElementById("readingInput");
const lastReadingDiv = document.getElementById("lastReading");
const statusDiv = document.getElementById("status");

let data = JSON.parse(localStorage.getItem("bikeData")) || {
  readings: [],
  firstReadingKm: null,
  lastSavedTime: null
};

function updateDisplay() {
  statusDiv.innerHTML = "";
  if (data.readings.length > 0) {
    const last = data.readings[data.readings.length - 1];
    lastReadingDiv.innerHTML = `<strong>Last Reading:</strong> ${String(last.km).padStart(6, '0')} km on ${new Date(last.date).toLocaleDateString()}`;

    if (data.firstReadingKm !== null) {
      const totalKmRun = last.km - data.firstReadingKm;
      statusDiv.innerHTML += `<p>📊 Total km run: <strong>${totalKmRun}</strong> km</p>`;

      if (totalKmRun >= 900) {
        statusDiv.innerHTML += `<p>🔧 <strong>Oil & filter change needed!</strong> You've run 900 km since the first reading.</p>`;
        notify("🛢️ Time to change oil & filter!", `You've run 900 km since your first reading.`);
      } else {
        const remainingKm = 900 - totalKmRun;
        statusDiv.innerHTML += `<p>📊 <strong>${remainingKm} km</strong> left to reach 900 km.</p>`;
      }
    } else {
      statusDiv.innerHTML += `<p>⚠️ First reading not entered yet. Please enter the first odometer reading.</p>`;
    }

    let historyHtml = "<h3>📖 Reading History:</h3><ul>";
    data.readings.forEach((entry, i) => {
      historyHtml += `<li>${i + 1}. ${String(entry.km).padStart(6, '0')} km — ${new Date(entry.date).toLocaleDateString()}</li>`;
    });
    historyHtml += "</ul>";
    statusDiv.innerHTML += historyHtml;
  } else {
    lastReadingDiv.innerText = "No readings yet.";
  }
}

function saveReading() {
  const km = parseInt(readingInput.value);
  if (isNaN(km) || km < 100000 || km > 999999) {
    alert("❌ Reading must be a 6-digit number (100000 - 999999).");
    return;
  }

  const now = new Date();

  if (data.lastSavedTime) {
    const lastTime = new Date(data.lastSavedTime);
    const diffMilliseconds = now - lastTime;
    const diffDays = diffMilliseconds / (1000 * 60 * 60 * 24);

    if (diffDays < 4) {
      alert(`⏳ You can only enter a new reading after 4 days. (${Math.floor(4 - diffDays)} day(s) left)`);
      return;
    }
  }

  if (data.firstReadingKm === null) {
    data.firstReadingKm = km;
    statusDiv.innerHTML += `<p>📅 First reading set to: ${String(km).padStart(6, '0')} km</p>`;
  }

  data.readings.push({ km, date: now });
  data.lastSavedTime = now;

  const totalKmRun = km - data.firstReadingKm;

  if (totalKmRun >= 900) {
    notify("🛢️ Time to change oil & filter!", `You've run 900 km since your first reading.`);
  }

  statusDiv.innerHTML += `<p class="success">✅ New reading saved: ${String(km).padStart(6, '0')} km</p>`;

  localStorage.setItem("bikeData", JSON.stringify(data));
  readingInput.value = "";
  updateDisplay();
}

function resetAll() {
  if (confirm("Are you sure you want to delete all readings and reset the tracker?")) {
    localStorage.removeItem("bikeData");
    data = {
      readings: [],
      firstReadingKm: null,
      lastSavedTime: null
    };
    updateDisplay();
    alert("🔄 All readings have been reset.");
  }
}

function notify(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body: message });
      }
    });
  }
}

updateDisplay();

document.getElementById("saveBtn").addEventListener("click", saveReading);
document.getElementById("resetBtn").addEventListener("click", resetAll);
