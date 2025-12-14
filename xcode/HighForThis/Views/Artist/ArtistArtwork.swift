import SwiftUI
import HighForThisAPI

struct ArtistArtwork: View {
    var url: String
    var width: Int
    var height: Int
    @State private var isAnimating = false

    private var aspectRatio: CGFloat {
        CGFloat(width) / CGFloat(height)
    }

    var body: some View {
        GeometryReader { geometry in
            let containerWidth = geometry.size.width
            let imageHeight = containerWidth / aspectRatio

            AsyncImage(url: URL(string: resizedUrl(for: containerWidth))) { image in
                image.resizable()
                    .aspectRatio(aspectRatio, contentMode: .fit)
                    .opacity(isAnimating ? 1 : 0)
                    .onAppear {
                        withAnimation(.easeInOut(duration: 0.5)) {
                            isAnimating = true
                        }
                    }
            } placeholder: {
                Rectangle()
                    .fill(.quaternary)
            }
            .frame(width: containerWidth, height: imageHeight)
        }
        .aspectRatio(aspectRatio, contentMode: .fill)
        .onChange(of: url) {
            isAnimating = false
        }
    }

    func resizedUrl(for containerWidth: CGFloat) -> String {
        let fullWidth = Int(containerWidth) * 2
        let resizedHeight = Int(Double(height) / Double(width) * Double(fullWidth))
        return url
            .replacingOccurrences(of: "{w}", with: "\(fullWidth)")
            .replacingOccurrences(of: "{h}", with: "\(resizedHeight)")
    }
}

#Preview {
    VStack(alignment: .leading) {
        ArtistArtwork(
            url: PREVIEW_ARTWORK_URL,
            width: PREVIEW_ARTWORK_WIDTH,
            height: PREVIEW_ARTWORK_HEIGHT
        )
        Spacer()
    }.ignoresSafeArea(edges: UIDevice.current.userInterfaceIdiom == .phone ? .all : [])
}

let PREVIEW_ARTWORK_URL = "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages116/v4/34/dd/36/34dd3678-40c6-9d8b-fa0f-cb6d82d3103b/6c46071d-e4d2-4671-a110-6ad83a63b89b_ami-identity-5b05d351a6e3c7256ef7680c8aef2894-2023-06-30T03-58-10.754Z_cropped.png/{w}x{h}bb.jpg"
let PREVIEW_ARTWORK_WIDTH = 1260
let PREVIEW_ARTWORK_HEIGHT = 1260
