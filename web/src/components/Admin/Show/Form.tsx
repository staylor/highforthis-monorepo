import { gql } from 'graphql-tag';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Message from '@/components/Form/Message';
import Link from '@/components/Link';
import type { Fields } from '@/types';
import type { Artist, Venue } from '@/types/graphql';

interface ShowFormProps {
  data?: any;
  heading: string;
  buttonLabel: string;
}

export default function ShowForm({ data = {}, heading, buttonLabel }: ShowFormProps) {
  const { artists, venues } = data;
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
      label: 'Artist',
      prop: 'artist',
      type: 'select',
      placeholder: '---',
      choices: artists.edges.map(({ node }: { node: Artist }) => ({
        label: node.name,
        value: node.id,
      })),
      render: ({ show }) => show?.artist?.id,
    },
    {
      type: 'custom',
      render: () => (
        <Link className="underline" to={`/admin/term/${artists.taxonomy.id}/add`}>
          Add Artist
        </Link>
      ),
    },
    {
      label: 'Venue',
      prop: 'venue',
      editable: true,
      type: 'select',
      placeholder: '---',
      choices: venues.edges.map(({ node }: { node: Venue }) => ({
        label: node.name,
        value: node.id,
      })),
      render: ({ show }) => show?.venue?.id,
    },
    {
      type: 'custom',
      render: () => (
        <Link className="underline" to={`/admin/term/${venues.taxonomy.id}/add`}>
          Add Venue
        </Link>
      ),
    },
    { label: 'URL', prop: 'url', inputType: 'url', render: ({ show }) => show?.url },
    { label: 'Notes', prop: 'notes', type: 'textarea', render: ({ show }) => show?.notes },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      {data.show && <HeaderAdd label="Show" to="/admin/show/add" />}
      <Message text="Show updated." />
      <Form data={data} fields={showFields} buttonLabel={buttonLabel} />
    </>
  );
}

ShowForm.fragments = {
  show: gql`
    fragment ShowForm_show on Show {
      artist {
        id
      }
      date
      id
      notes
      title
      url
      venue {
        id
      }
    }
  `,
  terms: gql`
    fragment ShowForm_terms on Query {
      artists: terms(first: 500, taxonomy: "artist") @cache(key: "admin") {
        edges {
          node {
            id
            name
          }
        }
        taxonomy {
          id
        }
      }
      venues: terms(first: 500, taxonomy: "venue") @cache(key: "admin") {
        edges {
          node {
            id
            name
          }
        }
        taxonomy {
          id
        }
      }
    }
  `,
};
