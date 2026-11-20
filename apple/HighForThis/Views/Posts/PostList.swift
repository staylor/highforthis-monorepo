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
                NavigationLink(value: Route.post(slug: post.slug, title: post.title)) {
                    let layout =
                        dynamicTypeSize.isAccessibilitySize
                        ? AnyLayout(VStackLayout(alignment: .leading, spacing: 12)) : AnyLayout(HStackLayout(spacing: 12))
                    layout {
                        Text(post.title)
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        let artwork = post.artwork(seed: artworkSeed, width: dynamicTypeSize.isAccessibilitySize ? 640 : 300)
                        if !artwork.isEmpty {
                            PostArtworkCollage(images: artwork)
                                .aspectRatio(4 / 3, contentMode: .fit)
                                .frame(width: dynamicTypeSize.isAccessibilitySize ? nil : 100)
                                .clipShape(.rect(cornerRadius: 8))
                                .accessibilityHidden(true)
                        }
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
