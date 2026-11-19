import { createAction } from 'remix/router';

import { requireAdmin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';

import { loadMediaPickerPage } from './data.ts';

// Uploads by type, and videos for the post editor's video block
const mediaTypes = new Set(['image', 'audio', 'video']);

/**
 * The pickers' pages, as JSON: /admin/media-picker/image (or audio, or video), then ?cursor= the
 * last page's endCursor as the picker scrolls.
 */
export const mediaPicker = createAction(routes.admin.mediaPicker, {
  middleware: [requireAdmin()],
  async handler(context) {
    const { type } = context.params;
    if (!mediaTypes.has(type)) {
      return new Response('Not Found', { status: 404 });
    }
    const page = await loadMediaPickerPage({
      gql: context.admin.gql,
      type,
      cursor: context.url.searchParams.get('cursor'),
    });
    // Signed-in data: never stored by the CDN or the browser
    return Response.json(page, { headers: { 'Cache-Control': 'private, no-store' } });
  },
});
