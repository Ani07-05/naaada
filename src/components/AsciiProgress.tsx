// ASCII progress bar: ████████░░░░░░ (filled accent, empty faint).
import React from 'react';
import { TuiText } from './TuiText';
import { asciiProgress } from '@/art/cover';

type Props = {
  value: number;
  max: number;
  width?: number;
  d?: number;
};

export function AsciiProgress({ value, max, width = 22, d = 0 }: Props) {
  const { fill, rest } = asciiProgress(value, max, width);
  return (
    <TuiText d={d}>
      <TuiText color="accent" d={d}>{fill}</TuiText>
      <TuiText color="inkFaint" d={d}>{rest}</TuiText>
    </TuiText>
  );
}
