// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { loadApp } from '../app';
import { deletePodcasts, loadPodcast, loadPodcasts, updatePodcast } from '../podcasts';
import {
  loadMediaSettings,
  loadPodcastSettings,
  loadSiteSettings,
  updateMediaSettings,
  updatePodcastSettings,
  updateSiteSettings,
} from '../settings';
import { createUser, deleteUsers, loadUser, loadUsers, updateUser } from '../users';

import { calls, form, stubGraphQL } from './helpers';

describe('settings', () => {
  it('loads each settings page', async () => {
    const gql = stubGraphQL();
    await loadSiteSettings({ gql });
    await loadMediaSettings({ gql });
    await loadPodcastSettings({ gql });
    expect(calls(gql.query).map(({ operation }) => operation)).toEqual([
      'SiteSettings',
      'MediaSettings',
      'PodcastSettings',
    ]);
  });

  it('saves each settings page under its ID', async () => {
    const gql = stubGraphQL();
    const url = new URL('http://localhost/admin/settings/site');
    const result = await updateSiteSettings({ gql, url, formData: form({ siteTitle: 'HFT' }) });
    await updateMediaSettings({
      gql,
      url,
      formData: form({ 'crops[0][name]': 'thumb', 'crops[0][width]': '150' }),
    });
    await updatePodcastSettings({ gql, url, formData: form({ explicit: 'false' }) });

    expect(calls(gql.mutate)).toEqual([
      { operation: 'UpdateSiteSettings', variables: { id: 'site', input: { siteTitle: 'HFT' } } },
      {
        operation: 'UpdateMediaSettings',
        variables: { id: 'media', input: { crops: [{ name: 'thumb', width: 150 }] } },
      },
      {
        operation: 'UpdatePodcastSettings',
        variables: { id: 'podcast', input: { explicit: false } },
      },
    ]);
    expect(result).toEqual({
      redirectTo: 'http://localhost/admin/settings/site?message=updated',
    });
  });

  it('loads the data every page shares', async () => {
    const gql = stubGraphQL();
    await loadApp({ gql });
    expect(calls(gql.query)).toEqual([{ operation: 'App', variables: undefined }]);
  });
});

describe('podcasts', () => {
  it('lists, loads, updates and deletes episodes', async () => {
    const gql = stubGraphQL();
    const url = new URL('http://localhost/admin/podcast/e1');
    await loadPodcasts({ gql, searchParams: new URLSearchParams('search=pilot') });
    await loadPodcast({ gql, id: 'e1' });
    await updatePodcast({ gql, id: 'e1', url, formData: form({ title: 'Pilot' }) });
    await deletePodcasts({ gql, url, formData: form({ ids: 'e1' }) });

    expect([...calls(gql.query), ...calls(gql.mutate)]).toEqual([
      { operation: 'PodcastsAdmin', variables: { first: 20, search: 'pilot' } },
      { operation: 'PodcastEdit', variables: { id: 'e1' } },
      { operation: 'UpdatePodcast', variables: { id: 'e1', input: { title: 'Pilot' } } },
      { operation: 'DeletePodcast', variables: { ids: ['e1'] } },
    ]);
  });
});

describe('users', () => {
  it('lists, loads, updates and deletes users', async () => {
    const gql = stubGraphQL();
    const url = new URL('http://localhost/admin/user/u1');
    await loadUsers({ gql, searchParams: new URLSearchParams('page=2') });
    await loadUser({ gql, id: 'u1' });
    await updateUser({ gql, id: 'u1', url, formData: form({ name: 'Scott', 'roles[]': 'admin' }) });
    await deleteUsers({ gql, url, formData: form({ ids: 'u1' }) });

    expect([...calls(gql.query), ...calls(gql.mutate)]).toEqual([
      { operation: 'UsersAdmin', variables: { first: 20, after: 'YXJyYXljb25uZWN0aW9uOjE5' } },
      { operation: 'UserEdit', variables: { id: 'u1' } },
      {
        operation: 'UpdateUser',
        variables: { id: 'u1', input: { name: 'Scott', roles: ['admin'] } },
      },
      { operation: 'DeleteUser', variables: { ids: ['u1'] } },
    ]);
  });

  it('creates a user and goes to their edit page', async () => {
    const gql = stubGraphQL({ mutate: { createUser: { id: 'u2' } } });
    const result = await createUser({
      gql,
      url: new URL('http://localhost/admin/user/add'),
      formData: form({ name: 'Pat', email: 'pat@example.com' }),
    });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'CreateUser', variables: { input: { name: 'Pat', email: 'pat@example.com' } } },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/user/u2?message=updated' });
  });
});
