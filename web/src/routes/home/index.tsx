import { gql } from 'graphql-tag';

import SectionHeader, { AccentLine } from '#/components/SectionHeader';
import Videos from '#/components/Videos';
import { videosQuery } from '#/components/Videos/graphql';
import type { HomeQuery } from '#/types/graphql';
import { createClientCache } from '#/utils/cache';
import query from '#/utils/query';

import type { Route } from './+types';
import Latest from './Latest';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<HomeQuery>({
    request,
    context,
    query: homeQuery,
    variables: { cacheKey: 'home-videos', first: 9 },
  });
}

export const clientLoader = createClientCache();

function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <section>
        <SectionHeader label="Videos" viewAllLink="/videos" />
        <Videos videos={loaderData.videos} paginate={false} />
      </section>
      <AccentLine />
      <Latest posts={loaderData.posts} />
    </>
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
