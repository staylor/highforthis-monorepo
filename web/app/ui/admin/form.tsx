import type { Handle } from 'remix/component';

import { cn } from '../public/cn.ts';

import { getAdmin } from './context.tsx';
import { Message } from './message.tsx';
import { buttonClass, inputBase } from './styles.ts';

// The admin's add and edit forms, following the admin app's AdminForm and EditableField: a
// plain POST form whose fields are described by data. The date, editor, tags and media fields
// move here with the sections that use them.

interface Choice {
  label: string;
  value: string;
}

export interface Field {
  label: string;
  /** The form field's name, and the property of `data` that fills it. */
  prop: string;
  type?: 'text' | 'textarea' | 'select' | 'hidden';
  /** The <input> type for a text field. */
  inputType?: 'text' | 'email' | 'password';
  autoComplete?: boolean;
  placeholder?: string;
  choices?: Choice[];
  multiple?: boolean;
}

const label = 'mb-1 block text-sm tracking-wide text-gray-700 dark:text-neutral-300';

function FieldInput(handle: Handle<{ field: Field; value: unknown; id: string }>) {
  return () => {
    const { field, value, id } = handle.props;
    if (field.type === 'hidden') {
      return <input type="hidden" name={field.prop} value={String(value ?? '')} />;
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          name={field.prop}
          rows={5}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          class={cn(inputBase, 'w-full')}
          id={id}
        />
      );
    }
    if (field.type === 'select') {
      const selected = new Set(
        (Array.isArray(value) ? value : value === null || value === undefined ? [] : [value]).map(
          String
        )
      );
      return (
        <select
          name={field.prop}
          multiple={field.multiple}
          class={cn(inputBase, 'rounded-lg border-neutral-300 bg-white text-sm')}
          id={id}
        >
          {!field.multiple && <option value="">{field.placeholder ?? ''}</option>}
          {field.choices?.map((choice) => (
            <option value={choice.value} selected={selected.has(choice.value)}>
              {choice.label}
            </option>
          ))}
        </select>
      );
    }
    const autocomplete = field.autoComplete === false ? 'off' : undefined;
    // A password field never shows the saved value; leaving it empty keeps the password
    if (field.inputType === 'password') {
      return (
        <input
          type="password"
          name={field.prop}
          autocomplete={autocomplete}
          class={cn(inputBase, 'w-full')}
          id={id}
        />
      );
    }
    const props = {
      name: field.prop,
      value: String(value ?? ''),
      placeholder: field.placeholder,
      autocomplete,
      class: cn(inputBase, 'w-full'),
      id,
    };
    // Remix types each input type's attributes separately
    return field.inputType === 'email' ? (
      <input type="email" {...props} />
    ) : (
      <input type="text" {...props} />
    );
  };
}

interface AdminFormProps {
  fields: Field[];
  data?: Record<string, unknown> | null;
  buttonLabel?: string;
}

export function AdminForm(handle: Handle<AdminFormProps>) {
  return () => {
    const { t } = getAdmin(handle);
    const { fields, data, buttonLabel } = handle.props;
    return (
      <div class="block after:clear-both after:table">
        <Message param="saveFailed" text={t('admin.saveFailed')} />
        <form method="post">
          <fieldset class="w-full max-w-2xl min-w-0">
            {fields.map((field) => {
              const id = `field-${field.prop}`;
              return (
                <div class="mt-2.5 mb-5 block">
                  {field.type !== 'hidden' && (
                    <label for={id} class={label}>
                      {field.label}
                    </label>
                  )}
                  <FieldInput field={field} value={data?.[field.prop]} id={id} />
                </div>
              );
            })}
            <button type="submit" class={buttonClass(true, 'h-7.5 px-3 pb-0.5 leading-7')}>
              {buttonLabel || t('admin.submit')}
            </button>
          </fieldset>
        </form>
      </div>
    );
  };
}
