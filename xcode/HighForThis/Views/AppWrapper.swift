import SwiftUI

struct AppWrapper <Content: View>: View {
    var content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) { self.content = content }
    
    var body: some View {
        content()
        #if os(macOS)
        .frame(minWidth: 640, minHeight: 640)
        .background(Color(.systemBackground))
        #endif
    }
}
