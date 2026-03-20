import SwiftUI

struct ImageLoading: View {
    var width: CGFloat?
    var height: CGFloat?
    @State private var animating = false

    var body: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(Color(.systemGray5))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .fill(
                        LinearGradient(
                            colors: [.clear, Color(.systemGray4), .clear],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .offset(x: animating ? 200 : -200)
            )
            .clipped()
            .opacity(animating ? 1 : 0.7)
            .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: animating)
            .onAppear { animating = true }
            .frame(width: width, height: height)
    }
}

#Preview {
    AppWrapper {
        ImageLoading(width: 300, height: 300)
    }
}
