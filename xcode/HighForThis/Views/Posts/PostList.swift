import SwiftUI
import CachedAsyncImage

struct PostList: View {
    @State var posts: [PostListNode]?

    var body: some View {
        VStack(alignment: .leading) {
            if posts == nil {
                Spacer()
                Loading()
            } else if posts!.count == 0 {
                Text("No posts.")
            } else {
                TextBlock {
                    Text("Posts").font(.title).fontWeight(.black)
                }
                List {
                    ForEach(posts!, id: \.self) { post in
                        NavigationLink {
                            Post(slug: post.slug)
                        } label: {
                            HStack {
                                Text(post.title).font(.headline)
                                if let thumb = post.featuredMedia!.first?.asImageUpload! {
                                    let thumbUrl = cdnUrl("\(thumb.destination)/\(thumb.crops.first!.fileName)")
                                    let url = URL(string: thumbUrl)
                                    Spacer()
                                    CachedAsyncImage(url: url) { image in
                                        image.resizable()
                                            .scaledToFill()
                                            .frame(width: 120, height: 90, alignment: .center)
                                            .clipped()
                                    }  placeholder: {
                                        ImageLoading().frame(width: 120, height: 90)
                                    }
                                }
                            }
                        }
                    }
                }.listStyle(.plain)
            }
            Spacer()
        }.onAppear() {
            getPosts() { nodes in
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
