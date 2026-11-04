import SwiftUI

/// Every screen a list can open. Routes carry the title, so it's on screen while the rest loads.
enum Route: Hashable {
    case show(id: String, title: String)
    case artist(slug: String, name: String)
    case venue(slug: String, name: String)
    case podcast(id: String, title: String)
    case post(slug: String, title: String)
}

/// A tab's navigation stack, which can open any route.
struct BrowseStack<Root: View>: View {
    @ViewBuilder let root: Root

    var body: some View {
        NavigationStack {
            root.navigationDestination(for: Route.self) { route in
                switch route {
                case .show(let id, let title):
                    ShowDetail(id: id, title: title)
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
    }
}

extension View {
    /// The title of a pushed screen, inline on iPhone and iPad so it doesn't push the content down.
    func detailTitle(_ title: String) -> some View {
        #if os(iOS)
        navigationTitle(title).navigationBarTitleDisplayMode(.inline)
        #else
        navigationTitle(title)
        #endif
    }
}
