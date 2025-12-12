import SwiftUI
import HighForThisAPI

struct ElementNode: View {
    var node: PostData.EditorState.Root.Child.AsElementNode

    var body: some View {
        switch node.type {
        case "paragraph":
            TextBlock {
                (node.children ?? []).compactMap { child -> Text? in
                    guard let child else { return nil }
                    if child.__typename == "LinebreakNode" {
                        return Text(verbatim: "\n")
                    }
                    guard let textNode = child.asTextNode,
                          let text = textNode.text else {
                        return nil
                    }
                    let v = Text(text)
                    return formatText(view: v, format: textNode.format ?? 0)
                }.reduce(Text(verbatim: ""), +)
            }
        default:
            EmptyView()
        }
    }
}
