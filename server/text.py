from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd

data = np.array([[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0], [2.3, 2.7], [2, 1.6], [1, 1.1], [1.5, 1.6], [1.1, 0.9]])
# data = StandardScaler().fit_transform(data)
pca = PCA(n_components=2)
# pca.fit_transform(data)
principalComponents_x = pca.fit_transform(data)
# print(data)
print (principalComponents_x)

output2 = {}
output2["graph"] = []
for principalComponents in principalComponents_x:
    data = {}
    data["principalComponent1"] = principalComponents[0]
    data["principalComponent2"] = principalComponents[1]
    output2["graph"].append(data)
print (output2)

# principal_component_Df = pd.DataFrame(data = principalComponents_x, columns = ['principal component 1', 'principal component 2'])
# print ("principal component values for all samples")
# print (principal_component_Df)

# print ("information or variance each principal component holds after projecting the data to a lower dimensional subspace - Explanied Varience Ratio")
# print (pca.explained_variance_ratio_)

# print ("eigen vectors - Componenets")
# print(pca.components_)

# print ("eigen values - Explanied Varience")
# print(pca.explained_variance_)

# print ("Loading")
# print (pca.components_.T * np.sqrt(pca.explained_variance_))
