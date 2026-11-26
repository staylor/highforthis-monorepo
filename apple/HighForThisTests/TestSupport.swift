import Foundation

/// A call that waits until the test finishes it, to hold a request or an activation in flight.
final class Suspended<Value: Sendable> {
    private var continuation: CheckedContinuation<Value, any Error>?

    func value() async throws -> Value {
        try await withCheckedThrowingContinuation { continuation = $0 }
    }

    func waitUntilStarted() async {
        while continuation == nil { await Task.yield() }
    }

    func finish(_ result: Result<Value, any Error>) {
        continuation?.resume(with: result)
        continuation = nil
    }
}

extension Sequence {
    /// The elements transformed in order, one after another.
    func asyncMap<T>(_ transform: (Element) async -> T) async -> [T] {
        var results: [T] = []
        for element in self {
            await results.append(transform(element))
        }
        return results
    }
}
