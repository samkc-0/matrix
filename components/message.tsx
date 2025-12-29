import { StyleSheet, Text, View } from "react-native";

type MessageProps = {
  text: string;
};

export default function Message({ text }: MessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: {
    textAlign: "center",
    fontSize: 18,
  },
});
