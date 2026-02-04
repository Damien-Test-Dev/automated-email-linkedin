/* ---------------------------------------------------------
   Gestion des onglets (Posts / Monitoring)
--------------------------------------------------------- */

function setActiveTab(tabName) {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    panels.forEach(panel => {
        panel.classList.toggle("hidden", panel.id !== `tab-${tabName}`);
    });

    if (tabName === "monitoring") {
        loadMonitoringReport();
    }
}

/* ---------------------------------------------------------
   Chargement du rapport Monitoring (Markdown → HTML)
--------------------------------------------------------- */

async function loadMonitoringReport() {
    const container = document.getElementById("monitoring-content");

    try {
        const response = await fetch("reports/health_check.md");
        if (!response.ok) {
            container.innerHTML = "<p>Impossible de charger le rapport.</p>";
            return;
        }

        const markdown = await response.text();
        container.innerHTML = convertMarkdownToHtml(markdown);

    } catch (error) {
        container.innerHTML = "<p>Erreur lors du chargement du rapport.</p>";
    }
}

/* ---------------------------------------------------------
   Convertisseur Markdown minimaliste → HTML
--------------------------------------------------------- */

function convertMarkdownToHtml(md) {
    let html = md;

    // Titres
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");

    // Gras
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

    // Italique
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // Listes
    html = html.replace(/^- (.*$)/gim, "<li>$1</li>");

    // Paragraphes
    html = html.replace(/\n\n/gim, "</p><p>");
    html = "<p>" + html + "</p>";

    // Listes <ul>
    html = html.replace(/(<p><li>)/gim, "<ul><li>");
    html = html.replace(/(<\/li><\/p>)/gim, "</li></ul>");

    return html;
}

/* ---------------------------------------------------------
   Chargement des posts (fonction existante)
--------------------------------------------------------- */

async function loadHistory() {
    try {
        const response = await fetch("history.json");
        const data = await response.json();

        renderToday(data);
        renderWeek(data);
        renderPast(data);

    } catch (error) {
        console.error("Erreur lors du chargement de history.json", error);
    }
}

/* ---------------------------------------------------------
   Rendu des sections du dashboard (inchangé)
--------------------------------------------------------- */

function renderToday(data) {
    const todayDiv = document.getElementById("today");
    todayDiv.innerHTML = "";

    if (data.length === 0) return;

    const last = data[data.length - 1];

    todayDiv.innerHTML = `
        <h2>Post du jour</h2>
        <img src="${last.image}" alt="Image du jour" />
        <p>${last.text}</p>
    `;
}

function renderWeek(data) {
    const weekDiv = document.getElementById("week");
    weekDiv.innerHTML = "<h2>Semaine en cours</h2>";

    const last7 = data.slice(-7);

    last7.forEach(entry => {
        weekDiv.innerHTML += `
            <div class="week-item">
                <img src="${entry.image}" />
                <p>${entry.date}</p>
            </div>
        `;
    });
}

function renderPast(data) {
    const pastDiv = document.getElementById("past");
    pastDiv.innerHTML = "<h2>Posts précédents</h2>";

    const older = data.slice(0, -7);

    older.forEach(entry => {
        pastDiv.innerHTML += `
            <div class="past-item">
                <img src="${entry.image}" />
                <p>${entry.date}</p>
            </div>
        `;
    });
}

/* ---------------------------------------------------------
   Initialisation
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    loadHistory();

    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            setActiveTab(tab.dataset.tab);
        });
    });
});
