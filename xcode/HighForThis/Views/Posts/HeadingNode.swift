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
            switch heading.tag!.rawValue {
            case "h2":
                Text("\(heading.tag!.rawValue)").font(.headline)
            case "h3":
                Group {
                    heading.children!.map {
                        let node = $0!.asTextNode!
                        let v = Text(node.text!).font(.title3).bold()
                        return formatText(view: v, format: node.format!)
                    }.reduce(Text(""), +)
                }
                Line()
                    .stroke(style: .init(lineWidth: 2, dash: [4]))
                    .foregroundStyle(.pink)
                    .frame(height: 4)
                    .containerRelativeFrame(.horizontal) { length, axis in
                        length * 0.92
                    }
            case "h4":
                Text("\(heading.tag!.rawValue)").font(.headline)
            default:
                EmptyView()
            }
        }
    }
}
