import SwiftUI
import HighForThisAPI

typealias PostListNode = HighForThisAPI.PostsQuery.Data.Posts.Edge.Node

struct PostList: View {
    @State private var posts: [PostListNode]?

    var body: some View {
        Group {
            if let posts {
                if posts.isEmpty {
                    ContentUnavailableView(
                        L10N("noPosts"),
                        systemImage: "doc.text"
                    )
                } else {
                    List {
                        ForEach(posts, id: \.self) { post in
                            NavigationLink {
                                Post(slug: post.slug)
                            } label: {
                                PostListRow(post: post)
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle(L10N("posts"))
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
