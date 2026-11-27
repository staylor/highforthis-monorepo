import Apollo
import Foundation
import Observation
import os

/// Whether what the app has loaded may be out of date. Once the app has been away for a while, it empties the API
/// cache, so the screens opened from then on load afresh, and starts a new generation, which the screens already open
/// refresh for.
@Observable
final class Freshness {
    /// How long the app can be away with what it has loaded still current
    static let staleAfter = Duration.seconds(15 * 60)

    /// Counts up each time what the open screens show may be out of date
    private(set) var generation = 0

    @ObservationIgnored private var awaySince: ContinuousClock.Instant?
    @ObservationIgnored private let clearCache: () async throws -> Void
    @ObservationIgnored private let now: () -> ContinuousClock.Instant

    init(
        clearCache: @escaping () async throws -> Void = { try await ApolloClient.highForThis.clearCache() },
        now: @escaping () -> ContinuousClock.Instant = { .now }
    ) {
        self.clearCache = clearCache
        self.now = now
    }

    /// Notes when the app stops being in use, and when it's back in use after a while away, starts a new generation.
    func appIsActive(_ isActive: Bool) async {
        guard isActive else {
            awaySince = awaySince ?? now()
            return
        }
        guard let awaySince else { return }
        self.awaySince = nil
        guard now() - awaySince >= Self.staleAfter else { return }
        do {
            try await clearCache()
        } catch {
            Logger.api.error("Couldn't empty the cache: \(error.localizedDescription, privacy: .public)")
        }
        generation += 1
    }
}
