import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist

# Configuration for synthetic extra characters
EXTRA_SAMPLES_PER_CLASS = 6000
EXTRA_TEST_SPLIT = 0.2
MODEL_OUTPUT_DIR = "model-extra-chars"


def add_noise(canvas: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Adds light gaussian noise to mimic handwriting artifacts."""
    noise = rng.normal(0, 12, size=canvas.shape)
    canvas = np.clip(canvas + noise, 0, 255)
    return canvas


def generate_dash_image(rng: np.random.Generator) -> np.ndarray:
    canvas = np.zeros((28, 28), dtype=np.float32)
    thickness = int(rng.integers(2, 4))
    length = int(rng.integers(12, 23))
    row = int(rng.integers(11, 18 - thickness))
    col = int(rng.integers(2, 28 - length - 2))
    canvas[row:row + thickness, col:col + length] = 255
    if rng.random() > 0.5:
        canvas = np.roll(canvas, int(rng.integers(-2, 3)), axis=1)
    return add_noise(canvas, rng)


def generate_dot_image(rng: np.random.Generator) -> np.ndarray:
    canvas = np.zeros((28, 28), dtype=np.float32)
    radius = int(rng.integers(2, 4))
    center_y = int(rng.integers(18, 24))
    center_x = int(rng.integers(10, 20))
    for y in range(28):
        for x in range(28):
            if (y - center_y) ** 2 + (x - center_x) ** 2 <= radius ** 2:
                canvas[y, x] = 255
    return add_noise(canvas, rng)


EXTRA_CHAR_GENERATORS = {
    "-": generate_dash_image,
#    ".": generate_dot_image,
}


def shuffle_in_unison(x: np.ndarray, y: np.ndarray, rng: np.random.Generator):
    idx = rng.permutation(len(x))
    return x[idx], y[idx]


def build_extra_characters(rng: np.random.Generator):
    images = []
    labels = []
    for offset, (char, generator) in enumerate(EXTRA_CHAR_GENERATORS.items()):
        label = 10 + offset
        for _ in range(EXTRA_SAMPLES_PER_CLASS):
            images.append(generator(rng))
            labels.append(label)
    images = np.array(images, dtype=np.float32)[..., None] / 255.0
    labels = np.array(labels, dtype=np.int32)
    images, labels = shuffle_in_unison(images, labels, rng)
    split_idx = int(len(images) * (1 - EXTRA_TEST_SPLIT))
    return (
        images[:split_idx],
        labels[:split_idx],
        images[split_idx:],
        labels[split_idx:],
    )


rng = np.random.default_rng(1337)

# Data
(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train = x_train[..., None] / 255.0
x_test = x_test[..., None] / 255.0

extra_x_train, extra_y_train, extra_x_test, extra_y_test = build_extra_characters(rng)

x_train = np.concatenate([x_train, extra_x_train], axis=0)
y_train = np.concatenate([y_train, extra_y_train], axis=0)
x_test = np.concatenate([x_test, extra_x_test], axis=0)
y_test = np.concatenate([y_test, extra_y_test], axis=0)

x_train, y_train = shuffle_in_unison(x_train, y_train, rng)
x_test, y_test = shuffle_in_unison(x_test, y_test, rng)

num_classes = 10 + len(EXTRA_CHAR_GENERATORS)
y_train = tf.keras.utils.to_categorical(y_train, num_classes)
y_test = tf.keras.utils.to_categorical(y_test, num_classes)

# Model
model = models.Sequential([
    layers.Conv2D(8, 5, activation="relu", input_shape=(28, 28, 1)),
    layers.MaxPooling2D(),
    layers.Conv2D(16, 5, activation="relu"),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(num_classes, activation="softmax"),
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
tfjs.converters.save_keras_model(model, MODEL_OUTPUT_DIR)
print(f"✅ Model exported to {MODEL_OUTPUT_DIR}/")


pred = model.predict(x_test)
y_true = np.argmax(y_test, axis=1)
y_pred = np.argmax(pred, axis=1)

# After training, print accuracy specifically for the extra classes:
extra_chars = [(10, "-"), (11, ".")]

for label, name in extra_chars[:-1]:
    mask = y_true == label
    acc = np.mean(y_pred[mask] == y_true[mask])
    print(name, "accuracy:", acc)
