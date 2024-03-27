import SwiftUI
import CachedAsyncImage

struct Post: View {
    var slug: String
    @State private var post: PostData?

    var body: some View {
        VStack(alignment: .leading) {
            if post == nil {
                Spacer()
                Loading()
            } else {
                let post = post!
                ScrollView {
                    VStack(alignment: .leading) {
                        HStack {
                            Text(post.title.uppercased())
                                .font(.title)
                                .fontWeight(.black)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                        }.overlay(
                            Rectangle()
                                .frame(width: 8, height: nil, alignment: .leading)
                                .foregroundColor(Color.pink),
                            alignment: .leading
                        ).padding(.leading, 16)
                        ForEach(post.editorState!.root!.children!, id: \.self) { child in
                            switch child!.__typename! {
                            case "HeadingNode":
                                let elem = child!.asHeadingNode!
                                HeadingNode(heading: elem)
                            case "ImageNode":
                                let image = child!.asImageNode!.image!
                                ImageNode(image: image)
                            case "ElementNode":
                                let elem = child!.asElementNode!
                                ElementNode(node: elem)
                            default:
                                EmptyView()
                            }
                        }
                    }
                }

            }
            Spacer()
        }
        .onAppear() {
            getPost(slug: slug) { post in
                self.post = post
            }
        }
    }
}

#Preview {
    Post(slug: "best-albums-of-2013")
}
