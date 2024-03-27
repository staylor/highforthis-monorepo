import SwiftUI
import HighForThisAPI
import CachedAsyncImage

struct ImageNode: View {
    var image: PostData.EditorState.Root.Child.AsImageNode.Image
    
    var body: some View {
        if let crop = image.crops.first(where: { $0.width == 640 }) {
            let imageUrl = cdnUrl("\(image.destination)/\(crop.fileName)")
            let url = URL(string: imageUrl)
            let width = CGFloat(crop.width)
            let height = CGFloat(crop.height)
            
            let ratio = (UIScreen.main.bounds.width / width) * width
            let resizedHeight = height == width ? ratio : (height / width) * ratio
            
            CachedAsyncImage(url: url) { image in
                image.resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: ratio, height: resizedHeight)
            }  placeholder: {
                ImageLoading().frame(width: ratio, height: resizedHeight)
            }
        } else {
            EmptyView()
        }
    }
}
