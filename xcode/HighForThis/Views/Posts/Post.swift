import SwiftUI
import CachedAsyncImage
import HighForThisAPI

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
                                .padding(16)
                        }.overlay(
                            Rectangle()
                                .frame(width: 8, height: nil, alignment: .leading)
                                .foregroundColor(.accentColor),
                            alignment: .leading
                        )
                        #if os(iOS)
                        .padding(.leading, 16)
                        #elseif os(macOS)
                        .padding(.leading, 8)
                        #endif
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
                    }.frame(maxWidth: min(screenWidth, 640))
                }
                .padding(.top, 16)
            }
            Spacer()
        }
        .onAppear() {
            let query = HighForThisAPI.PostQuery(slug: slug)
            getData(query) { data in
                self.post = data.post!
            }
        }
    }
}

#Preview {
    AppWrapper {
        Post(slug: "best-albums-of-2016")
    }
}
