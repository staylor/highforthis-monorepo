import { gql } from 'graphql-tag';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';

import Link from '@/components/Link';
import FeaturedMedia from '@/components/FeaturedMedia';
import TextTitle from '@/components/TextTitle';
import Select from '@/components/Form/Select';
import query from '@/utils/query';
import type { ImageUpload, PlacesQuery, Term, TermConnection, TermEdge } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context }) => {
  const url = new URL(request.url);
  const variables = { first: 200 } as any;
  if (url.searchParams.has('category')) {
    variables.categories = url.searchParams.getAll('category');
  }
  if (url.searchParams.has('crossStreet')) {
    variables.crossStreets = url.searchParams.getAll('crossStreet');
  }
  if (url.searchParams.has('hood')) {
    variables.neighborhoods = url.searchParams.getAll('hood');
  }
  return query({ context, query: placesQuery, variables });
};

export default function Places() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const data = useLoaderData<PlacesQuery>();
  const hasQuery = searchParams.toString().length > 0;
  const setParam = (prop: string) => (value: string) => {
    searchParams.set(prop, value);
    navigate('?' + searchParams.toString());
  };

  const { neighborhoods, categories, crossStreets } = data;
  const places = data.places as TermConnection;
  const hoods = neighborhoods?.edges.map(({ node }) => node) || [];
  const cats = categories?.edges.map(({ node }) => node) || [];
  const streets = crossStreets?.edges.map(({ node }) => node) || [];

  const filters = [
    [hoods, 'hood', 'Neighborhood'],
    [cats, 'category', 'Category'],
    [streets, 'crossStreet', 'Cross Street'],
  ];

  return (
    <>
      <TextTitle>
        {searchParams.has('hood')
          ? hoods.find((h) => h.slug === searchParams.get('hood'))?.name
          : 'Places'}
      </TextTitle>
      <div className="my-5">
        {filters.map(([items, param, label]) => {
          if (items && items.length > 0) {
            const key = param as string;
            return (
              <Select
                key={key}
                className="my-2.5 block md:my-0 md:mr-2.5 md:inline-block"
                value={searchParams.get(key) || ''}
                placeholder={`-- Filter by ${label}`}
                choices={(items as Term[]).map(({ name, slug }) => ({ label: name, value: slug }))}
                onChange={setParam(key)}
              />
            );
          }
          return null;
        })}
      </div>
      {hasQuery && (
        <Link to={{ pathname: '/places', search: '' }} className="my-5 block text-pink">
          &larr; Back to all Places
        </Link>
      )}
      <ul className="grid-cols-3 gap-1.5 md:grid">
        {places.edges.length === 0 && <p>No places match the filters.</p>}
        {places.edges.map(({ node }: TermEdge) => (
          <li key={node.id} className="my-2.5 md:my-0">
            <Link to={`/place/${node.slug}`}>
              <FeaturedMedia
                alt={node.name}
                className="block h-auto w-full"
                featuredMedia={node.featuredMedia as ImageUpload[]}
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

const placesQuery = gql`
  query Places(
    $after: String
    $categories: [String]
    $crossStreets: [String]
    $first: Int
    $neighborhoods: [String]
  ) {
    categories: terms(first: 100, taxonomy: "category") {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
    crossStreets: terms(first: 100, taxonomy: "cross-street") {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
    neighborhoods: terms(first: 100, taxonomy: "neighborhood") {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
    places(
      after: $after
      categories: $categories
      crossStreets: $crossStreets
      first: $first
      neighborhoods: $neighborhoods
    ) {
      edges {
        node {
          featuredMedia {
            ...FeaturedMedia_featuredMedia
          }
          id
          name
          slug
          ... on Place {
            address
          }
        }
      }
    }
  }
  ${FeaturedMedia.fragments.featuredMedia}
`;
