import SwiftUI
import CachedAsyncImage
import HighForThisAPI

typealias PostListNode = HighForThisAPI.PostsQuery.Data.Posts.Edge.Node

struct PostList: View {
    @State var posts: [PostListNode]?

    var body: some View {
        VStack(alignment: .leading) {
            if posts == nil {
                Spacer()
                Loading()
            } else if posts!.count == 0 {
                Text(L10N("noPosts"))
            } else {
                List {
                    ForEach(posts!, id: \.self) { post in
                        NavigationLink {
                            Post(slug: post.slug)
                        } label: {
                            HStack {
                                Text(post.title).font(.title3)
                                Spacer()
                                if let thumb = post.featuredMedia!.first?.asImageUpload! {
                                    let thumbUrl = cdnUrl("\(thumb.destination)/\(thumb.crops.first!.fileName)")
                                    let url = URL(string: thumbUrl)
                                    CachedAsyncImage(url: url) { image in
                                        image.resizable()
                                            .scaledToFill()
                                            .frame(width: 120, height: 90, alignment: .center)
                                            .clipped()
                                    }  placeholder: {
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
            Spacer()
        }.onAppear() {
            let query = HighForThisAPI.PostsQuery()
            getData(query) { data in
                var nodes = [PostListNode]()
                for edge in data.posts!.edges {
                    nodes.append(edge.node)
                }
                self.posts = nodes
            }
        }
    }
}

#Preview {
    AppWrapper {
        PostList()
    }
}
