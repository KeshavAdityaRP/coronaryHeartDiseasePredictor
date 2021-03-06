from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.cluster import KMeans
from scipy.spatial import distance
from sklearn.manifold import MDS
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import time

def performRandomSampling(dataset):
    count_row = dataset.shape[0]
    numberOfSamplesNeeded = int(0.25 * count_row)
    chosen_idx = np.random.choice(count_row, replace=False, size=numberOfSamplesNeeded)
    dataset = dataset.iloc[chosen_idx]
    # print (dataset.shape[0])
    return dataset

def performOneHotEncoding(dataset, feature):
    dataset = pd.get_dummies(dataset,prefix=[feature])
    return dataset

def dropTargetColoumnFromDataset(dataset, feature):
    dataset = dataset.drop(feature, 1)
    return dataset

def performStandardisation(dataset):
    dataset = pd.DataFrame(StandardScaler().fit_transform(dataset),columns = dataset.columns)
    # print (dataset.head)
    # print (dataset.dtypes)
    return dataset

def OptimiseKForKMeansByElbowPlot(dataset):
    dataset_array = dataset.values
    sumOfSquaredDistances = []
    K = range(1,30)
    for k in K:
        km = KMeans(n_clusters=k)
        km = km.fit(dataset_array)
        sumOfSquaredDistances.append(km.inertia_)
    plt.plot(K, sumOfSquaredDistances, 'bx-')
    plt.xlabel('k')
    plt.ylabel('sum of squared distances')
    plt.title('Elbow Method for optimal k')
    plt.show()  
    # The elbow seems to be near 2 : Hence we should consider going in for k = 2  

def performKMeans(dataset):
    # print (dataset.index)
    numberOfCluster = 9
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
    print ('pre')
    print (dataset[feature].value_counts())
    # count_row = dataset.shape[0]
    # numberOfSamplesNeededFromDataset = int(0.25 * count_row)
    # numberOfSamplesNeededFromEachStrata = int(numberOfSamplesNeededFromDataset / numberOfCluster)
    # dataset = dataset.groupby(feature, group_keys=False).apply(lambda x: x.sample(min(len(x), numberOfSamplesNeededFromEachStrata)))
    dataset, _ = train_test_split(dataset, train_size = 0.25, stratify=dataset[feature])
    # print (dataset.shape[0])
    print ('post')
    print (dataset[feature].value_counts())
    dataset = dataset.drop(feature, 1)
    return dataset

def calculateCumulativeSum(percentages):
    aggregator = 0
    cumulativeSum = []
    for x in percentages:
        aggregator += x
        cumulativeSum.append(aggregator)
    return cumulativeSum

def findTheThreeAttributesWithHighestPcaLoadings(values, dataset):
    output = {}
    output["graph"] = []
    selection = 3
    values = list(values)
    print (values)
    print (dataset.shape)
    setValues = frozenset(values)
    sortedValues = list(sorted(setValues, reverse=True))
    topFeturePositions = []
    for i in range(0,selection):
        topFeturePositions.append(values.index(sortedValues[i]))
    print (topFeturePositions)
    # print (dataset.head)
    # topPacLoadingAttributes= {}
    # for position in topFeturePositions:
    #     topPacLoadingAttributes[dataset.columns.values[position]] = dataset.iloc[:, [position]].values.T[0]
    for _, row in dataset.iterrows():
        data = {}
        data[dataset.columns.values[topFeturePositions[0]]] = row[topFeturePositions[0]]
        data[dataset.columns.values[topFeturePositions[1]]] = row[topFeturePositions[1]]
        data[dataset.columns.values[topFeturePositions[2]]] = row[topFeturePositions[2]]
        output["graph"].append(data)
    # print (topPacLoadingAttributes)
    return output

def findTop3(pca, dataset):
    print (list(dataset.columns.values))
    print ("Loading")
    selection = 3
    loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
    # print (len(loadings), len(loadings[0]))
    sumOfSquaredLoading = []
    for loading in loadings:
        loading = [i**2 for i in loading]
        sumOfSquaredLoading.append(sum(loading))
    print (sumOfSquaredLoading)
    setValues = frozenset(sumOfSquaredLoading)
    sortedValues = list(sorted(setValues, reverse=True))
    topFeturePositions = []
    for i in range(0,selection):
        topFeturePositions.append(sumOfSquaredLoading.index(sortedValues[i]))
    print (topFeturePositions)
    for _, row in dataset.iterrows():
        data = {}
        data[dataset.columns.values[topFeturePositions[0]]] = row[topFeturePositions[0]]
        data[dataset.columns.values[topFeturePositions[1]]] = row[topFeturePositions[1]]
        data[dataset.columns.values[topFeturePositions[2]]] = row[topFeturePositions[2]]
        output["graph"].append(data)
    # print (topPacLoadingAttributes)
    return output


def performPCA(dataset, title):
    count_columns = dataset.shape[1]
    listOfPrincipalComponents = [i for i in range(1,count_columns+1)]
    dataset_array = dataset.values
    pca = PCA(n_components=count_columns)
    principalComponents_x = pca.fit_transform(dataset_array)
    eigenValues = pca.explained_variance_
    # print ("eigen values aka intrinsic dimensionality - Explanied Varience")
    # print (eigenValues)
    sumEigenValues = np.sum(eigenValues)
    eigenValuesPercentages = [((eigenValue / sumEigenValues) * 100 ) for eigenValue in eigenValues]
    print ("eigen Values Percentages")
    print (eigenValuesPercentages)
    # print (np.sum(eigenValuesPercentages))
    cumulativeSum = calculateCumulativeSum(eigenValuesPercentages)
    plt.plot(listOfPrincipalComponents, eigenValuesPercentages, 'bx-')
    plt.plot(listOfPrincipalComponents, cumulativeSum)
    plt.xticks(np.arange(0, len(listOfPrincipalComponents) + 1, 1.0))
    plt.yticks(np.arange(0, 110, 10))
    plt.xlabel('Principal Component')
    plt.ylabel('Varience Explained')
    plt.title('Scree Plot : ' + title)
    # plt.show() 
    # amount of variance does each PC
    # print ("amount of variance does each PC == eigen Values Percentages")
    # print (pca.explained_variance_ratio_)
    pca1 = abs( pca.components_[0])
    print ("pca.components_= [n_components, n_features]")
    print (pca1)
    findTop3(pca, dataset)
    # findTheThreeAttributesWithHighestPcaLoadings(pca1, dataset)

def performDissimilarityMatrixCreation(dataset, dissimilarityType):
    start = time.time()
    # print (dataset.shape)
    output = {}
    output["graph"] = []
    print ("hh")
    values = dataset.values
    # print (len(values), len(values[0]))    
    dissimilarityMatrix = distance.cdist(values, values, dissimilarityType)
    print ("here")
    # print (len(dissimilarityMatrix), len(dissimilarityMatrix[0]))
    embedding = MDS(n_components=2, dissimilarity='precomputed')
    print ("ll")
    mdsMatrix = embedding.fit_transform(dissimilarityMatrix) 
    print ("kk")
    end = time.time()
    print(end - start)
    for row in  mdsMatrix:
        data = {}
        data["mdsDimensionX"] = row[0]
        data["mdsDimensionY"] = row[1] 
        output["graph"].append(data)
    print ('lol')  
    # plt.scatter(mdsMatrix[:,0], mdsMatrix[:,1])
    # plt.show() 

# Load Dataset
def load_dataset(path):
    output = {}
    output["info"] = []
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

    # for _, row in dataset.iterrows():
    #     data = {}
    #     data['education'] = row['education']
    #     data['currentSmoker'] = int(row['currentSmoker'])
    #     data['cigsPerDay'] = row['cigsPerDay']
    #     data['BPMeds'] = row['BPMeds']
    #     data['totChol'] = row['totChol']
    #     data['sysBP'] = row['sysBP']
    #     data['diaBP'] = row['diaBP']
    #     data['BMI'] = row['BMI']
    #     data['heartRate'] = row['heartRate']
    #     data['glucose'] = row['glucose']
    #     data['gender'] = int(row['gender'])
    #     data['age'] = int(row['age'])
    #     data['prevalentStroke'] = int(row['prevalentStroke'])
    #     data['prevalentHyp'] = int(row['prevalentHyp'])
    #     data['diabetes'] = int(row['diabetes'])
    #     data['TenYearCHD'] = int(row['TenYearCHD'])
    #     output["info"].append(data) 
    # return output  

path = "Dataset/coronaryHeartDiseaseDataset.csv"
dataset = load_dataset(path)
datasetRandomSampled = performRandomSampling(dataset)
# print (datasetRandomSampled.head)
# performDissimilarityMatrixCreation(dataset, 'correlation')
# performDissimilarityMatrixCreation(datasetRandomSampled, 'euclidean')
# OptimiseKForKMeansByElbowPlot(dataset)
# datasetAfterKMeans, numberOfCluster = performKMeans(dataset)
# datasetStratified = perfromStratifiedSampling(datasetAfterKMeans, "clusterLabel", numberOfCluster)
# performPCA(dataset, "For Original Dataset")
performPCA(datasetRandomSampled, "For Random Sampled Dataset")
# performPCA(datasetStratified, "For Stratified Dataset")
