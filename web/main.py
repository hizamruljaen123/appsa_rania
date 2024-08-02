from flask import Flask, jsonify, request, render_template
import numpy as np
import pandas as pd
import requests
import json
import os
from urllib.parse import quote
import mysql.connector

app = Flask(__name__)

# Konfigurasi koneksi database MySQL
db_config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'tbc_kmedoids'
}

# Fungsi untuk menghitung jarak Euclidean
def euclidean_distance(a, b):
    return np.sqrt(np.sum((a - b) ** 2))

# Fungsi K-Medoids yang telah diperbaiki
def k_medoids(data, k, max_iter=100):
    m, n = data.shape
    
    # Choose initial medoids randomly
    medoid_indices = np.random.choice(m, k, replace=False)
    medoids = data[medoid_indices]
    
    for _ in range(max_iter):
        # Assign points to clusters
        clusters = [[] for _ in range(k)]
        for i, point in enumerate(data):
            distances = [euclidean_distance(point, medoid) for medoid in medoids]
            cluster_index = np.argmin(distances)
            clusters[cluster_index].append(i)
        
        # Update medoids
        new_medoid_indices = []
        for i, cluster in enumerate(clusters):
            if not cluster:  # Handle empty clusters
                new_medoid_indices.append(medoid_indices[i])
                continue
            
            cluster_points = data[cluster]
            costs = [sum(euclidean_distance(data[c], p) for c in cluster) for p in cluster_points]
            new_medoid_index = cluster[np.argmin(costs)]
            new_medoid_indices.append(new_medoid_index)
        
        # Check for convergence
        if set(medoid_indices) == set(new_medoid_indices):
            break
        
        medoid_indices = new_medoid_indices
        medoids = data[medoid_indices]
    
    # Final assignment of points to clusters
    final_clusters = [[] for _ in range(k)]
    for i, point in enumerate(data):
        distances = [euclidean_distance(point, medoid) for medoid in medoids]
        cluster_index = np.argmin(distances)
        final_clusters[cluster_index].append(i)
    
    return medoids, final_clusters

# Fungsi untuk memproses data dan menjalankan K-medoids
def process_data_for_k_medoids(df_combined, k):
    # Select relevant columns for clustering
    columns_to_use = ['TBC_Paru', 'TBC_Ekstraparu', 'TBC_Milier', 'TBC_Meningitis', 'TBC_Kelenjar', 'TBC_Usus', 'TBC_Tulang', 'TBC_Kulit', 'anak_anak', 'remaja', 'dewasa', 'paruh_baya', 'lansia']
    data_for_clustering = df_combined[columns_to_use].values
    
    # Normalize the data
    data_normalized = (data_for_clustering - np.min(data_for_clustering, axis=0)) / (np.max(data_for_clustering, axis=0) - np.min(data_for_clustering, axis=0))
    
    # Run K-medoids
    medoids, clusters = k_medoids(data_normalized, k)
    
    # Assign cluster labels to the original data
    cluster_labels = np.zeros(len(df_combined), dtype=int)
    for i, cluster in enumerate(clusters):
        for point in cluster:
            cluster_labels[point] = i
    
    df_combined['cluster'] = cluster_labels
    
    return df_combined, medoids

# Fungsi untuk klasifikasi tingkat keparahan
def classify_severity(value):
    if value < 20:
        return 'Aman'
    elif value < 40:
        return 'Waspada'
    elif value < 60:
        return 'Siaga'
    else:
        return 'Awas'

# Fungsi untuk mendapatkan data GeoJSON
def get_geojson(kecamatan):
    if ' ' not in kecamatan:
        full_kecamatan = f"{kecamatan}"
    else:
        full_kecamatan = kecamatan
    encoded_kecamatan = quote(full_kecamatan)
    url = f"https://nominatim.openstreetmap.org/search?city={encoded_kecamatan}&format=geojson"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    print(f"Sedang mendapatkan data untuk kecamatan: {full_kecamatan}, URL: {url}")
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        response_json = response.json()
        if response_json and 'features' in response_json:
            features = response_json['features']
            for feature in features:
                if "Tamiang" in feature['properties']['display_name']:
                    if 'geometry' in feature and 'coordinates' in feature['geometry']:
                        return feature['geometry']['coordinates']
    return None

# Routing untuk halaman utama
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run_k_medoids_combined', methods=['GET'])
def run_k_medoids_combined():
    k = int(request.args.get('k', 3))
    tahun = request.args.get('tahun', None)
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Ambil data dari tabel tb_jenis
        query_jenis = "SELECT * FROM tb_jenis"
        cursor.execute(query_jenis)
        data_jenis = cursor.fetchall()

        # Ambil data dari tabel tb_usia
        query_usia = "SELECT * FROM tb_usia"
        cursor.execute(query_usia)
        data_usia = cursor.fetchall()
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    df_jenis = pd.DataFrame(data_jenis)
    df_usia = pd.DataFrame(data_usia)
    
    # Gabungkan data berdasarkan kecamatan dan tahun
    df_combined = pd.merge(df_jenis, df_usia, on=['Kecamatan', 'tahun'], how='outer')

    # Proses data dan jalankan K-medoids
    df_clustered, medoids = process_data_for_k_medoids(df_combined, k)

    coordinates_path = "static/coordinates.json"
    coordinates_dict = {}

    if os.path.exists(coordinates_path):
        with open(coordinates_path, 'r') as coord_file:
            coordinates = json.load(coord_file)
        coordinates_dict = {coord['kecamatan']: (coord['lat'], coord['lon']) for coord in coordinates}

    results = {}

    for index, row in df_clustered.iterrows():
        kecamatan = row['Kecamatan']
        year = row['tahun']
        cluster = row['cluster']
        
        if pd.isna(kecamatan) or pd.isna(year):
            continue

        if kecamatan not in results:
            results[kecamatan] = {}
        
        if year not in results[kecamatan]:
            results[kecamatan][year] = {
                "usia": {col: 0 for col in ['anak_anak', 'remaja', 'dewasa', 'paruh_baya', 'lansia']},
                "jenis": {col: 0 for col in ['TBC_Paru', 'TBC_Ekstraparu', 'TBC_Milier', 'TBC_Meningitis', 'TBC_Kelenjar', 'TBC_Usus', 'TBC_Tulang', 'TBC_Kulit']},
                "status": "",
                "lat": None,
                "lon": None,
                "cluster": int(cluster)
            }

        for col in ['anak_anak', 'remaja', 'dewasa', 'paruh_baya', 'lansia']:
            if not pd.isna(row[col]):
                results[kecamatan][year]["usia"][col] = int(row[col])

        for col in ['TBC_Paru', 'TBC_Ekstraparu', 'TBC_Milier', 'TBC_Meningitis', 'TBC_Kelenjar', 'TBC_Usus', 'TBC_Tulang', 'TBC_Kulit']:
            if not pd.isna(row[col]):
                results[kecamatan][year]["jenis"][col] = int(row[col])

        # Update latitude and longitude
        if kecamatan in coordinates_dict:
            results[kecamatan][year]["lat"] = coordinates_dict[kecamatan][0]
            results[kecamatan][year]["lon"] = coordinates_dict[kecamatan][1]
        else:
            geojson_data = get_geojson(kecamatan)
            if geojson_data:
                lat, lon = geojson_data
                coordinates_dict[kecamatan] = (lat, lon)
                results[kecamatan][year]["lat"] = lat
                results[kecamatan][year]["lon"] = lon

        # Determine severity
        total_cases = sum(results[kecamatan][year]["usia"].values()) + sum(results[kecamatan][year]["jenis"].values())
        results[kecamatan][year]["status"] = classify_severity(total_cases)

    if not os.path.exists(coordinates_path):
        new_coordinates = [{"kecamatan": kec, "lat": lat, "lon": lon} for kec, (lat, lon) in coordinates_dict.items()]
        with open(coordinates_path, 'w') as coord_file:
            json.dump(new_coordinates, coord_file, indent=4)

    return jsonify(results)

# Routing untuk mengambil data dari tabel tb_usia
@app.route('/get_tb_usia', methods=['GET'])
def get_tb_usia():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM tb_usia"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Routing untuk mengambil data dari tabel tb_jenis
@app.route('/get_tb_jenis', methods=['GET'])
def get_tb_jenis():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM tb_jenis"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    
@app.route('/get_tb_usia_by_year/<int:year>', methods=['GET'])
def get_tb_usia_by_year(year):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM tb_usia WHERE tahun = %s"
        cursor.execute(query, (year,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Routing untuk mengambil data dari tabel tb_jenis berdasarkan parameter tahun
@app.route('/get_tb_jenis_by_year/<int:year>', methods=['GET'])
def get_tb_jenis_by_year(year):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM tb_jenis WHERE tahun = %s"
        cursor.execute(query, (year,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
@app.route('/save_tb_usia', methods=['POST'])
def save_tb_usia():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        query = """
            INSERT INTO tb_usia (Kecamatan, anak_anak, remaja, dewasa, paruh_baya, lansia, jumlah, tahun)
            VALUES (%(Kecamatan)s, %(anak_anak)s, %(remaja)s, %(dewasa)s, %(paruh_baya)s, %(lansia)s, %(jumlah)s, %(tahun)s)
            ON DUPLICATE KEY UPDATE
                anak_anak = VALUES(anak_anak),
                remaja = VALUES(remaja),
                dewasa = VALUES(dewasa),
                paruh_baya = VALUES(paruh_baya),
                lansia = VALUES(lansia),
                jumlah = VALUES(jumlah)
        """
        cursor.executemany(query, data)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500


@app.route('/save_tb_jenis', methods=['POST'])
def save_tb_jenis():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        query = """
            INSERT INTO tb_jenis (Kecamatan, TBC_Paru, TBC_Ekstraparu, TBC_Milier, TBC_Meningitis, TBC_Kelenjar, TBC_Usus, TBC_Tulang, TBC_Kulit, Jumlah, Tahun)
            VALUES (%(Kecamatan)s, %(TBC_Paru)s, %(TBC_Ekstraparu)s, %(TBC_Milier)s, %(TBC_Meningitis)s, %(TBC_Kelenjar)s, %(TBC_Usus)s, %(TBC_Tulang)s, %(TBC_Kulit)s, %(Jumlah)s, %(Tahun)s)
            ON DUPLICATE KEY UPDATE
                TBC_Paru = VALUES(TBC_Paru),
                TBC_Ekstraparu = VALUES(TBC_Ekstraparu),
                TBC_Milier = VALUES(TBC_Milier),
                TBC_Meningitis = VALUES(TBC_Meningitis),
                TBC_Kelenjar = VALUES(TBC_Kelenjar),
                TBC_Usus = VALUES(TBC_Usus),
                TBC_Tulang = VALUES(TBC_Tulang),
                TBC_Kulit = VALUES(TBC_Kulit),
                Jumlah = VALUES(Jumlah)
        """
        cursor.executemany(query, data)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True)