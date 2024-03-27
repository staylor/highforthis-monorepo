import { Heading2 } from '@/components/Heading';
import Link from '@/components/Link';
import type { ShowConnection } from '@/types/graphql';

function Sidebar({ shows }: { shows: ShowConnection }) {
  if (!shows) {
    return null;
  }

  return (
    <aside className="lg:w-60">
      <Heading2>Upcoming Shows</Heading2>
      <div className="md:columns-3 lg:columns-1">
        {shows.edges.length === 0 && (
          <div className="mb-3 ml-3 text-sm">
            No recommended shows at this time. Please check back soon.
          </div>
        )}
        {shows.edges.map(({ node }) => {
          const d = new Date(node.date);
          const m = d.getMonth() + 1;
          const day = d.getDate();
          return (
            <div className="mb-3 ml-3 text-base" key={node.id}>
              <time className="block font-bold">{`${m < 10 ? `0${m}` : m}/${
                day < 10 ? `0${day}` : day
              }/${d.getFullYear()}`}</time>
              <Link to={`/artist/${node.artist.slug}`}>{node.title || node.artist.name}</Link>
              <br />
              <Link to={`/venue/${node.venue.slug}`}>{node.venue.name}</Link>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
