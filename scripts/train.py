import tensorflow as tf
import tensorflowjs as tfjs
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist

# Data
(x_train, y_train), (x_test, y_test) = mnist.load_data()

x_train = x_train[..., None] / 255.0
x_test = x_test[..., None] / 255.0

y_train = tf.keras.utils.to_categorical(y_train, 10)
y_test = tf.keras.utils.to_categorical(y_test, 10)

# Model
model = models.Sequential([
    layers.Conv2D(8, 5, activation="relu", input_shape=(28, 28, 1)),
    layers.MaxPooling2D(),
    layers.Conv2D(16, 5, activation="relu"),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(10, activation="softmax"),
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

# Training (tqdm-style built in)
model.fit(
    x_train,
    y_train,
    epochs=10,
    batch_size=512,
    validation_data=(x_test, y_test),
)

# Export to TFJS
tfjs.converters.save_keras_model(model, "model")
print("✅ Model exported to model/")
