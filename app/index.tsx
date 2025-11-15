import Grid from "@/components/grid";
import Quadrants from "@/components/quadrants";
import { View, Text, StyleSheet } from "react-native";

const toText = (item: number) => (
  <Text style={{ fontSize: 32, color: "black" }}>{item.toString()}</Text>
);

export default function Index() {
  return (
    <View style={styles.container}>
      <Quadrants>
        <Text>(info)</Text>
        <Grid
          data={[
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ]}
          renderItem={toText}
        />
        <Grid
          data={[
            [1, 2, 3],
            [4, 5, 6],
          ]}
          renderItem={toText}
        />
        <Grid
          data={[
            [1, 2, 3],
            [4, 5, 6],
          ]}
          renderItem={toText}
        />
      </Quadrants>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "tomato",
    alignItems: "center",
  },
  square: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "tomato",
  },
});
