from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load model and columns if available
MODEL_PATH = "model.pkl"
COLUMNS_PATH = "model_columns.pkl"
CSV_PATH = "train_delay_data.csv"

try:
    model = joblib.load(MODEL_PATH)
    model_columns = joblib.load(COLUMNS_PATH)
except Exception:
    print("Model files not found. Please train the model first.")
    model = None
    model_columns = None

@app.route('/')
def home():
    return "RailRadar API is running."

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        df = pd.read_csv(CSV_PATH)
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    try:
        df = pd.read_csv(CSV_PATH)
        total_delays = len(df)
        avg_delay = round(df['Delay_Minutes'].mean(), 2)
        affected_trains = df['Train_No'].nunique()
        affected_stations = df['Station'].nunique()
        return jsonify({
            "total_delays": total_delays,
            "avg_delay": avg_delay,
            "affected_trains": affected_trains,
            "affected_stations": affected_stations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None or model_columns is None:
        return jsonify({"error": "Model not available. Please train the model first."}), 500
    try:
        data = request.get_json()
        df = pd.DataFrame([data])
        # One-hot encode using model columns
        df = pd.get_dummies(df)
        missing_cols = set(model_columns) - set(df.columns)
        for col in missing_cols:
            df[col] = 0
        df = df[model_columns]
        prediction = model.predict(df)[0]
        return jsonify({"predicted_delay": round(prediction, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)