import HighForThisAPI
import SwiftUI

struct PostList: View {
    @State private var feed = Feeds.posts()
    // Like the website, the list shuffles each post's covers once each time it's shown.
    @State private var artworkSeed = UUID().uuidString
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    /// Wider where the row is, on iPad, Mac and Apple TV.
    private var collageWidth: CGFloat {
        horizontalSizeClass == .regular ? .readable(140) : 100
    }

    var body: some View {
        FeedList(feed: feed, filter: .all, emptyTitle: .noPosts, systemImage: "note.text") { posts in
            ForEach(posts, id: \.id) { post in
                RouteLink(.post(slug: post.slug, title: post.title)) {
                    // The covers lead the row, as the pictures in the other lists do, and go above the title at
                    // accessibility text sizes.
                    let layout =
                        dynamicTypeSize.isAccessibilitySize
                        ? AnyLayout(VStackLayout(alignment: .leading, spacing: 12))
                        : AnyLayout(HStackLayout(spacing: .readable(12)))
                    layout {
                        let artwork = post.artwork(seed: artworkSeed, width: dynamicTypeSize.isAccessibilitySize ? 640 : 300)
                        if !artwork.isEmpty {
                            PostArtworkCollage(images: artwork)
                                .aspectRatio(4 / 3, contentMode: .fit)
                                .frame(width: dynamicTypeSize.isAccessibilitySize ? nil : collageWidth)
                                .clipShape(.rect(cornerRadius: 8))
                                .accessibilityHidden(true)
                        }
                        RowLabel(
                            eyebrow: post.date.map { Text(Date(apiTimestamp: $0), format: .postedDate) },
                            title: post.title
                        )
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.vertical, 4)
                }
                .accessibilityIdentifier("post-\(post.slug)")
            }
        }
        .navigationTitle(.posts)
    }
}

#Preview {
    NavigationStack { PostList() }
}
