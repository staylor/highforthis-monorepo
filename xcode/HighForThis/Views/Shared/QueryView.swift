import Apollo
import ApolloAPI
import SwiftUI
import os

/// Fetches a query when it appears, and again whenever the query changes, then shows its data. Until the data
/// arrives it shows progress, or the error with a way to try again. Pulling to refresh fetches from the network.
struct QueryView<Query: GraphQLQuery, Content: View>: View where Query.ResponseFormat == SingleResponseFormat {
    private let query: Query
    private let content: (Query.Data) -> Content

    @State private var loaded: (query: Query, data: Query.Data)?
    @State private var error: (any Error)?

    init(_ query: Query, @ViewBuilder content: @escaping (Query.Data) -> Content) {
        self.query = query
        self.content = content
    }

    var body: some View {
        Group {
            if let loaded {
                // A changed query, such as a new filter, keeps the old results until the new ones arrive.
                content(loaded.data)
                    .overlay {
                        if loaded.query != query {
                            ProgressView()
                        }
                    }
            } else if let error {
                LoadFailedView(error: error) {
                    self.error = nil
                    await load(cachePolicy: .networkOnly)
                }
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task(id: query) {
            guard loaded?.query != query else { return }
            await load(cachePolicy: .cacheFirst)
        }
        .refreshable {
            await load(cachePolicy: .networkOnly)
        }
    }

    private func load(cachePolicy: CachePolicy.Query.SingleResponse) async {
        let query = query
        do {
            let data = try await ApolloClient.highForThis.data(for: query, cachePolicy: cachePolicy)
            loaded = (query, data)
            error = nil
        } catch {
            // Leaving the screen cancels the fetch, which can fail as a URLError rather than a CancellationError.
            guard !Task.isCancelled else { return }
            Logger.api.error("\(Query.operationName, privacy: .public) failed: \(error.localizedDescription, privacy: .public)")
            // A failed refresh leaves the data that's showing.
            if loaded?.query != query {
                loaded = nil
                self.error = error
            }
        }
    }
}

struct LoadFailedView: View {
    let error: any Error
    let retry: () async -> Void

    var body: some View {
        ContentUnavailableView {
            Label(.couldNotLoad, systemImage: "exclamationmark.triangle")
        } description: {
            Text(error.localizedDescription)
        } actions: {
            Button(.tryAgain) {
                Task { await retry() }
            }
        }
    }
}
