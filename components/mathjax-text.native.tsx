import { StyleProp, Text, TextStyle } from "react-native";

type MathjaxTextProps = {
  content: string;
  style?: StyleProp<TextStyle>;
  displayMode?: boolean;
};

export default function MathJaxText({ content, style }: MathjaxTextProps) {
  return <Text style={style}>{content}</Text>;
}
