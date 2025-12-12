import SwiftUI
import HighForThisAPI

struct Line: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: rect.width, y: 0))
        return path
    }
}

struct HeadingNode: View {
    var heading: PostData.EditorState.Root.Child.AsHeadingNode

    var body: some View {
        TextBlock {
            if let tag = heading.tag?.rawValue {
                switch tag {
                case "h2":
                    Text(tag).font(.headline)
                case "h3":
                    Group {
                        (heading.children ?? []).compactMap { child -> Text? in
                            guard let textNode = child?.asTextNode,
                                  let text = textNode.text else {
                                return nil
                            }
                            let v = Text(text.uppercased()).font(.title3).fontWeight(.black)
                            return formatText(view: v, format: textNode.format ?? 0)
                        }.reduce(Text(verbatim: ""), +)
                    }
                    Line()
                        .stroke(style: .init(lineWidth: 2, dash: [4]))
                        .foregroundStyle(.accent)
                        .frame(height: 4)
                        .containerRelativeFrame(.horizontal) { length, _ in
                            length * 0.92
                        }
                case "h4":
                    Text(tag).font(.headline)
                default:
                    EmptyView()
                }
            }
        }
    }
}
