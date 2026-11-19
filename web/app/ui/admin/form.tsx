import type { Handle, RemixNode } from 'remix/component';

import { cn } from '../public/cn.ts';

import { getAdmin } from './context.tsx';
import { Message } from './message.tsx';
import { buttonClass, inputBase } from './public/styles.ts';

// A plain POST form whose fields are described by data. A custom field renders what it's
// given, such as the featured media field.

interface Choice {
  label: string;
  value: string;
}

export interface Field {
  label: string;
  /** The form field's name, and the property of `data` that fills it. */
  prop: string;
  type?: 'text' | 'textarea' | 'select' | 'hidden' | 'checkbox' | 'custom';
  inputType?: 'text' | 'email' | 'password';
  autoComplete?: boolean;
  placeholder?: string;
  choices?: Choice[];
  multiple?: boolean;
  render?: () => RemixNode;
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
    if (field.type === 'checkbox') {
      // Submits true when checked. An unchecked box submits nothing, so a form's save sends
      // false for it by default.
      return (
        <input
          type="checkbox"
          name={field.prop}
          value="true"
          checked={Boolean(value)}
          class="rounded-sm border-gray-300 text-pink shadow-sm focus:border-pink focus:ring-3 focus:ring-pink focus:ring-offset-0"
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
  /** A box beside the fields on wide screens, such as an artist's shows. */
  meta?: RemixNode;
}

function FormField(handle: Handle<{ field: Field; data?: Record<string, unknown> | null }>) {
  return () => {
    const { field, data } = handle.props;
    const id = `field-${field.prop}`;
    if (field.type === 'custom') {
      return (
        <div class="my-6 block">
          {field.label && <span class={label}>{field.label}</span>}
          {field.render?.()}
        </div>
      );
    }
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
  };
}

export function AdminForm(handle: Handle<AdminFormProps>) {
  return () => {
    const { t } = getAdmin(handle);
    const { fields, data, buttonLabel, meta } = handle.props;
    return (
      <div class="block after:clear-both after:table">
        <Message param="saveFailed" text={t('admin.saveFailed')} />
        <form method="post">
          <fieldset
            class={cn(
              'flex w-full flex-col gap-6',
              Boolean(meta) && 'lg:flex-row lg:items-start lg:gap-8'
            )}
          >
            <div class="w-full max-w-2xl min-w-0">
              {fields.map((field) => (
                <FormField field={field} data={data} />
              ))}
              <button type="submit" class={buttonClass(true, 'h-7.5 px-3 pb-0.5 leading-7')}>
                {buttonLabel || t('admin.submit')}
              </button>
            </div>
            {meta && (
              <section class="w-full shrink-0 lg:sticky lg:top-4 lg:w-70">
                <aside class="mb-5 box-border block border border-detail shadow-sm">
                  <div class="px-5 pt-1.5 pb-5 text-sm">{meta}</div>
                </aside>
              </section>
            )}
          </fieldset>
        </form>
      </div>
    );
  };
}
