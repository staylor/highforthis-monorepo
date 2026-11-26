import SwiftUI

enum Route: Hashable {
    case show(id: String, title: String)
    case shows(ShowFilter)
    case artist(slug: String, name: String)
    case venue(slug: String, name: String)
    case podcast(id: String, title: String)
    case post(slug: String, title: String)
}

/// A route as a link pushes it: with how deep in the stack the screen it opens is. A list draws a link as selected
/// while its value is anywhere in the stack, so without the depth, a show's row on its artist's or its venue's page
/// stayed highlighted on the way there from that show: gray on a phone, and on iPad solid pink behind pink text.
private struct PushedRoute: Hashable {
    let route: Route
    let depth: Int
}

extension EnvironmentValues {
    /// How deep in its stack a screen is. A tab's first screen is at 0.
    @Entry fileprivate var navigationDepth = 0
}

/// A link that pushes a route onto its tab's stack.
struct RouteLink<Label: View>: View {
    @Environment(\.navigationDepth) private var depth
    private let route: Route
    private let label: Label

    init(_ route: Route, @ViewBuilder label: () -> Label) {
        self.route = route
        self.label = label()
    }

    var body: some View {
        NavigationLink(value: PushedRoute(route: route, depth: depth + 1)) { label }
    }
}

extension RouteLink where Label == Text {
    init(_ title: LocalizedStringResource, route: Route) {
        self.init(route) { Text(title) }
    }
}

struct BrowseStack<Root: View>: View {
    private let root: Root
    private let showPlayer: (() -> Void)?

    init(showPlayer: (() -> Void)? = nil, @ViewBuilder root: () -> Root) {
        self.root = root()
        self.showPlayer = showPlayer
    }

    var body: some View {
        NavigationStack {
            root
                .modifier(PlayerInset(showPlayer: showPlayer))
                .navigationDestination(for: PushedRoute.self) { pushed in
                    destination(pushed.route)
                        .modifier(PlayerInset(showPlayer: showPlayer))
                        .environment(\.navigationDepth, pushed.depth)
                }
        }
    }

    @ViewBuilder private func destination(_ route: Route) -> some View {
        switch route {
        case .show(let id, let title):
            ShowDetail(id: id, title: title)
        case .shows(let filter):
            ShowList(kind: filter.kind, artist: filter.artist, venue: filter.venue)
        case .artist(let slug, let name):
            ArtistDetail(slug: slug, name: name)
        case .venue(let slug, let name):
            VenueDetail(slug: slug, name: name)
        case .podcast(let id, let title):
            PodcastDetail(id: id, title: title)
        case .post(let slug, let title):
            PostDetail(slug: slug, title: title)
        }
    }
}

private struct PlayerInset: ViewModifier {
    @Environment(PodcastPlayer.self) private var player
    let showPlayer: (() -> Void)?

    func body(content: Content) -> some View {
        // On 26.0 the inset must belong to the scrolling content, not TabView or NavigationStack.
        content.safeAreaInset(edge: .bottom, spacing: 0) {
            if let showPlayer, player.episode != nil {
                PlayerAccessory(openPlayer: showPlayer)
                    .glassEffect(.regular, in: .rect(cornerRadius: 16))
                    .padding()
            }
        }
    }
}

/// Whether a detail screen's header is on screen. The screen's title in the bar gives way to it.
@Observable
final class DetailHeaderVisibility {
    var isVisible = false
}

extension View {
    /// A detail screen's title. The screen opens with its title in a `DetailHeader`, so on iPhone and iPad the bar
    /// has it only while that isn't on screen: once it has scrolled away, and while the screen loads. tvOS draws a
    /// bar's title over whatever scrolls under it, so there the header's is the only one.
    func detailTitle(_ title: String) -> some View {
        #if os(iOS)
        modifier(DetailTitle(title: title))
        #elseif os(tvOS)
        self
        #else
        navigationTitle(title)
        #endif
    }
}

#if os(iOS)
private struct DetailTitle: ViewModifier {
    let title: String
    @State private var header = DetailHeaderVisibility()

    func body(content: Content) -> some View {
        content
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text(title)
                        .font(.headline)
                        .lineLimit(1)
                        .opacity(header.isVisible ? 0 : 1)
                        .animation(.easeInOut(duration: 0.2), value: header.isVisible)
                        .accessibilityHidden(header.isVisible)
                }
            }
            .environment(header)
    }
}
#endif
