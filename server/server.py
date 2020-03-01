from flask import Flask, request, jsonify
import json
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

app = Flask(__name__)

def performRandomSampling(dataset):
    count_row = dataset.shape[0]
    numberOfSamplesNeeded = int(0.25 * count_row)
    chosen_idx = np.random.choice(count_row, replace=False, size=numberOfSamplesNeeded)
    dataset = dataset.iloc[chosen_idx]
    return dataset

def performOneHotEncoding(dataset, feature):
    dataset = pd.get_dummies(dataset,prefix=[feature])
    return dataset

def dropTargetColoumnFromDataset(dataset, feature):
    dataset = dataset.drop(feature, 1)
    return dataset

def performStandardisation(dataset):
    dataset = pd.DataFrame(StandardScaler().fit_transform(dataset),columns = dataset.columns)
    return dataset

def calculateCumulativeSum(percentages):
    aggregator = 0
    cumulativeSum = []
    for x in percentages:
        aggregator += x
        cumulativeSum.append(aggregator)
    return cumulativeSum

def makeDatasetTransferrable(dataset):
    output = {}
    output["info"] = []
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

def load_dataset(path): 
    dataset = pd.read_csv(path)
    dataset['education'] = dataset['education'].astype(str)
    dataset['gender'] = dataset['gender'].astype(int)
    dataset['age'] = dataset['age'].astype(int)
    dataset['currentSmoker'] = dataset['currentSmoker'].astype(int)
    dataset['prevalentStroke'] = dataset['prevalentStroke'].astype(int)
    dataset['prevalentHyp'] = dataset['prevalentHyp'].astype(int)
    dataset['diabetes'] = dataset['diabetes'].astype(int)    
    dataset['TenYearCHD'] = dataset['TenYearCHD'].astype(int)
    dataset = dropTargetColoumnFromDataset(dataset, "TenYearCHD")
    dataset = performOneHotEncoding(dataset, "education")
    dataset = dataset.astype(float)
    dataset = performStandardisation(dataset)
    return dataset
    # dataset = dataset[:10]

def performKMeans(dataset):
    # print (dataset.index)
    numberOfCluster = 2
    dataset_array = dataset.values
    km = KMeans(n_clusters=numberOfCluster)
    km.fit(dataset_array)
    labels = km.labels_
    # print (labels)
    results = pd.DataFrame(data=labels, columns=["clusterLabel"])
    # results = pd.DataFrame([dataset.index,labels]).T
    # print (results.head)
    dataset = dataset.join(results)
    # print (dataset.iloc[0])
    return dataset, numberOfCluster   

def perfromStratifiedSampling(dataset, feature, numberOfCluster):
    count_row = dataset.shape[0]
    numberOfSamplesNeededFromDataset = int(0.25 * count_row)
    numberOfSamplesNeededFromEachStrata = int(numberOfSamplesNeededFromDataset / numberOfCluster)
    dataset = dataset.groupby(feature, group_keys=False).apply(lambda x: x.sample(min(len(x), numberOfSamplesNeededFromEachStrata)))
    # print (dataset.shape[0])
    # print (dataset[feature].value_counts())
    dataset = dataset.drop(feature, 1)
    return dataset

def performPCA(dataset, title):
    output1, output2 = {}, {}
    output1["title"] = 'Scree Plot ' + title
    output2["title"] = 'Top 2 PCA Vectors Scatter Plot'
    output1["graph"] = []
    output2["graph"] = []
    count_columns = dataset.shape[1]
    listOfPrincipalComponents = [i for i in range(1,count_columns+1)]
    dataset_array = dataset.values
    pca = PCA(n_components=count_columns)
    principalComponents_x = pca.fit_transform(dataset_array)
    for principalComponents in principalComponents_x:
        data = {}
        data["principalComponent1"] = principalComponents[0]
        data["principalComponent2"] = principalComponents[1]
        output2["graph"].append(data)
    eigenValues = pca.explained_variance_
    # print ("eigen values aka intrinsic dimensionality - Explanied Varience")
    # print (eigenValues)
    sumEigenValues = np.sum(eigenValues)
    eigenValuesPercentages = [((eigenValue / sumEigenValues) * 100 ) for eigenValue in eigenValues]
    # print ("eigen Values Percentages")
    # print (eigenValuesPercentages)
    # print (np.sum(eigenValuesPercentages))
    cumulativeSums = calculateCumulativeSum(eigenValuesPercentages)
    # plt.plot(listOfPrincipalComponents, eigenValuesPercentages, 'bx-')
    # plt.plot(listOfPrincipalComponents, cumulativeSum)
    # plt.xticks(np.arange(0, len(listOfPrincipalComponents) + 1, 1.0))
    # plt.yticks(np.arange(0, 110, 10))
    # plt.xlabel('Principal Component')
    # plt.ylabel('Varience Explained')
    # plt.title('Scree Plot : ' + title)
    # plt.show() 
    for principalComponent, eigenValuePercentage, cumulativeSum in zip(listOfPrincipalComponents, eigenValuesPercentages, cumulativeSums):
        data = {}
        data["principalComponent"] = principalComponent
        data["eigenValuePercentage"] = round(eigenValuePercentage, 3)
        data["cumulativeSum"] = round(cumulativeSum,3)
        output1["graph"].append(data)
    return output1, output2

    # amount of variance does each PC
    # print ("amount of variance does each PC == eigen Values Percentages")
    # print (pca.explained_variance_ratio_)
    # pca1 = abs( pca.components_[0])
    # print ("pca.components_= [n_components, n_features]")
    # print (pca1)
    # findTheThreeAttributesWithHighestPcaLoadings(pca1, dataset)

# Respond to Client fetchData Requests 
@app.route('/fetchData', methods=['POST'])
def fetchData():
    output = {}
    path = "Dataset/coronaryHeartDiseaseDataset.csv"
    dataset = load_dataset(path)
    datasetRandomSampled = performRandomSampling(dataset)
    datasetAfterKMeans, numberOfCluster = performKMeans(dataset)
    datasetStratified = perfromStratifiedSampling(datasetAfterKMeans, "clusterLabel", numberOfCluster)
    output["originalDatasetScreePlot"], output["originalDataset2dScatterPlot"] = performPCA(dataset, "For Original Dataset")
    output["randomSampledDatasetScreePlot"], output["randomSampledDataset2dScatterPlot"] = performPCA(datasetRandomSampled, "For Random Sampled Dataset")
    output["stratifiedSampledDatasetScreePlot"], output["stratifiedSampledDataset2dScatterPlot"] = performPCA(datasetStratified, "For Stratified Dataset")
    response = jsonify(output)
    response.headers['Access-Control-Allow-Origin']='*'
    return response

if __name__ == '__main__':
    app.run()