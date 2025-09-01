from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load model and columns
try:
    model = joblib.load("model.pkl")
    model_columns = joblib.load("model_columns.pkl")
except FileNotFoundError as e:
    print("Model files not found. Please train the model first.")
    model = None
    model_columns = None

@app.route('/')
def home():
    return jsonify({"message": "RailRadar API is running"}), 200

# Prediction route
@app.route('/api/predict', methods=['GET', 'POST'])
def predict():
    if model is None or model_columns is None:
        return jsonify({"error": "Model not loaded"}), 500

    if request.method == 'GET':
        # Sample response for testing in browser
        sample_data = {
            "Train_No": 12345,
            "Station": "Chennai Central",
            "Route": "Chennai-Bangalore",
            "Scheduled_Time": "10:30",
            "Actual_Time": "10:50",
            "Date": "2025-08-13",
            "Reason": "Signal Failure"
        }
        return jsonify({
            "input": sample_data,
            "predicted_delay_minutes": 20
        })

    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400

            # Convert to DataFrame and match model columns
            query_df = pd.DataFrame([data])
            query_df = pd.get_dummies(query_df)
            query_df = query_df.reindex(columns=model_columns, fill_value=0)

            prediction = model.predict(query_df)[0]

            return jsonify({
                "input": data,
                "predicted_delay_minutes": prediction
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
