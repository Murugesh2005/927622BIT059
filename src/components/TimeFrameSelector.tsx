import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

interface TimeFrameSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

const TIME_FRAMES = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
  { value: 360, label: '6 hours' },
  { value: 480, label: '8 hours' },
];

export const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(event.target.value as number);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="timeframe-selector-label">Time Frame</InputLabel>
      <Select
        labelId="timeframe-selector-label"
        value={value}
        label="Time Frame"
        onChange={handleChange}
      >
        {TIME_FRAMES.map((timeFrame) => (
          <MenuItem key={timeFrame.value} value={timeFrame.value}>
            {timeFrame.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};