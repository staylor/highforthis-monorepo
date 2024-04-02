import SwiftUI

struct ExternalLink: View {
    var url: String
    var label: String
    @Environment(\.openURL) private var openURL
    
    var body: some View {
        Button(action: {
            let url = URL(string: url)
            openURL(url!)
        }) {
            Text("\(label) →").foregroundColor(.accentColor)
        }
        .buttonStyle(.plain)
        .font(.title3)
    }
}
