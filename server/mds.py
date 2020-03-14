# from sklearn.datasets import load_digits
# from sklearn.manifold import MDS
# X, _ = load_digits(return_X_y=True)
# print (X.shape)

# embedding = MDS(n_components=2)
# X_transformed = embedding.fit_transform(X[:10])
# print (X_transformed)

from scipy.spatial import distance
from sklearn.manifold import MDS
import numpy as np

coords = np.array([[35.0456, -85.2672, 87.32],
          [35.1174, -89.9711, 43.982],
          [35.9728, -83.9422, 60.8376],
          [36.1667, -86.7833, 90.221],
          [36.1667, -86.7833, 90.221],
          [36.1667, -86.7833, 90.221]])

# coords = [(35.0456, -85.2672, 87.32),
#           (35.1174, -89.9711, 43.982),
#           (35.9728, -83.9422, 60.8376),
#           (36.1667, -86.7833, 90.221),
#           (36.1667, -86.7833, 90.221),
#           (36.1667, -86.7833, 90.221)]

j = distance.cdist(coords, coords, 'euclidean')

print (j)

# embedding = MDS(n_components=2, dissimilarity='precomputed')
# X_transformed = embedding.fit_transform(j)
# print (X_transformed)

# j = distance.cdist(coords, coords, 'correlation')

# embedding = MDS(n_components=2, dissimilarity='precomputed')
# X_transformed = embedding.fit_transform(j)
# print (X_transformed)