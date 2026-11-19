// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { loadApp } from '../app';
import {
  loadMediaSettings,
  loadPodcastSettings,
  loadSiteSettings,
  updateMediaSettings,
  updatePodcastSettings,
  updateSiteSettings,
} from '../settings';

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
    const gql = stubGraphQL({ mutate: { updateSiteSettings: { id: 'site' } } });
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
