import { css, type Handle, type RemixNode } from 'remix/component';

import { lg, merge, sm, text } from '#/ui/public/styles.ts';

import { getAdmin } from './context.tsx';
import { Message } from './message.tsx';
import { checkbox, label, saveButton, select, wideInput } from './public/styles.ts';

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
  inputType?: 'text' | 'email' | 'password' | 'url';
  autoComplete?: boolean;
  placeholder?: string;
  choices?: Choice[];
  multiple?: boolean;
  render?: () => RemixNode;
}

const checkboxStyle = css(merge(checkbox, { '&:focus': { borderColor: 'var(--pink)' } }));

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
          mix={wideInput}
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
          mix={checkboxStyle}
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
        <select name={field.prop} multiple={field.multiple} mix={select} id={id}>
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
          mix={wideInput}
          id={id}
        />
      );
    }
    const props = {
      name: field.prop,
      value: String(value ?? ''),
      placeholder: field.placeholder,
      autocomplete,
      mix: wideInput,
      id,
    };
    // Remix types each input type's attributes separately
    if (field.inputType === 'email') {
      return <input type="email" {...props} />;
    }
    if (field.inputType === 'url') {
      return <input type="url" {...props} />;
    }
    return <input type="text" {...props} />;
  };
}

interface AdminFormProps {
  fields: Field[];
  data?: Record<string, unknown> | null;
  buttonLabel?: string;
  /** A box beside the fields on wide screens, such as an artist's shows. */
  meta?: RemixNode;
  /**
   * A box above `meta` with the save button, such as a post's date and status. A long form keeps
   * its button there on wide screens and in a bar stuck to the bottom of narrow ones.
   */
  info?: RemixNode;
}

/** A field with its label, for a form's own boxes, such as a post's date and status. */
export function FormField(handle: Handle<{ field: Field; data?: Record<string, unknown> | null }>) {
  return () => {
    const { field, data } = handle.props;
    const id = `field-${field.prop}`;
    if (field.type === 'custom') {
      return (
        <div mix={css({ marginBlock: '1.5rem', display: 'block' })}>
          {field.label && <span mix={label}>{field.label}</span>}
          {field.render?.()}
        </div>
      );
    }
    return (
      <div mix={css({ marginBlock: '0.625rem 1.25rem', display: 'block' })}>
        {field.type !== 'hidden' && (
          <label for={id} mix={label}>
            {field.label}
          </label>
        )}
        <FieldInput field={field} value={data?.[field.prop]} id={id} />
      </div>
    );
  };
}

const box = css({
  marginBottom: '1.25rem',
  boxSizing: 'border-box',
  display: 'block',
  border: '1px solid var(--detail)',
  boxShadow: 'var(--shadow-sm)',
});

const boxBody = css({ padding: '0.375rem 1.25rem 1.25rem', ...text.sm });

export function AdminForm(handle: Handle<AdminFormProps>) {
  return () => {
    const { t } = getAdmin(handle);
    const { fields, data, buttonLabel, meta, info } = handle.props;
    const button = (
      <button type="submit" mix={saveButton}>
        {buttonLabel || t('admin.submit')}
      </button>
    );
    const sidebar = Boolean(meta || info);
    return (
      <div
        mix={css({
          display: 'block',
          '&::after': { content: '""', clear: 'both', display: 'table' },
        })}
      >
        <Message param="saveFailed" text={t('admin.saveFailed')} />
        <form method="post">
          <fieldset
            data-sidebar={sidebar || undefined}
            mix={css({
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              gap: '1.5rem',
              '&[data-sidebar]': {
                [lg]: { flexDirection: 'row', alignItems: 'flex-start', gap: '2rem' },
              },
            })}
          >
            <div mix={css({ width: '100%', maxWidth: '42rem', minWidth: 0 })}>
              {fields.map((field) => (
                <FormField field={field} data={data} />
              ))}
              {!info && button}
            </div>
            {sidebar && (
              <section
                mix={css({
                  width: '100%',
                  flexShrink: 0,
                  [lg]: { position: 'sticky', top: '1rem', width: '17.5rem' },
                })}
              >
                {info && (
                  <aside mix={box}>
                    <h3
                      mix={css({
                        border: '1px solid var(--detail)',
                        padding: '0.5rem 0.75rem',
                        ...text.sm,
                        fontWeight: 700,
                        color: 'var(--dark)',
                        userSelect: 'none',
                      })}
                    >
                      {t('admin.details')}
                    </h3>
                    <div mix={boxBody}>
                      {info}
                      <span mix={css({ display: 'none', [lg]: { display: 'inline-block' } })}>
                        {button}
                      </span>
                    </div>
                  </aside>
                )}
                {meta && (
                  <aside mix={box}>
                    <div mix={boxBody}>{meta}</div>
                  </aside>
                )}
              </section>
            )}
          </fieldset>
          {info && (
            <div
              mix={css({
                position: 'sticky',
                bottom: 0,
                zIndex: 30,
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                marginInline: '-1rem',
                padding: '0.75rem 1rem',
                borderTop: '1px solid oklch(92.2% 0 none / 0.8)',
                backgroundColor: 'rgb(255 255 255 / 0.9)',
                backdropFilter: 'blur(24px)',
                [sm]: { marginInline: '-1.5rem', paddingInline: '1.5rem' },
                [lg]: { display: 'none' },
              })}
            >
              {button}
            </div>
          )}
        </form>
      </div>
    );
  };
}
