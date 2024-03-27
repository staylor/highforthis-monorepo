import { useState } from 'react';

import { inputBase } from '@/components/Form/styles';

type DateValue = string | number;

const pad = (num: DateValue) => (+num < 10 ? `0${num}` : num);

export default function DatePicker({ date }: { date: DateValue }) {
  const [dateValue, setDateValue] = useState(date || '');

  let isoDate = '';
  if (dateValue) {
    const obj: Date = new Date(dateValue);
    const [dstr, tstr] = obj.toLocaleString('en-US').split(', ');
    const [mon, day, year]: string[] = dstr.split('/');
    const d = [year, pad(mon), pad(day)].join('-');
    const [t, ampm] = tstr.split(' ');
    const [hours, mins, secs] = t.split(':');
    const hrs = ampm === 'PM' ? +hours + 12 : hours;
    const time = [pad(hrs), mins, secs].join(':');
    isoDate = `${d}T${time}`;
  }
  return (
    <>
      <input type="hidden" name="date" defaultValue={dateValue} />
      <input
        className={inputBase}
        type="datetime-local"
        value={isoDate}
        onChange={(e) => {
          const newValue = e.currentTarget.value;
          setDateValue(newValue ? Date.parse(newValue) : '');
        }}
      />
    </>
  );
}
