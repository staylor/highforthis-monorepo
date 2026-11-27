import Foundation
import Testing

@testable import HighForThis

struct FreshnessTests {
    @Test func aShortTimeAwayKeepsWhatsLoaded() async {
        var now = ContinuousClock.now
        var emptied = 0
        let freshness = Freshness(clearCache: { emptied += 1 }, now: { now })

        await freshness.appIsActive(false)
        now += .seconds(14 * 60)
        await freshness.appIsActive(true)

        #expect(freshness.generation == 0)
        #expect(emptied == 0)
    }

    // Leaving goes through inactive to the background, and it's away from the first
    @Test func aWhileAwayEmptiesTheCacheAndStartsANewGeneration() async {
        var now = ContinuousClock.now
        var emptied = 0
        let freshness = Freshness(clearCache: { emptied += 1 }, now: { now })

        await freshness.appIsActive(false)
        now += .seconds(60)
        await freshness.appIsActive(false)
        now += .seconds(14 * 60)
        await freshness.appIsActive(true)

        #expect(freshness.generation == 1)
        #expect(emptied == 1)

        await freshness.appIsActive(false)
        now += .seconds(60)
        await freshness.appIsActive(true)

        #expect(freshness.generation == 1)
        #expect(emptied == 1)
    }

    @Test func launchingIsNotComingBack() async {
        var emptied = 0
        let freshness = Freshness(clearCache: { emptied += 1 })

        await freshness.appIsActive(true)

        #expect(freshness.generation == 0)
        #expect(emptied == 0)
    }

    struct CacheError: Error {}

    // The open screens refresh, so what they show is current even if the cache wasn't emptied
    @Test func aCacheThatCantBeEmptiedStillStartsANewGeneration() async {
        var now = ContinuousClock.now
        let freshness = Freshness(clearCache: { throw CacheError() }, now: { now })

        await freshness.appIsActive(false)
        now += Freshness.staleAfter
        await freshness.appIsActive(true)

        #expect(freshness.generation == 1)
    }
}
