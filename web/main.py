from flask import Flask, jsonify, request, render_template
import numpy as np
import pandas as pd
import requests
import json
import os
from urllib.parse import quote

app = Flask(__name__)

# Fungsi untuk menghitung jarak Euclidean
def euclidean_distance(a, b):
    return np.sqrt(np.sum((a - b) ** 2))

# Fungsi K-Medoids
def k_medoids(data, k, max_iter=100):
    m, n = data.shape

    # Langkah 1: Inisialisasi medoid secara acak
    medoids = data[np.random.choice(m, k, replace=False)]

    for _ in range(max_iter):
        # Langkah 2: Menetapkan titik ke medoid terdekat
        clusters = {i: [] for i in range(k)}
        for point in data:
            distances = [euclidean_distance(point, medoid) for medoid in medoids]
            cluster_index = np.argmin(distances)
            clusters[cluster_index].append(point)

        # Langkah 3: Memperbarui medoid
        new_medoids = []
        for cluster_index, points in clusters.items():
            points = np.array(points)
            medoid_index = np.argmin([np.sum([np.sum(euclidean_distance(point, other_point)) for other_point in points]) for point in points])
            new_medoids.append(points[medoid_index])

        new_medoids = np.array(new_medoids)

        # Memeriksa konvergensi
        if np.all(medoids == new_medoids):
            break

        medoids = new_medoids

    return medoids, clusters

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

# Routing untuk menjalankan K-Medoids dan mengembalikan hasil dalam bentuk JSON
@app.route('/run_k_medoids', methods=['POST'])
def run_k_medoids():
    content = request.json
    data_type = content['type']
    data = content['data']

    # Convert data to DataFrame
    df = pd.DataFrame(data)
    
    if data_type == 'jenis_tb':
        # Process data based on 'jenis_tb'
        data_values = df.drop(columns=['Kecamatan', 'Jumlah']).values
    elif data_type == 'tingkat_usia':
        # Process data based on 'tingkat_usia'
        data_values = df.drop(columns=['Kecamatan', 'Jumlah']).values
    else:
        return jsonify({"error": "Invalid data type"}), 400

    k = 3
    medoids, clusters = k_medoids(data_values, k)

    # Load existing coordinates if available
    coordinates_path = "static/coordinates.json"
    coordinates_dict = {}

    if os.path.exists(coordinates_path):
        with open(coordinates_path, 'r') as coord_file:
            coordinates = json.load(coord_file)
        # Convert coordinates list to a dictionary for quick lookup
        coordinates_dict = {coord['kecamatan']: (coord['lat'], coord['lon']) for coord in coordinates}

    results = []

    for cluster_index, points in clusters.items():
        for point in points:
            index = np.where((data_values == point).all(axis=1))[0][0]
            item = data[index]
            if item['Kecamatan'] in coordinates_dict:
                lat, lon = coordinates_dict[item['Kecamatan']]
            else:
                geojson_data = get_geojson(item['Kecamatan'])
                if geojson_data:
                    lat, lon = geojson_data
                    coordinates_dict[item['Kecamatan']] = (lat, lon)
                else:
                    lat, lon = None, None

            result_item = {
                "kecamatan": item['Kecamatan'],
                "lat": lat,
                "lon": lon,
                "jumlah_kasus": item['Jumlah']
            }
            if data_type == 'jenis_tb':
                result_item.update({
                    "Paru": item["Paru"],
                    "Ekstraparu": item["Ekstraparu"],
                    "Milier": item["Milier"],
                    "Meningitis": item["Meningitis"],
                    "Kelenjar": item["Kelenjar"],
                    "Usus": item["Usus"],
                    "Tulang": item["Tulang"],
                    "Kulit": item["Kulit"]
                })
            elif data_type == 'tingkat_usia':
                result_item.update({
                    "Anak-Anak (7-18)": item["Anak-Anak (7-18)"],
                    "Dewasa (23-40)": item["Dewasa (23-40)"],
                    "Lansia (60+)": item["Lansia (60+)"],
                    "Paruh Baya (40-60)": item["Paruh Baya (40-60)"],
                    "Remaja (18-23)": item["Remaja (18-23)"]
                })
            results.append(result_item)

    # Menyimpan koordinat lokasi ke file JSON jika baru
    if not os.path.exists(coordinates_path):
        new_coordinates = [{"kecamatan": kec, "lat": lat, "lon": lon} for kec, (lat, lon) in coordinates_dict.items()]
        with open(coordinates_path, 'w') as coord_file:
            json.dump(new_coordinates, coord_file, indent=4)

    return jsonify(results)

if __name__ == '__main__':
    if not os.path.exists('static'):
        os.makedirs('static')
    app.run(debug=True)
