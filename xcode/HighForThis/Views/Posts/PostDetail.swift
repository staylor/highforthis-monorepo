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
                        .padding(.top, block.spacingAbove)
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
            if level == 3 {
                // Album titles, as the website draws an h3: bold, over a dashed rule as wide as the title and its padding.
                Text(text)
                    .font(.title2.bold())
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(EdgeInsets(top: 4, leading: 2, bottom: 6, trailing: 24))
                    .overlay(alignment: .bottom) {
                        DashedRule()
                            .stroke(.tint, style: StrokeStyle(lineWidth: 2, dash: [6, 5]))
                            .frame(height: 2)
                            .accessibilityHidden(true)
                    }
                    .accessibilityAddTraits(.isHeader)
            } else {
                Text(text)
                    .font(level == 1 ? .title.bold() : level == 2 ? .title2.bold() : .title3.weight(.black))
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityAddTraits(.isHeader)
            }
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

extension PostBlock {
    /// Room above a heading, beyond the blocks' spacing, outside the tvOS focus highlight. After a paragraph, the website
    /// leaves 48 points above an album title: the paragraph's margin and the title's own.
    fileprivate var spacingAbove: CGFloat {
        guard case .heading(let level, _) = self else { return 0 }
        return level == 3 ? 28 : 8
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
