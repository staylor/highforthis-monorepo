import SwiftUI

enum Route: Hashable {
    case show(id: String, title: String)
    case shows(ShowFilter)
    case artist(slug: String, name: String)
    case venue(slug: String, name: String)
    case podcast(id: String, title: String)
    case post(slug: String, title: String)
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
                .navigationDestination(for: Route.self) { route in
                    Group {
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
                    .modifier(PlayerInset(showPlayer: showPlayer))
                }
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

extension View {
    func detailTitle(_ title: String) -> some View {
        #if os(iOS)
        navigationTitle(title).navigationBarTitleDisplayMode(.inline)
        #else
        navigationTitle(title)
        #endif
    }
}
