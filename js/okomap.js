const geojsonUrl = '../wp-content/plugins/oko-kaart/js/gemeente_2025.geojson';
const dataUrl = '../wp-content/plugins/oko-kaart/js/oko_gemeenten_kaart.json';

let geojsonData = null;
let deelnemendeGemeenten = [];

Promise.all([
    fetch(geojsonUrl).then(res => res.json()),
    fetch(dataUrl).then(res => res.json())
]).then(([geoData, gemeenteData]) => {
    geojsonData = geoData;

    deelnemendeGemeenten = gemeenteData.filter(g => g.oko_id);
    const jaren = [...new Set(deelnemendeGemeenten.map(g => g.oko_sinds).filter(Boolean))].sort();
    const buttonContainer = document.getElementById('oko-buttons');

    // Voeg de knop 'Alle jaren' toe
    [''].concat(jaren).forEach(j => {
        const btn = document.createElement('button');
        btn.textContent = j || 'Alle jaren';
        btn.dataset.jaar = j;
        btn.classList.add('oko-filter-button');
        buttonContainer.appendChild(btn);
    });


    buttonContainer.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            const jaar = e.target.dataset.jaar;
            document.querySelectorAll('.oko-filter-button')
                .forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            renderMap(gemeenteData, jaar); // of zonder filter als je alleen op oko_id werkt
        }
    });
    renderMap(gemeenteData);
    //select.addEventListener('change', () => renderMap(gemeenteData));
});

function renderMap(gemeenteData, filterJaar = '') {
    const mapData = geojsonData.features.map(feature => {
        const code = feature.properties.statcode;
        const gemeente = gemeenteData.find(g => g.code === code);
        const naam = gemeente?.naam || feature.properties.statnaam || 'Onbekend';
        const themas = gemeente?.themas || [];
        const jaar = gemeente?.oko_sinds;
        const doetMee = gemeente?.oko_id !== null && gemeente?.oko_id !== undefined;

        const gekozen = filterJaar ? parseInt(filterJaar, 10) : null;
        const jaarInt = jaar ? parseInt(jaar, 10) : null;
        const opm1 = gemeente?.opm1;
        const opm2 = gemeente?.opm2;

        const isDeelnemer = gemeente?.oko_id > 0;

        return {
            code,
            value: (isDeelnemer && jaarInt && (!gekozen || jaarInt <= gekozen)) ? 1 : 0,
            name: gemeente?.naam || feature.properties.statnaam,
            jaar: gemeente?.oko_sinds || '',
            opm1: gemeente?.opm1 || null,
            opm2: gemeente?.opm2 || null
        };

    });
    console.log(mapData.filter(d => d.value === null));
    Highcharts.mapChart('gemscan-map', {

        chart: { map: geojsonData },
        title: { text: 'OKO-deelname per gemeente' },
        colorAxis: {
            dataClasses: [{
                to: 0,
                color: '#3db28f',
                name: 'Geen deelname'
            }, {
                from: 1,
                color: '#011763',
                name: 'Deelname'
            }]
        },


        legend: {
            enabled: false
        },
        tooltip: {
            formatter() {
                const { name, jaar, opm1, opm2 } = this.point.options;

                if (!this.point.value) {
                    return `<b>${name}</b><br/>doet <strong>niet</strong> mee aan OKO`;
                }

                let html = `<b>${name}</b><br/>doet mee aan OKO sinds <strong>${jaar}</strong>`;
                if (opm1) html += `<br/><em>${opm1}</em>`;
                if (opm2) html += `<br/><em>${opm2}</em>`;
                return html;
            }
        }

        ,
        series: [{
            data: mapData,
            // 1 = blauw, 0 = groen

            keys: ['code', 'value', 'themaList', 'name', 'jaar'],
            joinBy: ['statcode', 'code'],
            name: 'Gemeente',
            nullColor: '#f7f7f7', // Default fill color for areas with no data
            dataLabels: { enabled: false }
        }]
    });
}
