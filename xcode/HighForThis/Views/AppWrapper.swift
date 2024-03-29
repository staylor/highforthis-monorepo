import SwiftUI

struct AppWrapper <Content: View>: View {
    var content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) { self.content = content }
    
    var body: some View {
        NavigationStack {
            content()
        }
        .accentColor(.pink)
        #if os(iOS)
        .toolbarBackground(.hidden, for: .navigationBar)
        #elseif os(macOS)
        .frame(minWidth: 640, minHeight: 640)
        .background(.white)
        #endif
    }
}
