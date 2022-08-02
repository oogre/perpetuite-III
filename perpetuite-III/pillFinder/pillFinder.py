from detecto import core, utils, visualize
from detecto.visualize import show_labeled_image, plot_prediction_grid
from torchvision import transforms
import matplotlib.pyplot as plt
import numpy as np

custom_transforms = transforms.Compose([
	transforms.ToPILImage(),
		# transforms.Resize(900),
		# transforms.RandomHorizontalFlip(0.5),
	transforms.ColorJitter(saturation=0.2),
	transforms.ToTensor(),
	utils.normalize_transform(),
])

Train_dataset=core.Dataset('Train/',transform=custom_transforms)#L1
Test_dataset = core.Dataset('Test/')#L2
loader=core.DataLoader(Train_dataset, batch_size=2, shuffle=True)#L3
model = core.Model(['0xFF0000FF'])#L4
losses = model.fit(loader, Test_dataset, epochs=20, lr_step_size=5, learning_rate=0.001, verbose=True)#L5

plt.plot(losses)
plt.show()


model.save('model_bluePill2.pth')


