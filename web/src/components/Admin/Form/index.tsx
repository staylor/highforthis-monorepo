import type { PropsWithChildren } from 'react';
import invariant from 'tiny-invariant';

import { FormWrap } from '@/components/Admin/styles';
import Button from '@/components/Button';
import type { Fields, FieldUnion } from '@/types';

import InfoColumn from './InfoColumn';
import EditableField from './EditableField';

const Label = ({ children }: PropsWithChildren) => (
  <span className="mb-1 block text-sm tracking-wide text-gray-700">{children}</span>
);

interface FormProps {
  data?: AppData;
  fields: Fields;
  boxLabel?: string;
  buttonLabel?: string;
}

export default function AdminForm({
  data = {},
  fields,
  boxLabel = 'Details',
  buttonLabel = 'Submit',
}: FormProps) {
  const primaryFields: Fields = [];
  const infoFields: Fields = [];
  const metaFields: Fields = [];

  fields.forEach((f: FieldUnion, i: number) => {
    const field = typeof f === 'function' ? f(data) : f;
    if (field.condition && !field.condition(data)) {
      return;
    }

    const key = field.prop || i.toString(16);
    let formField;
    if (field.type === 'custom') {
      invariant(
        field.render,
        `You must specify a render property for a custom field: ${field.prop}`
      );
      formField = (
        <div key={key} className="my-6 block">
          {field.label && <Label>{field.label}</Label>}
          {field.render(data)}
        </div>
      );
    } else if (field.type === 'date' || field.type === 'editor') {
      formField = (
        <div key={key} className="my-6 block">
          {field.label && <Label>{field.label}</Label>}
          <EditableField field={field} data={data} />
        </div>
      );
    } else {
      formField = (
        <div key={key} className="mb-5 mt-2.5 block">
          {field.label && <Label>{field.label}</Label>}
          {field.editable === false ? (
            <span className="block text-sm">
              {(field.render && field.render(data)) || (field.prop && data[field.prop])}
            </span>
          ) : (
            <EditableField field={field} data={data} />
          )}
        </div>
      );
    }

    if (field.position === 'info') {
      infoFields.push(formField);
    } else if (field.position === 'meta') {
      metaFields.push(formField);
    } else {
      primaryFields.push(formField);
    }
  });

  const button = (
    <Button buttonType="primary" className="h-7.5 px-3 pb-0.5 leading-7" type="submit">
      {buttonLabel}
    </Button>
  );

  return (
    <FormWrap>
      <form method="post" className="before:clear-both before:table">
        <fieldset className="mr-75 block">
          <div className="w-full max-w-2xl md:float-left">
            <>{primaryFields}</>
            {infoFields.length === 0 ? button : null}
          </div>
          <InfoColumn
            infoFields={infoFields}
            metaFields={metaFields}
            button={button}
            label={boxLabel}
          />
        </fieldset>
      </form>
    </FormWrap>
  );
}
