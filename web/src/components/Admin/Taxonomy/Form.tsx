import { gql } from 'graphql-tag';

import { Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Message from '@/components/Form/Message';
import type { Fields } from '@/types';
import type { Taxonomy } from '@/types/graphql';

interface TaxonomyFormProps {
  data?: Taxonomy;
  heading: string;
  buttonLabel: string;
}

const taxonomyFields: Fields = [
  { label: 'Name', prop: 'name' },
  {
    label: 'Slug',
    prop: 'slug',
    condition: (tax: Taxonomy) => tax.slug?.length > 0,
    editable: false,
  },
  { label: 'Plural Name', prop: 'plural' },
  {
    label: 'Description',
    prop: 'description',
    type: 'textarea',
  },
];

export default function TaxonomyForm({
  data = {} as Taxonomy,
  heading,
  buttonLabel,
}: TaxonomyFormProps) {
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text="Taxonomy updated." />
      <Form fields={taxonomyFields} data={data} buttonLabel={buttonLabel} />
    </>
  );
}

TaxonomyForm.fragments = {
  taxonomy: gql`
    fragment TaxonomyForm_taxonomy on Taxonomy {
      description
      id
      name
      plural
      slug
    }
  `,
};
