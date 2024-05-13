import { gql } from 'graphql-tag';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Message from '@/components/Form/Message';
import Checkbox from '@/components/Form/Checkbox';
import type { Fields } from '@/types';
import type { ArtistConnection, Show, VenueConnection } from '@/types/graphql';

import SelectEntity from './SelectEntity';
import SelectEntities from './SelectEntities';

interface ShowFormProps {
  data?: any;
  heading: string;
  buttonLabel: string;
}

export default function ShowForm({ data = {}, heading, buttonLabel }: ShowFormProps) {
  const date = new Date();
  date.setHours(20);
  date.setMinutes(0);
  date.setSeconds(0);

  const showFields: Fields = [
    { label: 'Title', prop: 'title', render: ({ show }) => show?.title },
    {
      prop: 'date',
      type: 'date',
      render: ({ show }) => show?.date || date.getTime(),
    },
    {
      label: 'Artists',
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
      label: 'Venue',
      type: 'custom',
      render: ({ show, venues }: { show: Show; venues: VenueConnection }) => (
        <SelectEntity
          label="Venue"
          name="venue"
          node={show?.venue || {}}
          filtered={venues.edges.map(({ node }) => node)}
        />
      ),
    },
    { label: 'URL', prop: 'url', inputType: 'url', render: ({ show }) => show?.url },
    { label: 'Notes', prop: 'notes', type: 'textarea', render: ({ show }) => show?.notes },
    {
      label: 'Attended',
      type: 'custom',
      render: ({ show }) => <Checkbox name="attended" checked={show?.attended} />,
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      {data.show && <HeaderAdd label="Add Show" to="/admin/show/add" />}
      <Message text="Show updated." />
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
