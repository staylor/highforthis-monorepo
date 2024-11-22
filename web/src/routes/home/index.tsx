import { gql } from 'graphql-tag';

import Divider from '~/components/Divider';
import Videos from '~/components/Videos';
import { videosQuery } from '~/components/Videos/graphql';
import type { HomeQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';

import type { Route } from './+types';
import Latest from './Latest';

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const variables = { cacheKey: 'home-videos' } as any;
  const after = url.searchParams.get('after');
  const before = url.searchParams.get('before');
  if (after) {
    variables.first = 10;
    variables.after = after;
  } else if (before) {
    variables.last = 10;
    variables.before = before;
  } else {
    variables.first = 10;
  }
  return query<HomeQuery>({
    request,
    context,
    query: homeQuery,
    variables,
  });
}

export const clientLoader = createClientCache();

function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col-reverse md:mx-auto md:my-0 md:flex-row lg:m-0">
      <Latest posts={loaderData.posts} />
      <Divider>
        <Videos videos={loaderData.videos} />
      </Divider>
    </div>
  );
}

const homeQuery = gql`
  query Home(
    $after: String
    $before: String
    $cacheKey: String
    $first: Int
    $last: Int
    $year: Int
  ) {
    posts(first: 5, status: PUBLISH) @cache(key: "latest") {
      edges {
        node {
          featuredMedia {
            destination
            id
            ... on ImageUpload {
              crops {
                fileName
                width
              }
            }
          }
          id
          slug
          summary
          title
        }
      }
    }
    ...Videos_videos
  }
  ${videosQuery}
`;

export default Home;
