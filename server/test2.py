from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

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
    K = range(1,11)
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

def calculateCumulativeSum(percentages):
    aggregator = 0
    cumulativeSum = []
    for x in percentages:
        aggregator += x
        cumulativeSum.append(aggregator)
    return cumulativeSum

def findTheThreeAttributesWithHighestPcaLoadings(values, dataset):
    selection = 3
    values = list(values)
    setValues = frozenset(values)
    sortedValues = list(sorted(setValues, reverse=True))
    topFeturePositions = []
    for i in range(0,selection):
        topFeturePositions.append(values.index(sortedValues[i]))
    print (topFeturePositions)
    # print (dataset.head)
    topPacLoadingAttributes= {}
    for position in topFeturePositions:
        topPacLoadingAttributes[dataset.columns.values[position]] = dataset.iloc[:, [position]].values.T[0]
    print (topPacLoadingAttributes)
    

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
    plt.show() 
    # amount of variance does each PC
    # print ("amount of variance does each PC == eigen Values Percentages")
    # print (pca.explained_variance_ratio_)
    pca1 = abs( pca.components_[0])
    print ("pca.components_= [n_components, n_features]")
    print (pca1)
    findTheThreeAttributesWithHighestPcaLoadings(pca1, dataset)


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
# OptimiseKForKMeansByElbowPlot(dataset)
datasetAfterKMeans, numberOfCluster = performKMeans(dataset)
datasetStratified = perfromStratifiedSampling(datasetAfterKMeans, "clusterLabel", numberOfCluster)
performPCA(dataset, "For Original Dataset")
# performPCA(datasetRandomSampled, "For Random Sampled Dataset")
# performPCA(datasetStratified, "For Stratified Dataset")
