import { ChangeEvent } from 'react';

const convertToDateString = (timestamp: number): string => {
  const date = new Date(Number(timestamp));
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
};

export const DatePicker = ({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) => {
  const handleChange =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = [...value] as [number, number];
      newValue[index] = new Date(e.target.value).getTime();
      onChange(newValue);
    };

  return (
    <div className='flex items-center gap-4'>
      <label>
        <p className='text-white'>From</p>
        <input
          max={convertToDateString(Date.now())}
          value={convertToDateString(value[0])}
          onChange={handleChange(0)}
          type='date'
        />
      </label>
      <label>
        <p className='text-white'>To</p>
        <input
          max={convertToDateString(Date.now())}
          value={convertToDateString(value[1])}
          onChange={handleChange(1)}
          type='date'
        />
      </label>
    </div>
  );
};
