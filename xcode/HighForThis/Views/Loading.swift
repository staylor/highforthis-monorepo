import SwiftUI

struct Loading: View {
    var body: some View {
        ProgressView()
              .progressViewStyle(CircularProgressViewStyle(tint: .accentColor))
              .scaleEffect(2.0, anchor: .center)
    }
}

#Preview {
    Loading()
}
