import { useState } from 'react';
import cn from 'classnames';
import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';
import { Outlet } from '@remix-run/react';
import { gql } from 'graphql-tag';
import type { MetaFunction } from '@remix-run/node';

import NavMenu from '@/components/Admin/NavMenu';
import titleTemplate from '@/utils/title';
import query from '@/utils/query';
import { authenticator } from '@/auth.server';
import adminCss from '@/styles/admin.css';
import { rootData } from '@/utils/rootData';

export const handle = {
  layout: 'admin',
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: '/css/dashicons.min.css' },
  { rel: 'stylesheet', href: '/css/Draft.css' },
  { rel: 'stylesheet', href: adminCss },
];

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Admin', siteSettings }),
    },
  ];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return query({ query: adminQuery, request, context });
  }
  return redirect('/login/unauthorized');
};

export default function Admin() {
  const [isCollapsed, setCollapsed] = useState(false);
  return (
    <div className="mx-auto min-h-[calc(100vh-48px)] bg-white px-12 py-6">
      <section>
        <div id="portal" />
        <div className="absolute" id="atomicToolbar" />
        <NavMenu toggleCollapse={() => setCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
        <section
          className={cn('relative z-30 h-full px-5 pb-16', {
            'ml-9 lg:ml-40': !isCollapsed,
            'ml-9 lg:ml-9': isCollapsed,
          })}
        >
          <Outlet />
        </section>
      </section>
    </div>
  );
}

const adminQuery = gql`
  query Admin {
    taxonomies @cache(key: "admin") {
      edges {
        node {
          id
          name
          plural
          slug
        }
      }
    }
  }
`;
