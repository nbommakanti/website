// Publications functionality
document.addEventListener('DOMContentLoaded', function() {
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
        <p class="text-gray-700 mb-2">${authors}${authors && pub.journal ? '. ' : ''}<em>${pub.journal}</em>${pub.year ? `, ${pub.year}` : ''}</p>
        ${pub.link ? `<a href="${pub.link}" target="_blank" class="text-blue-600 hover:underline text-sm">View →</a>` : ""}
    `;
    container.appendChild(div);
}

// ---------- Fetch Sheet by GID ----------
async function fetchGoogleSheetByGID(sheetId, gid, source) {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&tqx=out:json`;
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        return json.table.rows
            .filter(row => {
                if (!row.c || !row.c[0] || !row.c[0].v) return false; // Skip empty rows
                
                const title = row.c[0]?.v || "";
                const authors = row.c[1]?.v || "";
                const journal = row.c[2]?.v || "";
                const year = row.c[3]?.v || "";
                const link = row.c[4]?.v || "";
                
                // Skip header rows by checking if values match common header text
                const isHeader = title === "Title" || 
                               authors === "Authors" || 
                               journal === "Journal" || 
                               year === "Year" || 
                               link === "Link";
                               
                return !isHeader;
            })
            .map(row => ({
                title: row.c[0]?.v || "",
                authors: row.c[1]?.v ? row.c[1].v.split(", ") : [],
                journal: row.c[2]?.v || "",
                year: row.c[3]?.v || "",
                sortdate: row.c[3]?.v ? `${row.c[3].v}/01/01` : "1900/01/01",
                link: row.c[4]?.v || "",
                source: source
            }));
    } catch (error) {
        console.error(`Error fetching GID ${gid}:`, error);
        return [];
    }
}

// ---------- Fetch from PubMed ----------
async function fetchPubMed() {
    try {
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
    } catch (error) {
        console.error("Error fetching PubMed:", error);
        return [];
    }
}

// ---------- Create Filter Buttons ----------
function createFilterButtons(publications) {
    const filterContainer = document.querySelector('.flex.justify-center.gap-4.mb-8');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';

    const sources = [...new Set(publications.map(pub => pub.source))];
    
    // All button
    const allButton = document.createElement('button');
    allButton.id = 'filter-all';
    allButton.className = 'filter-btn px-4 py-2 bg-blue-600 text-white rounded-lg transition active';
    allButton.textContent = 'All';
    filterContainer.appendChild(allButton);

    // Source buttons
    sources.forEach(source => {
        const button = document.createElement('button');
        button.id = `filter-${source}`;
        button.className = 'filter-btn px-4 py-2 bg-gray-200 text-gray-800 rounded-lg transition';
        button.textContent = getSourceDisplayName(source);
        button.dataset.source = source;
        filterContainer.appendChild(button);
    });
}

// ---------- Get Display Name ----------
function getSourceDisplayName(source) {
    return source === 'pubmed' ? 'Research Papers' : source;
}

// ---------- Setup Filters ----------
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Set active button using classList methods (more reliable)
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white', 'active');
                btn.classList.add('bg-gray-200', 'text-gray-800');
                // Force remove any hover states by triggering a reflow
                btn.style.backgroundColor = '';
                btn.style.color = '';
            });
            button.classList.remove('bg-gray-200', 'text-gray-800');
            button.classList.add('bg-blue-600', 'text-white', 'active');

            // Filter publications
            const targetSource = button.dataset.source;
            document.querySelectorAll("#pubmed-results > div").forEach(div => {
                if (button.id === 'filter-all') {
                    div.classList.remove("hidden");
                } else {
                    div.classList.toggle("hidden", div.dataset.source !== targetSource);
                }
            });
        });
        
        // Add hover effects via JavaScript instead of CSS to have more control
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('active')) {
                // Remove all possible color classes first
                button.classList.remove('bg-gray-200', 'text-gray-800', 'bg-blue-600', 'text-white');
                // Then add hover colors
                button.classList.add('bg-blue-600', 'text-white');
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                // Remove all possible color classes first
                button.classList.remove('bg-gray-200', 'text-gray-800', 'bg-blue-600', 'text-white');
                // Then add inactive colors
                button.classList.add('bg-gray-200', 'text-gray-800');
            }
        });
    });
}

// ---------- Main Load Function ----------
async function loadPublications() {
    try {
        const sheetId = "1VmBY80e_dJL6JrGpqcfK08ofAqERUZ_1CnewBUe__J8";
        
        // Configure your sheets with GIDs and display names
        const sheetConfigs = [
            { gid: "0", source: "Clinical Articles" },
            { gid: "1810690134", source: "Research Presentations" },
        ];

        // Fetch all data
        const promises = [
            fetchPubMed(),
            ...sheetConfigs.map(config => fetchGoogleSheetByGID(sheetId, config.gid, config.source))
        ];
        
        const results = await Promise.all(promises);
        const allPubs = results.flat().sort((a, b) => new Date(b.sortdate) - new Date(a.sortdate));

        // Render
        const container = document.getElementById("pubmed-results");
        container.innerHTML = "";
        allPubs.forEach(pub => renderPublication(pub, container));

        // Setup filters
        createFilterButtons(allPubs);
        setupFilterButtons();

        // Show results
        document.getElementById("loading").classList.add("hidden");
        document.getElementById("pubmed-list").classList.remove("hidden");

    } catch (err) {
        console.error("Loading failed:", err);
        document.getElementById("loading").innerHTML = '<p class="text-red-600">Error loading publications.</p>';
    }
}