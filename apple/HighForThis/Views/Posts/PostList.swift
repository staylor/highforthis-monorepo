import HighForThisAPI
import SwiftUI

struct PostList: View {
    @State private var feed = Feeds.posts()
    // Like the website, the list shuffles each post's covers once each time it's shown.
    @State private var artworkSeed = UUID().uuidString
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        FeedList(feed: feed, filter: .all, emptyTitle: .noPosts, systemImage: "note.text") { posts in
            ForEach(posts, id: \.id) { post in
                RouteLink(.post(slug: post.slug, title: post.title)) {
                    PictureRow(pictureWidth: 100, regularPictureWidth: 140) {
                        let artwork = post.artwork(seed: artworkSeed, width: dynamicTypeSize.isAccessibilitySize ? 640 : 300)
                        if !artwork.isEmpty {
                            PostArtworkCollage(images: artwork)
                                .aspectRatio(4 / 3, contentMode: .fit)
                        }
                    } words: {
                        RowLabel(eyebrow: post.date.map { Text(Date(apiTimestamp: $0), format: .postedDate) }, title: post.title)
                    }
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
