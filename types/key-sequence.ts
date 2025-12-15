type KeySequenceState = {
  expectedKey: string;
  label: string;
  row: number;
  col: number;
  show: string;
};

type KeySequence = KeySequenceState[];

export default KeySequence;

export { KeySequence, KeySequenceState };
