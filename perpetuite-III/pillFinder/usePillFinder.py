from detecto import core, utils, visualize
from detecto.visualize import show_labeled_image, plot_prediction_grid
from torchvision import transforms
import matplotlib.pyplot as plt
import numpy as np

model = core.Model.load('model_weights.pth', ['Pill'])

image = utils.read_image('Test/rectified.jpg')
prediction = model.predict(image)
labels, boxes, scores = prediction

# thresh=0.6
# filtered_indices=np.where(scores>thresh)
# filtered_scores=scores[filtered_indices]
# filtered_boxes=boxes[filtered_indices]
# num_list=filtered_indices[0].toList()
# filtered_labels=[labels[i] for i in num_list]

show_labeled_image(image, boxes, labels)