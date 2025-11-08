const JSONBIN_BIN_ID = "690f8523d0ea881f40dc216e";
const JSONBIN_API_KEY =
  "$2a$10$FTK8Pt2Td3f4gaATlTaNteYkwWzv7UjKMMYdcHdentfrPvhf0W9..";

let participants = JSON.parse(localStorage.getItem("screenTimeData")) || [];
let recentEntryId = null;

// Save to localStorage
function saveData() {
  localStorage.setItem("screenTimeData", JSON.stringify(participants));
}

// Sync current data to JSONBin
async function syncToCloud() {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify(participants),
    });
    alert("✅ Data synced to cloud! Others can now load this leaderboard.");
  } catch (error) {
    alert("❌ Failed to sync to cloud. Check console for details.");
    console.error("Sync error:", error);
  }
}

// Load data from JSONBin and replace local data
async function loadFromCloud() {
  if (
    !confirm(
      "Load data from cloud? This will replace your current leaderboard."
    )
  )
    return;

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      }
    );
    const data = await response.json();
    participants = data.record || [];
    saveData();
    updateDisplay();
    alert("✅ Data loaded from cloud!");
  } catch (error) {
    alert("❌ Failed to load from cloud. Check console for details.");
    console.error("Load error:", error);
  }
}

function deleteEntry(index) {
  if (confirm("Delete this entry?")) {
    if (participants[index].id === recentEntryId) {
      recentEntryId = null;
    }

    participants.splice(index, 1);
    saveData();
    updateDisplay();
  }
}

function clearAllData() {
  if (
    confirm("Are you sure you want to delete all data? This cannot be undone.")
  ) {
    participants = [];
    recentEntryId = null;
    localStorage.removeItem("screenTimeData");
    updateDisplay();
  }
}

function updateDisplay() {
  const container = document.getElementById("entries-container");
  const totalCount = document.getElementById("total-count");
  const averageTime = document.getElementById("average-time");

  participants.sort((a, b) => a.hours - b.hours);

  if (participants.length === 0) {
    container.innerHTML = '<div class="empty-state">No entries yet</div>';
  } else {
    container.innerHTML = participants
      .map(
        (person, index) => `
        <div class="entry ${person.id === recentEntryId ? "recent" : ""}">
          <div class="entry-info">
            <div style="display: flex; align-items: center;">
              <span class="entry-number">#${index + 1}</span>
              <span class="name">${person.name}</span>
            </div>
            <span class="time">${person.hours}h</span>
          </div>
          <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
        </div>
      `
      )
      .join("");
  }

  totalCount.textContent = participants.length;

  const average =
    participants.length > 0
      ? (
          participants.reduce((sum, p) => sum + p.hours, 0) /
          participants.length
        ).toFixed(1)
      : 0;
  averageTime.textContent = average;

  if (recentEntryId) {
    requestAnimationFrame(() => {
      const container = document.getElementById("entries-container");
      const recentElement = container.querySelector(".entry.recent");
      if (recentElement) {
        recentElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  }
}

document
  .getElementById("screenTimeForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const hours = parseFloat(document.getElementById("hours").value);

    if (name && !isNaN(hours)) {
      const newEntry = {
        name,
        hours,
        id: Date.now() + Math.random(),
      };

      participants.push(newEntry);
      saveData();

      recentEntryId = newEntry.id;
      updateDisplay();
      this.reset();
    }
  });

// Add sync buttons to the leaderboard
function addSyncButtons() {
  const stats = document.querySelector(".stats");
  const syncDiv = document.createElement("div");
  syncDiv.style.marginTop = "15px";
  syncDiv.style.paddingTop = "15px";
  syncDiv.style.borderTop = "1px solid #e0e0e0";
  syncDiv.style.display = "flex";
  syncDiv.style.justifyContent = "center";
  syncDiv.style.gap = "15px";
  syncDiv.style.alignItems = "center";

  syncDiv.innerHTML = `
    <button id="uploadBtn" onclick="syncToCloud()" style="background: transparent; border: 1px solid #666; color: #666; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8em; transition: all 0.2s;" title="Upload to cloud">↑ Upload</button>
    <button id="downloadBtn" onclick="loadFromCloud()" style="background: transparent; border: 1px solid #666; color: #666; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8em; transition: all 0.2s;" title="Download from cloud">↓ Download</button>
    <span id="syncStatus" style="font-size: 0.75em; color: #999; min-width: 80px;"></span>
  `;

  stats.parentNode.insertBefore(syncDiv, stats.nextSibling);

  // Add hover effects
  const uploadBtn = document.getElementById("uploadBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  uploadBtn.addEventListener(
    "mouseenter",
    () => (uploadBtn.style.backgroundColor = "#f5f5f5")
  );
  uploadBtn.addEventListener(
    "mouseleave",
    () => (uploadBtn.style.backgroundColor = "transparent")
  );

  downloadBtn.addEventListener(
    "mouseenter",
    () => (downloadBtn.style.backgroundColor = "#f5f5f5")
  );
  downloadBtn.addEventListener(
    "mouseleave",
    () => (downloadBtn.style.backgroundColor = "transparent")
  );
}

// Update sync functions to show status
async function syncToCloud() {
  const status = document.getElementById("syncStatus");
  const btn = document.getElementById("uploadBtn");

  status.textContent = "Uploading...";
  status.style.color = "#666";
  btn.style.borderColor = "#666";

  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify(participants),
    });

    status.textContent = "✓ Uploaded";
    status.style.color = "#4CAF50";
    btn.style.borderColor = "#4CAF50";

    // Reset after 3 seconds
    setTimeout(() => {
      status.textContent = "";
      btn.style.borderColor = "#666";
    }, 3000);
  } catch (error) {
    status.textContent = "✗ Failed";
    status.style.color = "#f44336";
    btn.style.borderColor = "#f44336";

    setTimeout(() => {
      status.textContent = "";
      btn.style.borderColor = "#666";
    }, 3000);

    console.error("Sync error:", error);
  }
}

async function loadFromCloud() {
  if (
    !confirm(
      "Load data from cloud? This will replace your current leaderboard."
    )
  )
    return;

  const status = document.getElementById("syncStatus");
  const btn = document.getElementById("downloadBtn");

  status.textContent = "Downloading...";
  status.style.color = "#666";
  btn.style.borderColor = "#666";

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      }
    );
    const data = await response.json();
    participants = data.record || [];
    saveData();
    updateDisplay();

    status.textContent = "✓ Loaded";
    status.style.color = "#4CAF50";
    btn.style.borderColor = "#4CAF50";

    setTimeout(() => {
      status.textContent = "";
      btn.style.borderColor = "#666";
    }, 3000);
  } catch (error) {
    status.textContent = "✗ Failed";
    status.style.color = "#f44336";
    btn.style.borderColor = "#f44336";

    setTimeout(() => {
      status.textContent = "";
      btn.style.borderColor = "#666";
    }, 3000);

    console.error("Load error:", error);
  }
}

// Initialize
updateDisplay();
addSyncButtons();
