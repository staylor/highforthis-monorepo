import SwiftUI

struct InternalLink <Content: View>: View {
    var label: String
    var color: Color
    var content: () -> Content
    
    init(_ label: String, color: Color = .black, @ViewBuilder content: @escaping () -> Content) {
        self.label = label
        self.color = color
        self.content = content
    }
    
    var body: some View {
        NavigationLink(destination: {
            content()
        }) {
            Group {
                Text(label).font(.title) + Text(verbatim: " →").font(.title2)
            }.foregroundColor(color)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    AppWrapper {
        InternalLink("Foo") {
            EmptyView()
        }
    }
}
