from flask import Flask, request, jsonify
import json
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load Dataset
def load_dataset(path):
    output = {}
    output["info"] = []
    dataset = pd.read_csv(path)
    dataset['gender'] = dataset['gender'].astype(int)
    dataset['age'] = dataset['age'].astype(int)
    dataset['currentSmoker'] = dataset['currentSmoker'].astype(int)
    dataset['prevalentStroke'] = dataset['prevalentStroke'].astype(int)
    dataset['prevalentHyp'] = dataset['prevalentHyp'].astype(int)
    dataset['diabetes'] = dataset['diabetes'].astype(int)    
    dataset['TenYearCHD'] = dataset['TenYearCHD'].astype(int)
    # dataset = dataset[:10]
    for _, row in dataset.iterrows():
        data = {}
        data['education'] = row['education']
        data['currentSmoker'] = int(row['currentSmoker'])
        data['cigsPerDay'] = row['cigsPerDay']
        data['BPMeds'] = row['BPMeds']
        data['totChol'] = row['totChol']
        data['sysBP'] = row['sysBP']
        data['diaBP'] = row['diaBP']
        data['BMI'] = row['BMI']
        data['heartRate'] = row['heartRate']
        data['glucose'] = row['glucose']
        data['gender'] = int(row['gender'])
        data['age'] = int(row['age'])
        data['prevalentStroke'] = int(row['prevalentStroke'])
        data['prevalentHyp'] = int(row['prevalentHyp'])
        data['diabetes'] = int(row['diabetes'])
        data['TenYearCHD'] = int(row['TenYearCHD'])
        output["info"].append(data) 
    return output    

# Respond to Client fetchDataset Requests 
@app.route('/fetchDataset', methods=['POST'])
def fetchDataset():
    path = "Dataset/coronaryHeartDiseaseDataset.csv"
    output = load_dataset(path)
    response = jsonify(output)
    response.headers['Access-Control-Allow-Origin']='*'
    return response

if __name__ == '__main__':
    app.run()