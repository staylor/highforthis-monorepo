import Foundation

/// Images fetched by URL and kept until `removeAll()`. Each URL is fetched once: asking for it again while it loads
/// waits for that fetch, and a fetch that fails is tried again the next time the URL is asked for.
///
/// CarPlay keeps its list rows' pictures here, since it makes new rows whenever a list changes.
final class ImageCache<Image: Sendable> {
    private let fetch: @Sendable (URL) async -> Image?
    private var images: [URL: Image] = [:]
    private var fetches: [URL: Task<Image?, Never>] = [:]

    init(fetch: @escaping @Sendable (URL) async -> Image?) {
        self.fetch = fetch
    }

    /// The image for `url`, if it has been fetched.
    subscript(url: URL) -> Image? {
        images[url]
    }

    /// The image for `url`, fetched unless it has been. Nil if the fetch failed, or the cache was emptied while it ran.
    func image(for url: URL) async -> Image? {
        if let image = images[url] {
            return image
        }
        let task = fetches[url] ?? start(url)
        let image = await task.value
        // Whoever asked first keeps the image. Emptying the cache forgets its fetches, so one that finishes
        // afterwards isn't kept.
        guard fetches[url] == task else {
            return images[url]
        }
        fetches[url] = nil
        images[url] = image
        return image
    }

    /// Forgets every image, and cancels the fetches still running.
    func removeAll() {
        for task in fetches.values {
            task.cancel()
        }
        fetches = [:]
        images = [:]
    }

    private func start(_ url: URL) -> Task<Image?, Never> {
        let task = Task { [fetch] in await fetch(url) }
        fetches[url] = task
        return task
    }
}
