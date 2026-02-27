import { lazy, Suspense, useEffect, useState } from 'react';

import Date from '~/components/Admin/Form/Date';
import Input from '~/components/Form/Input';
import Select from '~/components/Form/Select';
import Textarea from '~/components/Form/Textarea';
import type { Field } from '~/types';

const Editor = lazy(() => import('~/components/Editor'));

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

interface FieldProps {
  field: Field;
  data: Record<string, any>;
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
    return (
      <ClientOnly>
        <Suspense
          fallback={
            <div className="editor-container relative -left-6">
              <div className="editor-inner mt-6 min-h-[150px] space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          }
        >
          <Editor editorState={value as any} />
        </Suspense>
      </ClientOnly>
    );
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
