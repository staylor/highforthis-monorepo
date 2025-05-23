import cn from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

const border = cn('border border-detail');

const InfoBox = (props: HTMLAttributes<HTMLElement>) => (
  <aside className={cn(border, 'mb-5 box-border block shadow-sm')} {...props} />
);

const Content = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="px-5 pb-5 pt-1.5 text-sm" {...props} />
);

interface InfoColumnProps {
  infoFields?: ReactNode[];
  metaFields?: ReactNode[];
  label?: string;
  button?: ReactNode;
}

export default function InfoColumn({
  infoFields = [],
  metaFields = [],
  label = '',
  button = null,
}: InfoColumnProps) {
  return (
    <section className="md:-mr-75 md:w-70 sticky top-2.5 mr-0 mt-2.5 w-full md:float-right">
      {infoFields.length > 0 ? (
        <InfoBox>
          <h3 className={cn(border, 'text-dark select-none px-3 py-2 text-sm font-bold')}>
            {label}
          </h3>
          <Content>
            {infoFields}
            {button}
          </Content>
        </InfoBox>
      ) : null}
      {metaFields.length > 0 ? (
        <InfoBox>
          <Content>{metaFields}</Content>
        </InfoBox>
      ) : null}
    </section>
  );
}
