import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Checkbox from '~/components/Form/Checkbox';
import Message from '~/components/Form/Message';
import type { Fields } from '~/types';
import type { ArtistConnection, Show, VenueConnection } from '~/types/graphql';

import SelectEntities from './SelectEntities';
import SelectEntity from './SelectEntity';

interface ShowFormProps {
  data?: any;
  heading: string;
  buttonLabel: string;
}

export default function ShowForm({ data = {}, heading, buttonLabel }: ShowFormProps) {
  const { t } = useTranslation();
  const date = new Date();
  date.setHours(20);
  date.setMinutes(0);
  date.setSeconds(0);

  const showFields: Fields = [
    { label: t('shows.title'), prop: 'title', render: ({ show }) => show?.title },
    {
      prop: 'date',
      type: 'date',
      render: ({ show }) => show?.date || date.getTime(),
    },
    {
      label: t('shows.artists'),
      type: 'custom',
      render: ({ show, artists }: { show: Show; artists: ArtistConnection }) => (
        <SelectEntities
          name="artists"
          nodes={show?.artists || []}
          filtered={artists.edges.map(({ node }) => node)}
        />
      ),
    },
    {
      label: t('shows.venue'),
      type: 'custom',
      render: ({ show, venues }: { show: Show; venues: VenueConnection }) => (
        <SelectEntity
          name="venue"
          node={show?.venue || {}}
          filtered={venues.edges.map(({ node }) => node)}
        />
      ),
    },
    { label: t('shows.url'), prop: 'url', inputType: 'url', render: ({ show }) => show?.url },
    { label: t('shows.notes'), prop: 'notes', type: 'textarea', render: ({ show }) => show?.notes },
    {
      label: t('shows.attended.label'),
      type: 'custom',
      render: ({ show }) => <Checkbox name="attended" checked={show?.attended} />,
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      {data.show && <HeaderAdd label={t('shows.add')} to="/admin/show/add" />}
      <Message text={t('shows.updated')} />
      <Form data={data} fields={showFields} buttonLabel={buttonLabel} />
    </>
  );
}

ShowForm.fragments = {
  show: gql`
    fragment ShowForm_show on Show {
      artists {
        id
        name
      }
      attended
      date
      id
      notes
      title
      url
      venue {
        id
        name
      }
    }
  `,
  entities: gql`
    fragment ShowForm_entities on Query {
      artists(filtered: true, first: 500) @cache(key: "admin") {
        edges {
          node {
            id
            name
          }
        }
      }
      venues(filtered: true, first: 500) @cache(key: "admin") {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
};
