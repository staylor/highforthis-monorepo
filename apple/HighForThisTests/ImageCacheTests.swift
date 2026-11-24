import Foundation
import Testing

@testable import HighForThis

struct ImageCacheTests {
    private nonisolated static let url = URL(string: "https://example.com/wilco/132x132bb.jpg")!

    /// A fetch that answers with each of `results` in turn, counting how many times it's called.
    private actor Fetches {
        private var results: [String?]
        private(set) var count = 0

        init(_ results: [String?]) {
            self.results = results
        }

        func next() -> String? {
            count += 1
            return results.isEmpty ? nil : results.removeFirst()
        }
    }

    /// A fetch that's held until the test finishes it.
    private actor HeldFetch {
        private(set) var count = 0
        private var started: [CheckedContinuation<Void, Never>] = []
        private var waiting: [CheckedContinuation<String?, Never>] = []

        func fetch() async -> String? {
            count += 1
            for continuation in started {
                continuation.resume()
            }
            started = []
            return await withCheckedContinuation { waiting.append($0) }
        }

        /// Returns once a fetch has started.
        func untilStarted() async {
            guard count == 0 else { return }
            await withCheckedContinuation { started.append($0) }
        }

        func finish(with image: String?) {
            for continuation in waiting {
                continuation.resume(returning: image)
            }
            waiting = []
        }
    }

    @Test func aURLIsFetchedOnceWhileItLoads() async {
        let held = HeldFetch()
        let cache = ImageCache<String> { _ in await held.fetch() }

        let first = Task { await cache.image(for: Self.url) }
        await held.untilStarted()
        // The second asks while the first's fetch is held, as finishing it has to wait for the main actor.
        let second = Task { await cache.image(for: Self.url) }
        await held.finish(with: "picture")

        #expect(await first.value == "picture")
        #expect(await second.value == "picture")
        #expect(await held.count == 1)
        #expect(cache[Self.url] == "picture")
    }

    @Test func aFailedFetchIsTriedAgainAndAFetchedImageKept() async {
        let fetches = Fetches([nil, "picture"])
        let cache = ImageCache<String> { _ in await fetches.next() }

        #expect(await cache.image(for: Self.url) == nil)
        #expect(cache[Self.url] == nil)
        #expect(await cache.image(for: Self.url) == "picture")
        #expect(await cache.image(for: Self.url) == "picture")
        #expect(cache[Self.url] == "picture")
        #expect(await fetches.count == 2)
    }

    @Test func emptyingTheCacheForgetsItsImages() async {
        let fetches = Fetches(["picture", "new picture"])
        let cache = ImageCache<String> { _ in await fetches.next() }
        _ = await cache.image(for: Self.url)

        cache.removeAll()

        #expect(cache[Self.url] == nil)
        #expect(await cache.image(for: Self.url) == "new picture")
    }

    @Test func emptyingTheCacheForgetsAFetchStillRunning() async {
        let held = HeldFetch()
        let cache = ImageCache<String> { _ in await held.fetch() }
        let pending = Task { await cache.image(for: Self.url) }
        await held.untilStarted()

        cache.removeAll()
        await held.finish(with: "picture")

        #expect(await pending.value == nil)
        #expect(cache[Self.url] == nil)
    }
}
