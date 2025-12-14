import SwiftUI
import HighForThisAPI

struct Post: View {
    var slug: String
    @State private var post: PostData?

    var body: some View {
        VStack(alignment: .leading) {
            if let post {
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
                        if let children = post.editorState?.root?.children {
                            ForEach(children, id: \.self) { child in
                                if let typename = child?.__typename {
                                    switch typename {
                                    case "HeadingNode":
                                        if let elem = child?.asHeadingNode {
                                            HeadingNode(heading: elem)
                                        }
                                    case "ImageNode":
                                        if let image = child?.asImageNode?.image {
                                            ImageNode(image: image)
                                        }
                                    case "ElementNode":
                                        if let elem = child?.asElementNode {
                                            ElementNode(node: elem)
                                        }
                                    default:
                                        EmptyView()
                                    }
                                }
                            }
                        }
                    }.frame(maxWidth: 640)
                }
                .padding(.top, 16)
            } else {
                Spacer()
                Loading()
            }
            Spacer()
        }
        .task {
            let query = HighForThisAPI.PostQuery(slug: slug)
            if let data = await fetchData(query) {
                post = data.post
            }
        }
    }
}

#Preview {
    Post(slug: "best-albums-of-2016")
}
