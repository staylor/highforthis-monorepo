import SwiftUI
import HighForThisAPI

struct ImageNode: View {
    var image: PostData.EditorState.Root.Child.AsImageNode.Image
    
    var body: some View {
        if let crop = image.crops.first(where: { $0.width == 640 }) {
            let imageUrl = cdnUrl("\(image.destination)/\(crop.fileName)")
            let aspectRatio = CGFloat(crop.width) / CGFloat(crop.height)

            AsyncImage(url: URL(string: imageUrl)) { image in
                image.resizable()
                    .aspectRatio(contentMode: .fit)
            } placeholder: {
                Rectangle()
                    .fill(.quaternary)
                    .aspectRatio(aspectRatio, contentMode: .fit)
            }
            .frame(maxWidth: 640)
        }
    }
}
