import { View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";

export default function ExpoRouter() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Oops! Not found!",
        }}
      />
      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Go back to menu
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "black",
  },
});
