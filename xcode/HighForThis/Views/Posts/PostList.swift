import HighForThisAPI
import SwiftUI

struct PostList: View {
    @State private var feed = Feeds.posts()
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
                        if let thumbnail = post.thumbnailURL {
                            RemoteImage(url: thumbnail, aspectRatio: 4 / 3, contentMode: .fill)
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

nonisolated extension PostsQuery.Data.Posts.Edge.Node {
    fileprivate var thumbnailURL: URL? {
        for image in featuredMedia?.compactMap(\.asImageUpload) ?? [] {
            if let crop = image.crops.best(forWidth: 300) {
                return AppConfiguration.uploadURL(destination: image.destination, fileName: crop.fileName)
            }
        }
        return nil
    }
}

#Preview {
    NavigationStack { PostList() }
}
