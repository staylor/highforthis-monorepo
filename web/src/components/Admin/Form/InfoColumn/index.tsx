import cn from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

import type { Fields } from '@/types';

const border = cn('border border-detail');

const InfoBox = (props: HTMLAttributes<HTMLElement>) => (
  <aside className={cn(border, 'mb-5 box-border block shadow')} {...props} />
);

const Content = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="px-5 pb-5 pt-1.5 text-sm" {...props} />
);

interface InfoColumnProps {
  infoFields?: Fields;
  metaFields?: Fields;
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
    <section className="sticky top-2.5 mr-0 mt-2.5 w-full md:float-right md:-mr-75 md:w-70">
      {infoFields.length > 0 ? (
        <InfoBox>
          <h3 className={cn(border, 'text-dark select-none py-2 px-3 text-sm font-bold')}>
            {label}
          </h3>
          <Content>
            <>{infoFields}</>
            {button}
          </Content>
        </InfoBox>
      ) : null}
      {metaFields.length > 0 ? (
        <InfoBox>
          <Content>
            <>{metaFields}</>
          </Content>
        </InfoBox>
      ) : null}
    </section>
  );
}
