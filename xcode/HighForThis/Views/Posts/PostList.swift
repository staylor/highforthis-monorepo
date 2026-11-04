import HighForThisAPI
import SwiftUI

struct PostList: View {
    var body: some View {
        QueryView(PostsQuery()) { data in
            let posts = data.posts?.edges.map(\.node) ?? []
            if posts.isEmpty {
                ContentUnavailableView(.noPosts, systemImage: "note.text")
            } else {
                List(posts, id: \.id) { post in
                    NavigationLink(value: Route.post(slug: post.slug, title: post.title)) {
                        HStack(spacing: 12) {
                            Text(post.title)
                                .font(.title3)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            if let thumbnail = post.thumbnailURL {
                                RemoteImage(url: thumbnail, aspectRatio: 4 / 3, contentMode: .fill)
                                    .frame(width: 120)
                                    .clipShape(.rect(cornerRadius: 6))
                            }
                        }
                    }
                    .accessibilityIdentifier("post-\(post.slug)")
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle(.posts)
    }
}

extension PostsQuery.Data.Posts.Edge.Node {
    fileprivate var thumbnailURL: URL? {
        guard let image = featuredMedia?.lazy.compactMap(\.asImageUpload).first,
            let crop = image.crops.best(forWidth: 360)
        else { return nil }
        return AppConfiguration.uploadURL(destination: image.destination, fileName: crop.fileName)
    }
}

#Preview {
    NavigationStack {
        PostList()
    }
}
