import SwiftUI

struct AppWrapper <Content: View>: View {
    var content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) { self.content = content }
    
    var body: some View {
        NavigationStack {
            content()
        }
        .accentColor(.pink)
        .toolbarBackground(.hidden, for: .navigationBar)
    }
}
