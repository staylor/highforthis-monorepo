import { clientEntry, type Handle } from 'remix/component';

/**
 * For a signed-in admin, reloads the top frame when GraphQL says content changed. That
 * re-requests the current URL and reconciles the page in place.
 */
export const Revalidate = clientEntry(
  import.meta.url,
  function Revalidate(handle: Handle<{ graphqlHost: string }>) {
    handle.queueTask(() => {
      const events = new EventSource(`${handle.props.graphqlHost}/sse`);
      events.addEventListener('revalidate', () => {
        handle.frames.top.reload();
      });
      handle.signal.addEventListener('abort', () => events.close());
    });

    return () => null;
  }
);
