import { ImageSourcePropType, StyleSheet } from "react-native";
import { Image } from "expo-image";

type Props = {
  placeholder: ImageSourcePropType;
  selectedImage?: string;
};

export default function ImageViewer({ placeholder, selectedImage }: Props) {
  const src = selectedImage ? { uri: selectedImage } : placeholder;
  return <Image source={src} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
