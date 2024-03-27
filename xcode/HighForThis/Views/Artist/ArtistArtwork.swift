import SwiftUI
import HighForThisAPI
import CachedAsyncImage

struct ArtistArtwork: View {
    var url: String
    var width: Int
    var height: Int
    @State private var isAnimating = false
    
    var body: some View {
        CachedAsyncImage(url: URL(string: resizedUrl())) { image in
            image.resizable()
                .aspectRatio(contentMode: .fit)
                .ignoresSafeArea()
                .opacity(isAnimating ? 1 : 0)
                .onAppear() {
                    withAnimation(.easeInOut(duration: 0.5)) {
                        isAnimating = true
                    }
                }
        } placeholder: {
            ImageLoading().frame(maxHeight: screenWidth)
        }
    }
    
    func resizedUrl() -> String {
        let fullWidth = Int(screenWidth) * 2
        let resizedHeight = height == width ? fullWidth : (height / width) * fullWidth
        return url
            .replacingOccurrences(of: "{w}", with: "\(fullWidth)")
            .replacingOccurrences(of: "{h}", with: "\(resizedHeight)")
    }
    
    private(set) var screenWidth: CGFloat = {
        return UIScreen.main.bounds.width.rounded(.up)
    }()
}

#Preview {
    VStack(alignment: .leading) {
        ArtistArtwork(
            url: PREVIEW_ARTWORK_URL,
            width: PREVIEW_ARTWORK_WIDTH,
            height: PREVIEW_ARTWORK_HEIGHT
        )
        Spacer()
    }.ignoresSafeArea()
}

let PREVIEW_ARTWORK_URL = "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages116/v4/34/dd/36/34dd3678-40c6-9d8b-fa0f-cb6d82d3103b/6c46071d-e4d2-4671-a110-6ad83a63b89b_ami-identity-5b05d351a6e3c7256ef7680c8aef2894-2023-06-30T03-58-10.754Z_cropped.png/{w}x{h}bb.jpg"
let PREVIEW_ARTWORK_WIDTH = 1260
let PREVIEW_ARTWORK_HEIGHT = 1260
