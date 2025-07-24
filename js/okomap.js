const geojsonUrl = '../wp-content/plugins/oko-kaart/js/gemeente_2025.geojson';
const dataUrl = '../wp-content/plugins/oko-kaart/js/oko_gemeenten_kaart.json';

let geojsonData = null;
let deelnemendeGemeenten = [];
let geselecteerdeGemeente = null;

Promise.all([
    fetch(geojsonUrl).then(res => res.json()),
    fetch(dataUrl).then(res => res.json())
]).then(([geoData, gemeenteData]) => {
    geojsonData = geoData;

    deelnemendeGemeenten = gemeenteData.filter(g => g.oko_id);
    const jaren = [...new Set(
        deelnemendeGemeenten
            .map(g => parseInt(g.oko_sinds, 10))
            .filter(j => !isNaN(j))
    )].sort((a, b) => a - b);

    const buttonContainer = document.getElementById('oko-buttons');

    // Voeg de knop 'Alle jaren' toe

    jaren.forEach(j => {
        const btn = document.createElement('button');
        btn.textContent = j;
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
    Highcharts.mapChart('oko-map', {
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

        /*tooltip: {
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
        }*/
        tooltip: {
            formatter() {
                if (this.point.value !== 1) return false;  // geen tooltip
                return `<b>${this.point.name}</b>`;
            }
        },
        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function () {
                            // Reset vorige selectie
                            if (geselecteerdeGemeente) {
                                geselecteerdeGemeente.update({ color: null }, true, false);
                            }

                            // Alleen deelnemers mogen geselecteerd worden
                            if (this.value === 1) {
                                this.update({ color: '#ffa500' }, true, false); // Oranje als voorbeeld
                                geselecteerdeGemeente = this;
                            } else {
                                geselecteerdeGemeente = null;
                            }

                            if (this.value !== 1) return;

                            const { name, jaar, opm1, opm2 } = this.options;

                            let html = `<h3>${name}</h3>`;
                            html += `<p><strong>Doet mee sinds ${jaar}</strong></p>`;

                            if (opm1) html += `<p>${opm1}</p>`;
                            if (opm2) html += `<p>${opm2}</p>`;

                            document.getElementById('oko-info').innerHTML = html;
                        }
                    }
                }
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
document.getElementById('oko-map').addEventListener('click', function (e) {
    // Als je op een leeg stuk klikt (niet op een gemeentevlak)
    if (e.target.nodeName === 'svg' || e.target.closest('.highcharts-background')) {
        if (geselecteerdeGemeente) {
            geselecteerdeGemeente.update({ color: null }, true, false);
            geselecteerdeGemeente = null;
        }

        // Optioneel: infoveld legen
        document.getElementById('oko-info').innerHTML = 'Selecteer een gemeente…';
    }
});

const chart = Highcharts.mapChart('oko-map', { /* … */ });

window.addEventListener('resize', () => {
    chart.reflow();
});
