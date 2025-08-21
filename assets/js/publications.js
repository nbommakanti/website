// Publications functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only run this code if we're on the publications page
    if (document.getElementById('pubmed-results')) {
        loadPublications();
    }
});

// ---------- Render a Publication ----------
function renderPublication(pub, container) {
    const div = document.createElement("div");
    div.className = "bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition max-w-3xl mx-auto";
    div.dataset.source = pub.source;

    let authors = pub.authors
        .map(a => a.includes("Bommakanti") ? `<strong class="text-blue-900">${a}</strong>` : a)
        .join(", ");

    div.innerHTML = `
        <p class="text-lg text-gray-800 mb-2"><strong>${pub.title}</strong></p>
        <p class="text-gray-700 mb-2">${authors}${authors && pub.journal ? ', ' : ''}<em>${pub.journal}</em>${pub.year ? `, ${pub.year}` : ''}</p>
        ${pub.link ? `<a href="${pub.link}" target="_blank" class="text-blue-600 hover:underline text-sm">View →</a>` : ""}
    `;
    container.appendChild(div);
}

// ---------- Fetch from Google Sheets (via gviz JSON API) ----------
async function fetchGoogleSheetJSON(sheetId) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const res = await fetch(url);
    const text = await res.text();

    // Strip the JSONP wrapper
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const pubs = json.table.rows.map(row => {
        return {
            title: row.c[0]?.v || "",
            authors: row.c[1]?.v ? row.c[1].v.split(", ") : [],
            journal: row.c[2]?.v || "",
            year: row.c[3]?.v || "",
            sortdate: row.c[3]?.v ? `${row.c[3].v}/01/01` : "1900/01/01",
            link: row.c[4]?.v || "",
            source: "google"
        };
    });

    return pubs;
}

// ---------- Fetch from PubMed ----------
async function fetchPubMed() {
    const searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Bommakanti+N[Author]&retmax=1000&retmode=json&sort=pub_date";
    const searchRes = await fetch(searchUrl).then(r => r.json());
    const ids = searchRes.esearchresult.idlist;
    if (!ids.length) return [];

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const summaryRes = await fetch(summaryUrl).then(r => r.json());

    const pubs = [];
    for (let id in summaryRes.result) {
        if (id === "uids") continue;
        const pub = summaryRes.result[id];
        pubs.push({
            title: pub.title,
            authors: pub.authors.map(a => a.name),
            journal: pub.fulljournalname || pub.source,
            year: pub.pubdate ? pub.pubdate.split(' ')[0] : '',
            sortdate: pub.sortpubdate || pub.pubdate || '1900/01/01',
            link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
            source: "pubmed"
        });
    }
    return pubs;
}

// ---------- Load & Merge ----------
async function loadPublications() {
    try {
        const sheetId = "1VmBY80e_dJL6JrGpqcfK08ofAqERUZ_1CnewBUe__J8";
        const [pubmedPubs, googlePubs] = await Promise.all([
            fetchPubMed(),
            fetchGoogleSheetJSON(sheetId)
        ]);

        let allPubs = [...pubmedPubs, ...googlePubs];
        allPubs.sort((a, b) => new Date(b.sortdate) - new Date(a.sortdate));

        const container = document.getElementById("pubmed-results");
        container.innerHTML = "";
        allPubs.forEach(pub => renderPublication(pub, container));

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("pubmed-list").classList.remove("hidden");

        // ---------- Filter Buttons ----------
        function setActive(buttonId) {
            document.querySelectorAll("#filter-all, #filter-pubmed, #filter-google").forEach(btn => {
                btn.classList.remove("bg-blue-600", "text-white", "active");
                btn.classList.add("bg-gray-200", "text-gray-800");
            });
            const activeBtn = document.getElementById(buttonId);
            activeBtn.classList.remove("bg-gray-200", "text-gray-800");
            activeBtn.classList.add("bg-blue-600", "text-white", "active");
        }

        document.getElementById("filter-all").addEventListener("click", () => {
            setActive("filter-all");
            document.querySelectorAll("#pubmed-results > div").forEach(d => d.classList.remove("hidden"));
        });

        document.getElementById("filter-pubmed").addEventListener("click", () => {
            setActive("filter-pubmed");
            document.querySelectorAll("#pubmed-results > div").forEach(d => {
                d.classList.toggle("hidden", d.dataset.source !== "pubmed");
            });
        });

        document.getElementById("filter-google").addEventListener("click", () => {
            setActive("filter-google");
            document.querySelectorAll("#pubmed-results > div").forEach(d => {
                d.classList.toggle("hidden", d.dataset.source !== "google");
            });
        });

    } catch (err) {
        console.error("Publication loading failed:", err);
        document.getElementById("loading").innerHTML =
            '<p class="text-red-600">Error loading publications. Check console for details.</p>';
    }
}