import { lazy } from 'react';

import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';
import Select from '@/components/Form/Select';
import Date from '@/components/Admin/Form/Date';
import type { Field } from '@/types';

const Editor = lazy(() => import('@/components/Editor'));

interface FieldProps {
  field: Field;
  data: AppData;
}

export default function EditableField({ field, data }: FieldProps) {
  let value = field.defaultValue;
  if (data && field.render) {
    value = field.render(data) as any;
  } else if (data && field.prop && data[field.prop]) {
    value = data[field.prop];
  }

  const defaultProps = {
    className: field.className,
    name: field.prop,
    value,
  };

  if (field.type === 'editor') {
    return <Editor editorState={value as any} />;
  }

  if (field.type === 'hidden') {
    return <input type="hidden" {...defaultProps} />;
  }

  if (field.type === 'date') {
    return <Date date={(typeof value === 'string' ? parseInt(value, 10) : value) || ''} />;
  }

  if (field.type === 'select') {
    return (
      <Select
        {...defaultProps}
        choices={field.choices}
        value={value || (field.multiple ? [] : '')}
        multiple={field.multiple || false}
        placeholder={field.placeholder || ''}
      >
        {data && field.render ? field.render(data) : null}
      </Select>
    );
  }

  if (field.type === 'textarea') {
    return <Textarea rows={5} {...defaultProps} />;
  }

  return (
    <Input
      autoComplete={field.autoComplete === false ? 'off' : undefined}
      placeholder={field.placeholder || ''}
      type={field.inputType || 'text'}
      {...defaultProps}
    />
  );
}
