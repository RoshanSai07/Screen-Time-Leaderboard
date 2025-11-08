let participants = JSON.parse(localStorage.getItem("screenTimeData")) || [];
let recentEntryId = null;

function saveData() {
  localStorage.setItem("screenTimeData", JSON.stringify(participants));
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

updateDisplay();
