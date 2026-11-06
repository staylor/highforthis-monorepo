import HighForThisAPI
import SwiftUI

struct PostDetail: View {
    let slug: String
    let title: String

    var body: some View {
        QueryView(PostQuery(slug: slug)) { data in
            if let post = data.post {
                PostReader(post: post)
            } else {
                NotFoundView()
            }
        }
        .detailTitle(title)
    }
}

private struct PostReader: View {
    let post: PostQuery.Data.Post
    @State private var blocks: [PostBlock] = []

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 20) {
                Text(post.title)
                    .font(.title.weight(.black))
                    .textCase(.uppercase)
                    .padding(.leading, 16)
                    .overlay(alignment: .leading) {
                        Rectangle().fill(.tint).frame(width: 6)
                    }
                    .accessibilityAddTraits(.isHeader)
                ForEach(Array(blocks.enumerated()), id: \.offset) { index, block in
                    PostBlockView(block: block)
                        .focusableForReading()
                        .accessibilityIdentifier("post-block-\(index)")
                }
            }
            .selectableText()
            .frame(maxWidth: .readable(680), alignment: .leading)
            .padding()
            .frame(maxWidth: .infinity)
        }
        .task(id: post.editorState) { blocks = PostBlock.blocks(in: post.editorState) }
    }
}

private struct PostBlockView: View {
    let block: PostBlock

    var body: some View {
        switch block {
        case .heading(let level, let text):
            VStack(alignment: .leading, spacing: 8) {
                Text(text)
                    .font(level == 1 ? .title.bold() : level == 2 ? .title2.bold() : .title3.weight(.black))
                    .textCase(level == 3 ? .uppercase : nil)
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityAddTraits(.isHeader)
                if level == 3 {
                    DashedRule()
                        .stroke(.tint, style: StrokeStyle(lineWidth: 2, dash: [4]))
                        .frame(height: 2)
                        .accessibilityHidden(true)
                }
            }
            .padding(.top, 8)
        case .paragraph(let text):
            Text(text).fixedSize(horizontal: false, vertical: true)
        case .quote(let text):
            Text(text)
                .italic()
                .fixedSize(horizontal: false, vertical: true)
                .padding(.leading, 16)
                .overlay(alignment: .leading) {
                    Rectangle().fill(.tint).frame(width: 3)
                }
        case .code(let text):
            #if os(tvOS)
            // The remote can't scroll sideways through text that doesn't take focus, so long lines wrap.
            Text(text)
                .font(.body.monospaced())
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.quaternary, in: .rect(cornerRadius: 8))
            #else
            ScrollView(.horizontal) {
                Text(text).font(.body.monospaced()).padding()
            }
            .background(.quaternary, in: .rect(cornerRadius: 8))
            #endif
        case .image(let url, let aspectRatio, let altText):
            RemoteImage(url: url, aspectRatio: aspectRatio)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(altText)
                .accessibilityHidden(altText.isEmpty)
                .accessibilityAddTraits(.isImage)
        case .video(let video):
            VideoLink(video: video)
        }
    }
}

private nonisolated struct DashedRule: Shape {
    func path(in rect: CGRect) -> Path {
        Path { path in
            path.move(to: CGPoint(x: rect.minX, y: rect.midY))
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        }
    }
}
