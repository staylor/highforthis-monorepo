import Foundation
import Testing

@testable import HighForThis

struct NextShowMemoryTests {
    private static let show = NextShowMemory.Show(id: "show-1", title: "Phish", venue: "Sphere", localDate: "2026-12-31")

    private static func instant(_ iso: String) throws -> Date { try Date(iso, strategy: .iso8601) }

    @Test func aFailedFetchKeepsTheLastShowFound() throws {
        var memory = NextShowMemory()
        memory.found(Self.show)
        memory.failed()

        #expect(memory.fallback(at: try Self.instant("2026-12-30T17:00:00Z")) == Self.show)
    }

    // The API's list of shows to come changes at midnight in New York
    @Test func keepsTheShowThroughItsDayInNewYork() throws {
        var memory = NextShowMemory()
        memory.found(Self.show)

        // 11 PM on New Year's Eve in New York, already January 1 in UTC
        #expect(memory.fallback(at: try Self.instant("2027-01-01T04:00:00Z")) == Self.show)
        // Midnight in New York
        #expect(memory.fallback(at: try Self.instant("2027-01-01T05:00:00Z")) == nil)
    }

    @Test func aFetchThatFindsNoShowForgetsTheLastOne() throws {
        var memory = NextShowMemory()
        memory.found(Self.show)
        memory.found(nil)
        memory.failed()

        #expect(memory.fallback(at: try Self.instant("2026-12-30T17:00:00Z")) == nil)
    }

    @Test func asksLessOftenWhileFetchesKeepFailing() {
        var memory = NextShowMemory()
        var delays: [TimeInterval] = []
        for _ in 1...4 {
            memory.failed()
            delays.append(NextShowMemory.retryDelay(afterFailures: memory.failures))
        }
        let minutes: [TimeInterval] = [15, 30, 60, 60]
        #expect(delays == minutes.map { $0 * 60 })

        memory.found(Self.show)
        #expect(memory.failures == 0)
    }

    @Test func keepsWhatItFoundBetweenRuns() throws {
        let suite = "NextShowMemoryTests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        #expect(NextShowMemory.load(from: defaults) == NextShowMemory())

        var memory = NextShowMemory()
        memory.found(Self.show)
        memory.failed()
        memory.save(to: defaults)

        #expect(NextShowMemory.load(from: defaults) == memory)
    }

    @Test func startsAfreshFromWhatItCanNotRead() throws {
        let suite = "NextShowMemoryTests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        defaults.set(Data("not JSON".utf8), forKey: "nextShowMemory")

        #expect(NextShowMemory.load(from: defaults) == NextShowMemory())
    }
}
