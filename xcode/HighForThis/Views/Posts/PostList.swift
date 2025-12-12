import SwiftUI
import CachedAsyncImage
import HighForThisAPI

typealias PostListNode = HighForThisAPI.PostsQuery.Data.Posts.Edge.Node

struct PostList: View {
    @State private var posts: [PostListNode]?

    var body: some View {
        VStack(alignment: .leading) {
            if let posts {
                if posts.isEmpty {
                    Text(L10N("noPosts"))
                } else {
                    List {
                        ForEach(posts, id: \.self) { post in
                            NavigationLink {
                                Post(slug: post.slug)
                            } label: {
                                HStack {
                                    Text(post.title).font(.title3)
                                    Spacer()
                                    if let thumb = post.featuredMedia?.first?.asImageUpload,
                                       let crop = thumb.crops.first {
                                        let thumbUrl = cdnUrl("\(thumb.destination)/\(crop.fileName)")
                                        CachedAsyncImage(url: URL(string: thumbUrl)) { image in
                                            image.resizable()
                                                .scaledToFill()
                                                .frame(width: 120, height: 90, alignment: .center)
                                                .clipped()
                                        } placeholder: {
                                            ImageLoading(width: 120, height: 90)
                                        }
                                    } else {
                                        Rectangle().fill(.pink).frame(width: 120, height: 90)
                                    }
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .navigationTitle(L10N("posts"))
                }
            } else {
                Spacer()
                Loading()
            }
            Spacer()
        }
        .task {
            let query = HighForThisAPI.PostsQuery()
            if let data = await fetchData(query) {
                posts = data.posts?.edges.map { $0.node } ?? []
            }
        }
    }
}

#Preview {
    AppWrapper {
        PostList()
    }
}
