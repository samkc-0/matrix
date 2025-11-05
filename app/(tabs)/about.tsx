import { Text, View, StyleSheet } from 'react-native'
import { Link } from "expo-router"

export default function AboutScreen() {
  return (
    <View style={styles.container} >
      <Text style={styles.text}>This is the about screen</Text>
      <Link href="/" style={styles.button}>or go home.</Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "coral",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "white",
  },
})
