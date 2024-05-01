import SwiftUI

struct ExternalLink: View {
    var url: String
    var label: String
    var color: Color = .accentColor
    @Environment(\.openURL) private var openURL
    
    var body: some View {
        Button(label, systemImage: "arrow.up.right.square", action: {
            let url = URL(string: url)
            openURL(url!)
        })
        .foregroundColor(color)
        .buttonStyle(.plain)
        .font(.title3)
    }
}

#Preview("Default") {
    ExternalLink(url: "https://highforthis.com", label: "Artist Website")
}

#Preview("Color") {
    ExternalLink(url: "https://highforthis.com", label: "Artist Website", color: .green)
}
