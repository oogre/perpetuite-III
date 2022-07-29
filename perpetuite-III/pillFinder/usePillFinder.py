from detecto import core, utils, visualize
from detecto.visualize import show_labeled_image, plot_prediction_grid
from torchvision import transforms
import matplotlib.pyplot as plt
import numpy as np

model = core.Model.load('model_bluePill.pth', ['0xFF0000FF'])

image = utils.read_image('Test/rectified.jpg')
predictions = model.predict(image)
labels, boxes, scores = predictions

thresh=0.3
filtered_indices=np.where(scores>thresh)
filtered_scores=scores[filtered_indices]
filtered_boxes=boxes[filtered_indices]
num_list = filtered_indices[0].tolist()
filtered_labels = [labels[i] for i in num_list]

show_labeled_image(image, boxes, labels)