import SwiftUI

struct ImageLoading: View {
    @State private var blinking: Bool = false
    
    var body: some View {
        Stripes(config: StripesConfig(
            background: Color.gray.opacity(0.25),
            foreground: Color.black.opacity(0.55)
        ))
            .opacity(blinking ? 0.3 : 1)
            .animation(.easeInOut(duration: 0.75).repeatForever(), value: blinking)
            .onAppear {
                blinking.toggle()
            }
    }
}

#Preview {
    ImageLoading()
}
