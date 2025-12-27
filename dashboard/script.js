// ====== Utilitaires généraux ======

async function fetchJson(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error("Erreur lors du chargement de", path, e);
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toISOString().slice(0, 10);
}

// ====== 1. Gestion du calendrier éditorial (posts_history / calendar.json) ======

let calendarData = [];

function renderCalendarTable(data) {
  const tbody = document.getElementById("calendar-body");
  const countSpan = document.getElementById("calendar-count");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">Aucune donnée de calendrier.</td></tr>`;
    if (countSpan) countSpan.textContent = "0 ligne";
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date || ""}</td>
      <td>${row.jour || ""}</td>
      <td>${row.heure || ""}</td>
      <td>${row.etat || ""}</td>
      <td>${row.image || ""}</td>
      <td>${row.chemin_fichier_post || ""}</td>
    `;
    tbody.appendChild(tr);
  });

  if (countSpan) {
    countSpan.textContent = `${data.length} lignes`;
  }
}

function computeSummaryStats(data) {
  if (!data || data.length === 0) return null;

  const totalPosts = data.length;
  const dates = data.map((d) => d.date).filter(Boolean);
  const uniqueDates = new Set(dates);
  const daysCovered = uniqueDates.size;

  const prepared = data.filter((d) => d.etat === "preparé").length;
  const imageReady = data.filter((d) => d.etat === "image_prete").length;
  const readyToPublish = data.filter((d) => d.etat === "pret_pour_publication").length;

  // Couverture 30 jours = nombre de dates dans les 30 prochains jours qui ont une ligne
  const now = new Date();
  const plus30 = new Date();
  plus30.setDate(now.getDate() + 30);

  const coveredNext30 = new Set(
    data
      .filter((d) => {
        if (!d.date) return false;
        const dt = new Date(d.date);
        return dt >= now && dt <= plus30;
      })
      .map((d) => d.date)
  ).size;

  // Prochain jour sans post
  let nextUncovered = null;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const candidate = cursor.toISOString().slice(0, 10);
    if (!uniqueDates.has(candidate)) {
      nextUncovered = candidate;
      break;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    totalPosts,
    daysCovered,
    prepared,
    imageReady,
    readyToPublish,
    coverage30: coveredNext30,
    nextUncovered,
  };
}

function renderSummary(stats) {
  if (!stats) return;

  const map = {
    "stat-total-posts": stats.totalPosts,
    "stat-days-covered": stats.daysCovered,
    "stat-prepared": stats.prepared,
    "stat-image-ready": stats.imageReady,
    "stat-ready-to-publish": stats.readyToPublish,
    "stat-coverage-30": stats.coverage30,
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  const nextUncoveredSpan = document.getElementById("next-uncovered-day");
  if (nextUncoveredSpan) {
    nextUncoveredSpan.textContent =
      "Prochain jour sans post : " + (stats.nextUncovered || "—");
  }
}

function renderWeekView(data) {
  const container = document.getElementById("week-grid");
  const rangeLabel = document.getElementById("current-week-range");
  if (!container) return;

  const now = new Date();
  const day = now.getDay(); // 0 = dimanche, 1 = lundi...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  container.innerHTML = "";

  days.forEach((d) => {
    const dateStr = d.toISOString().slice(0, 10);
    const rowsForDay = (data || []).filter((r) => r.date === dateStr);
    const hasRow = rowsForDay.length > 0;

    const div = document.createElement("div");
    div.className = "week-day";

    const dayName = d.toLocaleDateString("fr-FR", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });

    const statusText = hasRow ? "Couvert" : "Aucun post";
    const statusColor = hasRow ? "#82f2bf" : "#ff9c9c";

    div.innerHTML = `
      <div class="week-day-header">
        <span>${dayName}</span>
        <span>${formattedDate}</span>
      </div>
      <div class="week-day-status" style="color:${statusColor}">${statusText}</div>
    `;

    container.appendChild(div);
  });

  if (rangeLabel) {
    const first = days[0].toLocaleDateString("fr-FR");
    const last = days[4].toLocaleDateString("fr-FR");
    rangeLabel.textContent = `${first} → ${last}`;
  }
}

// Filtres & recherche
function applyFilters() {
  const statusSelect = document.getElementById("filter-status");
  const periodSelect = document.getElementById("filter-period");
  const searchInput = document.getElementById("search-input");

  if (!calendarData || calendarData.length === 0) {
    renderCalendarTable([]);
    return;
  }

  let filtered = [...calendarData];

  const status = statusSelect ? statusSelect.value : "";
  const period = periodSelect ? periodSelect.value : "all";
  const search = (searchInput ? searchInput.value : "").toLowerCase();

  if (status) {
    filtered = filtered.filter((r) => (r.etat || "") === status);
  }

  const today = new Date().toISOString().slice(0, 10);

  if (period === "past") {
    filtered = filtered.filter((r) => r.date && r.date < today);
  } else if (period === "future") {
    filtered = filtered.filter((r) => r.date && r.date >= today);
  }

  if (search) {
    filtered = filtered.filter((r) => {
      const full = [
        r.date,
        r.jour,
        r.heure,
        r.etat,
        r.image,
        r.chemin_fichier_post,
      ]
        .join(" ")
        .toLowerCase();
      return full.includes(search);
    });
  }

  renderCalendarTable(filtered);
}

function setupFilterListeners() {
  const statusSelect = document.getElementById("filter-status");
  const periodSelect = document.getElementById("filter-period");
  const searchInput = document.getElementById("search-input");

  if (statusSelect) statusSelect.addEventListener("change", applyFilters);
  if (periodSelect) periodSelect.addEventListener("change", applyFilters);
  if (searchInput) searchInput.addEventListener("input", applyFilters);
}

// ====== 2. Monitoring du pipeline (dashboard_data + logs) ======

function renderHealth(health) {
  const container = document.getElementById("health-content");
  if (!container) return;

  if (!health || !health.stats) {
    container.innerHTML = "<p>Aucune donnée de santé disponible.</p>";
    return;
  }

  const status = health.last_status || "unknown";
  let badgeClass = "badge-neutral";
  if (status === "success") badgeClass = "badge-success";
  if (status === "error") badgeClass = "badge-error";

  container.innerHTML = `
    <p><strong>Dernier run :</strong> ${health.last_run || "N/A"}</p>
    <p>
      <strong>Statut global :</strong>
      <span class="badge ${badgeClass}">${status.toUpperCase()}</span>
    </p>
    <p><strong>Nombre total de runs :</strong> ${health.stats.total_runs}</p>
    <p><strong>Succès :</strong> ${health.stats.success_runs}</p>
    <p><strong>Erreurs :</strong> ${health.stats.error_runs}</p>
    <p><strong>Taux de succès :</strong> ${health.stats.success_rate}%</p>
  `;
}

function renderErrors(errors) {
  const container = document.getElementById("errors-content");
  if (!container) return;

  if (!errors || errors.length === 0) {
    container.innerHTML = "<p>Aucune erreur récente 🎉</p>";
    return;
  }

  const recent = errors.slice(-10).reverse();
  let html = `
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Étape</th>
          <th>Script</th>
        </tr>
      </thead>
      <tbody>
  `;

  recent.forEach((e) => {
    html += `
      <tr>
        <td>${e.timestamp}</td>
        <td>${e.step}</td>
        <td>${e.script}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function renderTimeline(logs) {
  const container = document.getElementById("timeline-content");
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = "<p>Aucune exécution trouvée.</p>";
    return;
  }

  const recent = logs.slice(-20).reverse();
  let html = `
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Étape</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
  `;

  recent.forEach((entry) => {
    const status = entry.status || "unknown";
    let badgeClass = "badge-neutral";
    if (status === "success") badgeClass = "badge-success";
    if (status === "error") badgeClass = "badge-error";

    html += `
      <tr>
        <td>${entry.timestamp}</td>
        <td>${entry.step}</td>
        <td><span class="badge ${badgeClass}">${status.toUpperCase()}</span></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function renderReports(reports) {
  const container = document.getElementById("reports-content");
  if (!container) return;

  if (!reports || reports.length === 0) {
    container.innerHTML = "<p>Aucun rapport disponible.</p>";
    return;
  }

  const recent = reports.slice(-15).reverse();
  let html = "<ul>";

  recent.forEach((r) => {
    html += `<li>${r.date} — <code>${r.path}</code></li>`;
  });

  html += "</ul>";
  container.innerHTML = html;
}

// ====== Initialisation complète ======

async function initDashboard() {
  // 1. Charger les données du calendrier (si tu crées plus tard un dashboard_data/calendar.json)
  const calendarJson = await fetchJson("../dashboard_data/calendar.json");
  if (calendarJson && Array.isArray(calendarJson)) {
    calendarData = calendarJson;
    renderCalendarTable(calendarData);
    const stats = computeSummaryStats(calendarData);
    renderSummary(stats);
    renderWeekView(calendarData);
  } else {
    renderCalendarTable([]);
  }

  setupFilterListeners();

  // 2. Charger les données de monitoring
  const [health, logs, errors, reports] = await Promise.all([
    fetchJson("../dashboard_data/health_summary.json"),
    fetchJson("../dashboard_data/daily_logs.json"),
    fetchJson("../dashboard_data/errors.json"),
    fetchJson("../dashboard_data/reports.json"),
  ]);

  renderHealth(health);
  renderErrors(errors);
  renderTimeline(logs);
  renderReports(reports);

  // 3. Mettre à jour "Dernière mise à jour"
  const lastUpdatedSpan = document.getElementById("last-updated");
  if (lastUpdatedSpan) {
    const now = new Date();
    const formatted = now.toLocaleString("fr-FR");
    lastUpdatedSpan.textContent = `Dernière mise à jour : ${formatted}`;
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);
