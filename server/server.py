from flask import Flask, request, jsonify
import json
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from scipy.spatial import distance
from sklearn.manifold import MDS
import time

app = Flask(__name__)

dataset, datasetRandomSampled, datasetStratified = None, None, None 

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

def findTheThreeAttributesWithHighestPcaLoadings(values, dataset, title):
    output = {}
    output["graph"] = []
    output["title"] = "Top Three Attributes with Highest PCA Loadings " + title
    selection = 3
    values = list(values)
    setValues = frozenset(values)
    sortedValues = list(sorted(setValues, reverse=True))
    topFeturePositions = []
    for i in range(0,selection):
        topFeturePositions.append(values.index(sortedValues[i]))
    # print (topFeturePositions)
    for _, row in dataset.iterrows():
        data = {}
        data[dataset.columns.values[topFeturePositions[0]]] = row[topFeturePositions[0]]
        data[dataset.columns.values[topFeturePositions[1]]] = row[topFeturePositions[1]]
        data[dataset.columns.values[topFeturePositions[2]]] = row[topFeturePositions[2]]
        output["graph"].append(data)
    return output

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
    pca1 = abs( pca.components_[0])
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
    output3 = findTheThreeAttributesWithHighestPcaLoadings(pca1, dataset, title)
    return output1, output2, output3

def performDissimilarityMatrixCreation(dataset, dissimilarityType, title):
    output = {}
    output["title"] = 'MDS 2D Scatter Plot ' + title
    output["graph"] = []
    values = dataset.values
    dissimilarityMatrix = distance.cdist(values, values, dissimilarityType)
    embedding = MDS(n_components=2, dissimilarity='precomputed')
    mdsMatrix = embedding.fit_transform(dissimilarityMatrix)
    for row in  mdsMatrix:
        data = {}
        data["mdsDimensionX"] = row[0]
        data["mdsDimensionY"] = row[1] 
        output["graph"].append(data) 
    return output 

def mdsBasedOnChosenOption(chosenOption):
    output = {}
    global dataset, datasetRandomSampled, datasetStratified
    if chosenOption == "randomSampledDatasetMdsEuclidian":
        output[chosenOption] = performDissimilarityMatrixCreation(datasetRandomSampled, 'euclidean', 'Using Euclidian For Random Sampled Dataset')
    elif  chosenOption == "randomSampledDatasetMdsCorrelation":
        output[chosenOption] = performDissimilarityMatrixCreation(datasetRandomSampled, 'correlation', 'Using Correlation For Random Sampled Dataset')
    elif  chosenOption == "stratifiedSampledMdsEuclidian":
        output[chosenOption] = performDissimilarityMatrixCreation(datasetStratified, 'euclidean', 'Using Euclidian For Stratified Sampled Dataset')
    elif  chosenOption == "stratifiedSampledMdsCorrelation":
        output[chosenOption] = performDissimilarityMatrixCreation(datasetStratified, 'correlation', 'Using Correlation For Stratified Sampled Dataset')
    elif  chosenOption == "originalDatasetMdsEuclidian":
        output[chosenOption] = performDissimilarityMatrixCreation(dataset, 'euclidean', 'Using Euclidian For Original Dataset')
    elif  chosenOption == "originalDatasetMdsCorrelation":
        output[chosenOption] = performDissimilarityMatrixCreation(dataset, 'correlation', 'Using Correlation For Original Dataset')
    return output

# Respond to Client for MSD data Requests
@app.route('/fetchMdsData', methods=['POST'])
def fetchMdsData():
    start = time.time()
    chosenOption = request.form['chosenOption']
    print (chosenOption, "Mds Function Request Received")
    # output["originalDatasetMdsEuclidian"] = performDissimilarityMatrixCreation(dataset, 'euclidean', 'For Original Dataset')
    output = mdsBasedOnChosenOption(chosenOption)
    response = jsonify(output)
    response.headers['Access-Control-Allow-Origin']='*'
    end = time.time()
    print (chosenOption, "Mds Function Response Ready - Time Taken : ", end - start)
    return response

# Respond to Client fetchData Requests 
@app.route('/fetchData', methods=['POST'])
def fetchData():
    global dataset, datasetRandomSampled, datasetStratified
    output = {}
    path = "Dataset/coronaryHeartDiseaseDataset.csv"
    dataset = load_dataset(path)
    datasetRandomSampled = performRandomSampling(dataset)
    datasetAfterKMeans, numberOfCluster = performKMeans(dataset)
    datasetStratified = perfromStratifiedSampling(datasetAfterKMeans, "clusterLabel", numberOfCluster)
    output["originalDatasetScreePlot"], output["originalDataset2dScatterPlot"], output["originalDatasetTop3Attributes"] = performPCA(dataset, "For Original Dataset")
    output["randomSampledDatasetScreePlot"], output["randomSampledDataset2dScatterPlot"], output["randomSampledDatasetTop3Attributes"] = performPCA(datasetRandomSampled, "For Random Sampled Dataset")
    output["stratifiedSampledDatasetScreePlot"], output["stratifiedSampledDataset2dScatterPlot"], output["stratifiedSampledTop3Attributes"] = performPCA(datasetStratified, "For Stratified Dataset")
    # output["originalDatasetMdsEuclidian"], output["originalDatasetMdsCorrelation"] = performDissimilarityMatrixCreation(dataset, 'euclidean', 'For Original Dataset'), performDissimilarityMatrixCreation(dataset, 'correlation', 'For Original Dataset')
    response = jsonify(output)
    response.headers['Access-Control-Allow-Origin']='*'
    return response

if __name__ == '__main__':
    app.run()