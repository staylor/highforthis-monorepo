import cn from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

const border = cn('border border-detail');

const InfoBox = (props: HTMLAttributes<HTMLElement>) => (
  <aside className={cn(border, 'mb-5 box-border block shadow-sm')} {...props} />
);

const Content = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="px-5 pt-1.5 pb-5 text-sm" {...props} />
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
  if (infoFields.length === 0 && metaFields.length === 0) {
    return null;
  }

  return (
    <section className="w-full shrink-0 lg:sticky lg:top-4 lg:w-70">
      {infoFields.length > 0 ? (
        <InfoBox>
          <h3 className={cn(border, 'text-dark px-3 py-2 text-sm font-bold select-none')}>
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
