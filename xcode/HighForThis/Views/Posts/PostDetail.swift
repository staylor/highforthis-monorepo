import HighForThisAPI
import SwiftUI

struct PostDetail: View {
    let slug: String
    let title: String

    var body: some View {
        QueryView(PostQuery(slug: slug)) { data in
            if let post = data.post {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        PostTitle(text: post.title)
                        ForEach(Array(PostBlock.blocks(in: post.editorState).enumerated()), id: \.offset) { _, block in
                            PostBlockView(block: block)
                        }
                    }
                    .frame(maxWidth: 640, alignment: .leading)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical)
                }
            } else {
                NotFoundView()
            }
        }
        .detailTitle(title)
    }
}

/// The post's title as the website sets it: heavy capitals beside a bar of the accent color.
private struct PostTitle: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.title.weight(.black))
            .textCase(.uppercase)
            .padding(.leading, 16)
            .overlay(alignment: .leading) {
                Rectangle()
                    .fill(.tint)
                    .frame(width: 6)
            }
            .padding(.horizontal)
            .accessibilityAddTraits(.isHeader)
    }
}

private struct PostBlockView: View {
    let block: PostBlock

    var body: some View {
        switch block {
        case .heading(let level, let text):
            Heading(level: level, text: text)
                .padding(.horizontal)
        case .paragraph(let text):
            Text(text)
                .padding(.horizontal)
        case .quote(let text):
            Text(text)
                .italic()
                .padding(.leading, 16)
                .overlay(alignment: .leading) {
                    Rectangle()
                        .fill(.tint)
                        .frame(width: 3)
                }
                .padding(.horizontal)
        case .image(let url, let aspectRatio):
            RemoteImage(url: url, aspectRatio: aspectRatio)
        case .video(let video):
            VideoLink(video: video)
                .padding(.horizontal)
        }
    }
}

private struct Heading: View {
    let level: Int
    let text: AttributedString

    var body: some View {
        switch level {
        case 1:
            Text(text).font(.title.bold())
        case 2:
            Text(text).font(.title2.bold())
        case 3:
            // The website's section headings: heavy capitals over a dashed rule.
            VStack(alignment: .leading, spacing: 6) {
                Text(text)
                    .font(.title3.weight(.black))
                    .textCase(.uppercase)
                DashedRule()
                    .stroke(.tint, style: StrokeStyle(lineWidth: 2, dash: [4]))
                    .frame(height: 2)
            }
            .padding(.top, 8)
        default:
            Text(text).font(.headline)
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

#Preview {
    NavigationStack {
        PostDetail(slug: "best-albums-of-2023", title: "Best Albums of 2023")
    }
}
