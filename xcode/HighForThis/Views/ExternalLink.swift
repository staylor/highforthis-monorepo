import SwiftUI

struct ExternalLink: View {
    var url: String
    var label: LocalizedStringKey
    var color: Color = .accentColor
    @Environment(\.openURL) private var openURL

    var body: some View {
        Button {
            guard let url = URL(string: url) else { return }
            openURL(url)
        } label: {
            Label(label, systemImage: "arrow.up.right.square")
        }
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
