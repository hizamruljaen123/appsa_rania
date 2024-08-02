// Sidebar Toggle Functions
function openSidebar() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("main-content").style.marginLeft = "250px";
}

function closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main-content").style.marginLeft = "0";
}


function fetchDataAndPopulateTable() {
    fetch('http://127.0.0.1:5000/get_tb_usia')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('data-usia');
            tbody.innerHTML = ''; // Clear existing data

            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.Kecamatan}</td>
                        <td>${item.anak_anak}</td>
                        <td>${item.remaja}</td>
                        <td>${item.dewasa}</td>
                        <td>${item.paruh_baya}</td>
                        <td>${item.lansia}</td>
                        <td>${item.jumlah}</td>
                        <td>${item.tahun}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}
function fetchDataAndPopulateTableJenis() {
    fetch('http://127.0.0.1:5000/get_tb_jenis')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('data-jenis');
            tbody.innerHTML = ''; // Clear existing data

            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.Kecamatan}</td>
                        <td>${item.TBC_Paru}</td>
                        <td>${item.TBC_Ekstraparu}</td>
                        <td>${item.TBC_Milier}</td>
                        <td>${item.TBC_Meningitis}</td>
                        <td>${item.TBC_Kelenjar}</td>
                        <td>${item.TBC_Usus}</td>
                        <td>${item.TBC_Tulang}</td>
                        <td>${item.TBC_Kulit}</td>
                        <td>${item.Jumlah}</td>
                        <td>${item.tahun}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}
// Initialize Leaflet Map
var map;
var markers;

// Kecamatan coordinates
var kecamatanCoords = {
    "Karang Baru": [4.264, 97.926],
    "Tamiang Hulu": [4.420, 97.950],
    "Rantau": [4.450, 98.150],
    "Seruway": [4.070, 98.050],
    "Banda Mulia": [4.220, 97.910],
    "Bendahara": [4.400, 97.850],
    "Manyak Payed": [4.380, 97.780],
    "Tenggulun": [4.080, 98.200],
    "Kejuruan Muda": [4.100, 97.900],
    "Sekerak": [4.290, 97.960],
    "Bandar Pusaka": [4.260, 97.800],
    "Kuala Simpang": [4.650, 97.900],
    "Kota Kualasimpang": [4.560, 97.780]
};

// Define marker colors based on severity
var severityColors = {
  'Aman': 'green',
  'Waspada': 'yellow',
  'Siaga': 'orange',
  'Awas': 'red'
};

// Function to initialize the map
function initializeMap() {
  map = L.map('map').setView([4.264, 97.926], 10); // Koordinat Aceh Tamiang
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  markers = L.layerGroup().addTo(map);
}

// Function to create markers based on data
function createMarkers(data, year) {
  markers.clearLayers();

  for (const [kecamatan, tahunData] of Object.entries(data)) {
    if (tahunData[year]) {
      const entry = tahunData[year];
      if (entry.lat && entry.lon) {
        var marker = L.circleMarker([entry.lon, entry.lat], {
          color: severityColors[entry.status],
          radius: 8
        }).addTo(markers)
        .bindPopup(`${kecamatan}: ${entry.usia.anak_anak + entry.usia.remaja + entry.usia.dewasa + entry.usia.paruh_baya + entry.usia.lansia} Kasus, Status: ${entry.status}`);
      }
    }
  }
}

async function loadDataHasil(year) {
  document.getElementById("yearData").innerHTML = year;
  document.getElementById("tabelDataYear").innerHTML = year;
  const apiUrl = 'http://127.0.0.1:5000/run_k_medoids_combined';

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    console.log('Data fetched successfully:', data);

    // Clear existing map and initialize a new one
    if (map) {
      map.remove();
    }
    initializeMap();

    // Create markers based on the fetched data
    createMarkers(data, year);

    // Update table data
    const tableBody = document.getElementById(`tabel-hasil-${year}`);
    tableBody.innerHTML = ''; // Clear any existing data

    for (const [kecamatan, tahunData] of Object.entries(data)) {
      if (tahunData[year]) {
        const entry = tahunData[year];
        const row = document.createElement('tr');
        row.innerHTML = `
          <td onclick="kecamatanDetails('${kecamatan}', ${year}, ${entry.lon}, ${entry.lat})">${kecamatan}</td>
          <td>${entry.status}</td>
          <td>${entry.usia.anak_anak + entry.usia.remaja + entry.usia.dewasa + entry.usia.paruh_baya + entry.usia.lansia}</td>
          <td>${entry.lat}</td>
          <td>${entry.lon}</td>
        `;
        tableBody.appendChild(row);
      }
    }

    // Calculate yearly and region summaries
    const yearlySummary = {};
    const regionSummary = {};

    for (const [kecamatan, tahunData] of Object.entries(data)) {
      for (const [year, entry] of Object.entries(tahunData)) {
        if (!yearlySummary[year]) {
          yearlySummary[year] = { Awas: 0, Siaga: 0, Waspada: 0, Aman: 0 };
        }
        if (!regionSummary[kecamatan]) {
          regionSummary[kecamatan] = { Awas: 0, Siaga: 0, Waspada: 0, Aman: 0 };
        }
        const totalCases = entry.usia.anak_anak + entry.usia.remaja + entry.usia.dewasa + entry.usia.paruh_baya + entry.usia.lansia;
        yearlySummary[year][entry.status] += totalCases;
        regionSummary[kecamatan][entry.status] += totalCases;
      }
    }

    // Update yearly summary table
    const summaryTableBody = document.getElementById('yearSummary');
    summaryTableBody.innerHTML = ''; // Clear existing summary

    Object.keys(yearlySummary).forEach((year) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${year}</td>
        <td>${yearlySummary[year].Awas}</td>
        <td>${yearlySummary[year].Siaga}</td>
        <td>${yearlySummary[year].Waspada}</td>
        <td>${yearlySummary[year].Aman}</td>
      `;
      summaryTableBody.appendChild(row);
    });

    // Update charts
    updateYearlyChart(yearlySummary);
    updateRegionChart(regionSummary);

    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab[data-year="${year}"]`).classList.add('active');

    // Show content for selected year
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`content-${year}`).classList.add('active');

  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

function updateYearlyChart(yearlySummary) {
  const chartDom = document.getElementById('chart');
  const myChart = echarts.init(chartDom);
  const option = {
    
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Awas', 'Siaga', 'Waspada', 'Aman']
    },
    xAxis: {
      type: 'category',
      data: Object.keys(yearlySummary)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Awas',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'red'
        },
        data: Object.keys(yearlySummary).map(year => yearlySummary[year].Awas)
      },
      {
        name: 'Siaga',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'orange'
        },
        data: Object.keys(yearlySummary).map(year => yearlySummary[year].Siaga)
      },
      {
        name: 'Waspada',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'yellow'
        },
        data: Object.keys(yearlySummary).map(year => yearlySummary[year].Waspada)
      },
      {
        name: 'Aman',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'green'
        },
        data: Object.keys(yearlySummary).map(year => yearlySummary[year].Aman)
      }
    ]
  };
  myChart.setOption(option);
}

function updateRegionChart(regionSummary) {
  const chartDomByRegion = document.getElementById('chart-by-region');
  const myChartByRegion = echarts.init(chartDomByRegion);
  const optionByRegion = {
    title: {
      text: 'Jumlah Kasus per Wilayah'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Awas', 'Siaga', 'Waspada', 'Aman']
    },
    xAxis: {
      type: 'category',
      data: Object.keys(regionSummary)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Awas',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'red'
        },
        data: Object.keys(regionSummary).map(region => regionSummary[region].Awas)
      },
      {
        name: 'Siaga',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'orange'
        },
        data: Object.keys(regionSummary).map(region => regionSummary[region].Siaga)
      },
      {
        name: 'Waspada',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'yellow'
        },
        data: Object.keys(regionSummary).map(region => regionSummary[region].Waspada)
      },
      {
        name: 'Aman',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'green'
        },
        data: Object.keys(regionSummary).map(region => regionSummary[region].Aman)
      }
    ]
  };
  myChartByRegion.setOption(optionByRegion);
}

async function kecamatanDetails(namaKecamatan, tahun, lat, lon) {
  const apiUrl = 'http://127.0.0.1:5000/run_k_medoids_combined';

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    console.log('Data fetched successfully:', data);

    if (data[namaKecamatan] && data[namaKecamatan][tahun]) {
      const entry = data[namaKecamatan][tahun];
      const popupContent = `
        <h3>${namaKecamatan} (${tahun})</h3>   
        <p>Status: <strong>${entry.status}</strong></p> 
        <div class="row">
          <div class="col-md-6">
            <table border="1">
              <tr>
                <th colspan="2">Jumlah Kasus per Jenis</th>
              </tr>
              ${Object.entries(entry.jenis).map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`).join('')}
            </table>
          </div>
          <div class="col-md-6">
            <table border="1">
              <tr>
                <th colspan="2">Jumlah Kasus per Usia</th>
              </tr>
              ${Object.entries(entry.usia).map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`).join('')}
            </table>
          </div>
        </div>
      `;

      // Clear existing markers and create a new one for the selected kecamatan
      markers.clearLayers();
      var marker = L.circleMarker([lat, lon], {
        color: severityColors[entry.status],
        radius: 8
      }).addTo(markers)
      .bindPopup(popupContent)
      .openPopup();

      // Set view to the new marker
      map.setView([lat, lon], 9);
    } else {
      console.log(`No data available for ${namaKecamatan} in the year ${tahun}`);
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}
function closeSidebar() {
  document.getElementById("sidebar").style.display = "none";
}

let currentType = '';

function openModalByYear(type, year) {
  currentType = type;
  document.getElementById('modalYear').textContent = year;
  let apiEndpoint = '';
  let orderedKeys = [];
  let headers = '';

  // Clear previous table data and set new headers
  const thead = document.getElementById('dataTable').getElementsByTagName('thead')[0];
  const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  thead.innerHTML = ''; // Clear previous headers
  tbody.innerHTML = ''; // Clear previous data

  if (type === 'jenis') {
      apiEndpoint = `/get_tb_jenis_by_year/${year}`;
      orderedKeys = [
          'Kecamatan',
          'TBC_Paru',
          'TBC_Ekstraparu',
          'TBC_Milier',
          'TBC_Meningitis',
          'TBC_Kelenjar',
          'TBC_Usus',
          'TBC_Tulang',
          'TBC_Kulit',
          'Jumlah',
          'tahun'
      ];
      headers = `
          <tr>
              <th>Kecamatan</th>
              <th>TBC Paru</th>
              <th>TBC Ekstraparu</th>
              <th>TBC Milier</th>
              <th>TBC Meningitis</th>
              <th>TBC Kelenjar</th>
              <th>TBC Usus</th>
              <th>TBC Tulang</th>
              <th>TBC Kulit</th>
              <th>Jumlah</th>
              <th>Tahun</th>
          </tr>
      `;
  } else if (type === 'usia') {
      apiEndpoint = `/get_tb_usia_by_year/${year}`;
      orderedKeys = [
          'Kecamatan',
          'anak_anak',
          'remaja',
          'dewasa',
          'paruh_baya',
          'lansia',
          'jumlah',
          'tahun'
      ];
      headers = `
          <tr>
              <th>Kecamatan</th>
              <th>Anak-Anak</th>
              <th>Remaja</th>
              <th>Dewasa</th>
              <th>Paruh Baya</th>
              <th>Lansia</th>
              <th>Jumlah</th>
              <th>Tahun</th>
          </tr>
      `;
  }

  thead.innerHTML = headers; // Set new headers

  fetch(apiEndpoint)
      .then(response => response.json())
      .then(data => {
          data.forEach(row => {
              const tr = document.createElement('tr');
              orderedKeys.forEach(key => {
                  const td = document.createElement('td');
                  if (['Jumlah', 'Kecamatan', 'tahun'].includes(key)) {
                      td.textContent = row[key];
                  } else {
                      const input = document.createElement('input');
                      input.type = 'number';
                      input.value = row[key];
                      input.classList.add('form-control');
                      td.appendChild(input);
                  }
                  tr.appendChild(td);
              });
              tbody.appendChild(tr);
          });

          $('#dataModal').modal('show');
      })
      .catch(error => console.error('Error fetching data:', error));
}



function saveData() {
  const apiEndpoint = currentType === 'jenis' ? '/save_tb_jenis' : '/save_tb_usia';
  const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  const rows = Array.from(tableBody.getElementsByTagName('tr'));

  const data = rows.map(row => {
      const cells = row.getElementsByTagName('td');
      const inputs = row.getElementsByTagName('input');
      const rowData = {};

      if (currentType === 'jenis') {
          rowData['Kecamatan'] = cells[0].textContent;
          rowData['TBC_Paru'] = inputs[0].value;
          rowData['TBC_Ekstraparu'] = inputs[1].value;
          rowData['TBC_Milier'] = inputs[2].value;
          rowData['TBC_Meningitis'] = inputs[3].value;
          rowData['TBC_Kelenjar'] = inputs[4].value;
          rowData['TBC_Usus'] = inputs[5].value;
          rowData['TBC_Tulang'] = inputs[6].value;
          rowData['TBC_Kulit'] = inputs[7].value;
          rowData['Jumlah'] = cells[9].textContent;
          rowData['Tahun'] = cells[10].textContent;
      } else {
          rowData['Kecamatan'] = cells[0].textContent;
          rowData['anak_anak'] = inputs[0].value;
          rowData['remaja'] = inputs[1].value;
          rowData['dewasa'] = inputs[2].value;
          rowData['paruh_baya'] = inputs[3].value;
          rowData['lansia'] = inputs[4].value;
          rowData['jumlah'] = cells[6].textContent;
          rowData['tahun'] = cells[7].textContent;
      }

      return rowData;
  });

  // Show loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.style.display = 'flex';

  fetch(apiEndpoint, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(result => {
      // Hide loading overlay
      loadingOverlay.style.display = 'none';

      // Wait for 2 seconds before showing success message
      setTimeout(() => {
          alert('Data tersimpan');
      }, 2000);
  })
  .catch(error => {
      console.error('Error saving data:', error);
      // Hide loading overlay
      loadingOverlay.style.display = 'none';
      alert('Error saving data');
  });
}

// JavaScript
document.querySelectorAll('.sublist-toggle').forEach(toggle => {
  toggle.addEventListener('click', function() {
      this.classList.toggle('active');
      let content = this.nextElementSibling;
      if (content.style.display === "block") {
          content.style.display = "none";
      } else {
          content.style.display = "block";
      }
  });
});

function fetchDataAndDisplayCharts() {
  // Fetch data from API
  fetch('http://127.0.0.1:5000/run_k_medoids_combined')
      .then(response => response.json())
      .then(data => {
          const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
          const kecamatans = Object.keys(data);
          
          const jenisAggregated = {};
          const usiaAggregated = {};
          
          // Initialize data structure for aggregation
          years.forEach(year => {
              jenisAggregated[year] = {
                  "TBC_Ekstraparu": 0,
                  "TBC_Kelenjar": 0,
                  "TBC_Kulit": 0,
                  "TBC_Meningitis": 0,
                  "TBC_Milier": 0,
                  "TBC_Paru": 0,
                  "TBC_Tulang": 0,
                  "TBC_Usus": 0
              };
              usiaAggregated[year] = {
                  "anak_anak": 0,
                  "dewasa": 0,
                  "lansia": 0,
                  "paruh_baya": 0,
                  "remaja": 0
              };
          });
          
          // Aggregate data for each Kecamatan
          kecamatans.forEach(kecamatan => {
              years.forEach(year => {
                  if (data[kecamatan][year]) {
                      const jenis = data[kecamatan][year].jenis;
                      const usia = data[kecamatan][year].usia;
                      
                      // Aggregate jenis data
                      Object.keys(jenis).forEach(key => {
                          jenisAggregated[year][key] += jenis[key];
                      });
                      
                      // Aggregate usia data
                      Object.keys(usia).forEach(key => {
                          usiaAggregated[year][key] += usia[key];
                      });
                  }
              });
          });
          
          // Create chart containers
          const jenisChartDiv = document.createElement('div');
          jenisChartDiv.id = `jenisChart`;
          jenisChartDiv.style.width = '800px';
          jenisChartDiv.style.height = '400px';
          document.getElementById('chartsContainer').appendChild(jenisChartDiv);
          
          const usiaChartDiv = document.createElement('div');
          usiaChartDiv.id = `usiaChart`;
          usiaChartDiv.style.width = '800px';
          usiaChartDiv.style.height = '400px';
          document.getElementById('chartsContainer').appendChild(usiaChartDiv);
          
          // Initialize charts
          const jenisChart = echarts.init(jenisChartDiv);
          const usiaChart = echarts.init(usiaChartDiv);
          
          // Prepare data for jenis chart
          const jenisSeries = Object.keys(jenisAggregated["2019"]).map(key => ({
              name: key,
              type: 'bar',
              data: years.map(year => jenisAggregated[year][key])
          }));
          
          // Prepare data for usia chart
          const usiaSeries = Object.keys(usiaAggregated["2019"]).map(key => ({
              name: key,
              type: 'bar',
              data: years.map(year => usiaAggregated[year][key])
          }));
          
          // Set options for jenis chart
          jenisChart.setOption({
              title: {
                  text: 'Jumlah Kasus Berdasarkan Jenis TB',
              },
              tooltip: {},
              legend: {
                  data: Object.keys(jenisAggregated["2019"]),
                  bottom: 0
              },
              xAxis: {
                  type: 'category',
                  data: years,
              },
              yAxis: {
                  type: 'value',
              },
              series: jenisSeries,
          });
          
          // Set options for usia chart
          usiaChart.setOption({
              title: {
                  text: 'Jumlah Kasus Berdasarkan Usia',
              },
              tooltip: {},
              legend: {
                  data: Object.keys(usiaAggregated["2019"]),
                  bottom: 0
              },
              xAxis: {
                  type: 'category',
                  data: years,
              },
              yAxis: {
                  type: 'value',
              },
              series: usiaSeries,
          });
      })
      .catch(error => console.error('Error fetching data:', error));
}

// Initialize the map when the script loads
initializeMap();
loadDataHasil(2024)
fetchDataAndPopulateTableJenis() 
fetchDataAndPopulateTable()
fetchDataAndDisplayCharts()
