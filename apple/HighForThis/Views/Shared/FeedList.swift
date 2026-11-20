import SwiftUI

struct FeedList<Filter: Hashable, Item: FeedItem, Rows: View>: View {
    let feed: CursorFeed<Filter, Item>
    let filter: Filter
    let emptyTitle: LocalizedStringResource
    let systemImage: String
    @ViewBuilder let rows: ([Item]) -> Rows

    var body: some View {
        List {
            rows(feed.filter == filter ? feed.items : [])
            if feed.hasLoaded, feed.hasNextPage {
                Button {
                    Task { await feed.loadMore() }
                } label: {
                    HStack {
                        Spacer()
                        if feed.isLoading { ProgressView() } else { Text(.loadMore) }
                        Spacer()
                    }
                    .frame(minHeight: 44)
                    .foregroundStyle(.tint)
                }
                .listRowSeparatorHidden()
                .disabled(feed.isLoading || feed.error != nil)
                .accessibilityIdentifier("load-more")
            }
        }
        .listStyle(.plain)
        .id(filter)
        .overlay {
            if feed.items.isEmpty {
                if let error = feed.error {
                    LoadFailedView(error: error, isLoading: feed.isLoading) { await feed.retry() }
                } else if !feed.hasLoaded || feed.isLoading {
                    ProgressView(.loading).allowsHitTesting(false)
                } else {
                    ContentUnavailableView(emptyTitle, systemImage: systemImage).allowsHitTesting(false)
                }
            }
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if !feed.items.isEmpty, let error = feed.error {
                RetryBanner(error: error, isLoading: feed.isLoading) { await feed.retry() }
            }
        }
        .task(id: filter) { await feed.load(filter) }
        .refreshable { await feed.load(filter, refresh: true) }
        #if os(macOS)
        .toolbar {
            ToolbarItem {
                Button(.refresh, systemImage: "arrow.clockwise") { Task { await feed.load(filter, refresh: true) } }
                .keyboardShortcut("r", modifiers: .command)
                .disabled(feed.isLoading)
            }
        }
        #endif
    }
}
