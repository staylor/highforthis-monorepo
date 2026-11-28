/** Record every successful navigation, including those before the SDK is ready. */
export function trackViews(navigation: EventTarget | undefined, pathname: () => string) {
  const pending = [pathname()];
  let record: (path: string) => void = (path) => pending.push(path);
  const onNavigate = () => record(pathname());
  navigation?.addEventListener('navigatesuccess', onNavigate);
  return {
    start(report: (path: string) => void) {
      for (const path of pending) report(path);
      pending.length = 0;
      record = report;
    },
    stop() {
      navigation?.removeEventListener('navigatesuccess', onNavigate);
    },
  };
}
