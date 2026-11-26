import ApolloAPI
import SwiftUI

struct QueryView<Query: GraphQLQuery, Content: View>: View where Query.ResponseFormat == SingleResponseFormat {
    private let query: Query
    private let content: (Query.Data) -> Content
    @State private var state = QueryState<Query>()

    init(_ query: Query, @ViewBuilder content: @escaping (Query.Data) -> Content) {
        self.query = query
        self.content = content
    }

    var body: some View {
        Group {
            if state.query == query, let data = state.data {
                content(data)
                    .safeAreaInset(edge: .bottom, spacing: 0) {
                        if let error = state.error {
                            RetryBanner(error: error, isLoading: state.isLoading) {
                                await state.load(query, refresh: true)
                            }
                        }
                    }
            } else if state.query == query, let error = state.error {
                LoadFailedView(error: error, isLoading: state.isLoading) {
                    await state.load(query, refresh: true)
                }
            } else {
                ProgressView(.loading)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task(id: query) { await state.load(query) }
        .refreshable(isLoading: state.isLoading) { await state.load(query, refresh: true) }
    }
}

extension View {
    /// Pull to refresh, and on a Mac, a Refresh button with ⌘R, disabled while it's loading.
    func refreshable(isLoading: Bool, action: @escaping @MainActor @Sendable () async -> Void) -> some View {
        refreshable(action: action)
            #if os(macOS)
        .toolbar {
            ToolbarItem {
                Button(.refresh, systemImage: "arrow.clockwise") { Task { await action() } }
                .keyboardShortcut("r", modifiers: .command)
                .disabled(isLoading)
            }
        }
            #endif
    }
}

struct NotFoundView: View {
    var body: some View {
        ContentUnavailableView(.notFound, systemImage: "questionmark.circle")
    }
}

struct LoadFailedView: View {
    let error: any Error
    var isLoading = false
    let retry: () async -> Void

    var body: some View {
        ContentUnavailableView {
            Label(.couldNotLoad, systemImage: "exclamationmark.triangle")
        } description: {
            Text(error.localizedDescription)
        } actions: {
            Button(.tryAgain) { Task { await retry() } }
                .buttonStyle(.bordered)
                .disabled(isLoading)
                .accessibilityIdentifier("retry-load")
        }
    }
}

struct RetryBanner: View {
    let error: any Error
    let isLoading: Bool
    let retry: () async -> Void

    var body: some View {
        VStack(spacing: 8) {
            Label(error.localizedDescription, systemImage: "exclamationmark.triangle")
                .font(.callout)
                .multilineTextAlignment(.center)
            Button(.tryAgain) { Task { await retry() } }
                .disabled(isLoading)
                .accessibilityIdentifier("retry-load")
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.regularMaterial)
    }
}
