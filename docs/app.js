/* ---------------------------------------------------------
   Utils dates
--------------------------------------------------------- */

function parseDate(str) {
    // str attendu : "YYYY-MM-DD"
    return new Date(str + "T00:00:00");
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

function isFuture(entryDate, today) {
    return entryDate > today;
}

function isPast(entryDate, today) {
    return entryDate < today;
}

function isThisWeek(entryDate, today) {
    // semaine = lundi → vendredi de la semaine de "today"
    const day = today.getDay(); // 0 = dimanche, 1 = lundi...
    const diffToMonday = (day === 0 ? -6 : 1 - day); // ajuster si dimanche
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    return entryDate >= monday && entryDate <= friday;
}

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

    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
    html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
    html = html.replace(/\n\n/gim, "</p><p>");
    html = "<p>" + html + "</p>";
    html = html.replace(/(<p><li>)/gim, "<ul><li>");
    html = html.replace(/(<\/li><\/p>)/gim, "</li></ul>");

    return html;
}

/* ---------------------------------------------------------
   Chargement des posts
--------------------------------------------------------- */

async function loadHistory() {
    try {
        const response = await fetch("history.json");
        const data = await response.json();

        renderDashboard(data);

    } catch (error) {
        console.error("Erreur lors du chargement de history.json", error);
    }
}

/* ---------------------------------------------------------
   Rendu global du dashboard
--------------------------------------------------------- */

function renderDashboard(data) {
    const todayDiv = document.getElementById("today");
    const weekDiv = document.getElementById("week");
    const pastDiv = document.getElementById("past");

    todayDiv.innerHTML = "";
    weekDiv.innerHTML = "";
    pastDiv.innerHTML = "";

    if (!data || data.length === 0) return;

    const today = new Date();
    const entries = data.map(e => ({
        ...e,
        _dateObj: parseDate(e.date)
    }));

    const todayEntry = entries.find(e => isSameDay(e._dateObj, today));
    const weekEntries = entries.filter(e => isThisWeek(e._dateObj, today));
    const pastEntries = entries.filter(e => isPast(e._dateObj, today));
    const futureEntries = entries.filter(e => isFuture(e._dateObj, today));

    renderToday(todayDiv, todayEntry);
    renderWeek(weekDiv, weekEntries);
    renderPast(pastDiv, pastEntries, futureEntries);
}

/* ---------------------------------------------------------
   Post du jour — carte premium
--------------------------------------------------------- */

function renderToday(container, entry) {
    if (!entry) {
        container.innerHTML = "<h2>Post du jour</h2><p>Aucun post pour aujourd'hui.</p>";
        return;
    }

    container.innerHTML = `
        <h2>Post du jour</h2>
        <div class="today-card">
            <div class="today-blob"></div>
            <div class="today-bg">
                <img src="${entry.image}" alt="Image du jour" />
                <p>${entry.text}</p>
                <p><small>${entry.date}</small></p>
            </div>
        </div>
    `;
}

/* ---------------------------------------------------------
   Semaine en cours — carrousel 3D
--------------------------------------------------------- */

function renderWeek(container, weekEntries) {
    container.innerHTML = "<h2>Semaine en cours</h2>";

    if (!weekEntries || weekEntries.length === 0) {
        container.innerHTML += "<p>Aucun post pour cette semaine.</p>";
        return;
    }

    const limited = weekEntries.slice(0, 5);

    let cardsHtml = "";
    limited.forEach((entry, index) => {
        cardsHtml += `
            <div class="week-card" style="--index:${index};">
                <img src="${entry.image}" alt="${entry.date}" />
            </div>
        `;
    });

    container.innerHTML += `
        <div class="week-wrapper">
            <div class="week-inner">
                ${cardsHtml}
            </div>
        </div>
    `;
}

/* ---------------------------------------------------------
   Posts passés + futurs
   - passés : net + bandeau "Publié"
   - futurs : flou + 🔒 + "À venir"
--------------------------------------------------------- */

function renderPast(container, pastEntries, futureEntries) {
    container.innerHTML = "<h2>Posts précédents</h2>";

    pastEntries
        .sort((a, b) => b._dateObj - a._dateObj)
        .forEach(entry => {
            container.innerHTML += `
                <div class="past-item">
                    <img src="${entry.image}" alt="${entry.date}" />
                    <div class="past-banner">Publié</div>
                    <p>${entry.date}</p>
                </div>
            `;
        });

    if (futureEntries && futureEntries.length > 0) {
        container.innerHTML += "<h3>À venir</h3>";

        futureEntries
            .sort((a, b) => a._dateObj - b._dateObj)
            .forEach(entry => {
                container.innerHTML += `
                    <div class="past-item">
                        <div class="future">
                            <img src="${entry.image}" alt="${entry.date}" />
                        </div>
                        <div class="future-overlay">
                            <span class="future-banner">À venir</span>
                            <span class="future-lock">🔒</span>
                        </div>
                        <p>${entry.date}</p>
                    </div>
                `;
            });
    }
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
