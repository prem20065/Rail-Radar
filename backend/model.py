import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import os

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, 'train_delay_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')
COLUMNS_PATH = os.path.join(BASE_DIR, 'model_columns.pkl')

df = pd.read_csv(CSV_PATH)

categorical_cols = ['Train_No', 'Station', 'Route', 'Date', 'Scheduled_Time', 'Actual_Time', 'Reason']
df = pd.get_dummies(df, columns=categorical_cols)

X = df.drop('Delay_Minutes', axis=1)
y = df['Delay_Minutes']

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, MODEL_PATH)
joblib.dump(X.columns.tolist(), COLUMNS_PATH)

print("✅ Model training complete.")
 
