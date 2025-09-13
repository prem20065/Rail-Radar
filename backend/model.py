import pandas as pd
import joblib
import os

from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.cluster import KMeans

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, 'train_delay_data.csv')

df = pd.read_csv(CSV_PATH)

categorical_cols = ['Train_No', 'Station', 'Route', 'Date', 'Scheduled_Time', 'Actual_Time', 'Reason']
df_encoded = pd.get_dummies(df, columns=categorical_cols)

X = df_encoded.drop('Delay_Minutes', axis=1)
y = df_encoded['Delay_Minutes']

# Linear Regression
linreg = LinearRegression()
linreg.fit(X, y)
joblib.dump(linreg, os.path.join(BASE_DIR, 'model_linreg.pkl'))

# Random Forest
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X, y)
joblib.dump(rf, os.path.join(BASE_DIR, 'model_rf.pkl'))

# Gradient Boosting
gb = GradientBoostingRegressor(n_estimators=100, random_state=42)
gb.fit(X, y)
joblib.dump(gb, os.path.join(BASE_DIR, 'model_gb.pkl'))

# Support Vector Regression
svr = SVR()
svr.fit(X, y)
joblib.dump(svr, os.path.join(BASE_DIR, 'model_svr.pkl'))

# Logistic Regression (for classification: e.g., delay > 15 min)
y_class = (y > 15).astype(int)  # 1 if delayed, 0 if not
logreg = LogisticRegression()
logreg.fit(X, y_class)
joblib.dump(logreg, os.path.join(BASE_DIR, 'model_logreg.pkl'))

# KMeans Clustering (grouping delay patterns)
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X)
joblib.dump(kmeans, os.path.join(BASE_DIR, 'model_kmeans.pkl'))

# Save columns for prediction
joblib.dump(X.columns.tolist(), os.path.join(BASE_DIR, 'model_columns.pkl'))

print("✅ All models trained and saved.")