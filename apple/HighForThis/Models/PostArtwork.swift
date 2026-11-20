import Foundation
import HighForThisAPI

/// An image a post's row shows: one of the album covers in the post, or its featured image.
nonisolated struct PostArtworkImage: Hashable, Identifiable {
    let id: String
    let url: URL

    /// How many images a row has room for.
    static let maximumCount = 5

    init(id: String, destination: String, fileName: String) {
        self.id = id
        self.url = AppConfiguration.uploadURL(destination: destination, fileName: fileName)
    }

    /// `images` in an order set by `seed` alone: by the hash of the seed and each image's ID, FNV-1a over UTF-16 code
    /// units, as the website's post artwork orders them.
    fileprivate static func shuffled(_ images: [PostArtworkImage], seed: String) -> [PostArtworkImage] {
        images.enumerated()
            .map { (hash: hash("\(seed):\($1.id)"), offset: $0, image: $1) }
            .sorted { ($0.hash, $0.offset) < ($1.hash, $1.offset) }
            .map(\.image)
    }

    private static func hash(_ value: String) -> UInt32 {
        var hash: UInt32 = 2_166_136_261
        for unit in value.utf16 {
            hash ^= UInt32(unit)
            hash = hash &* 16_777_619
        }
        return hash
    }
}

nonisolated extension PostsQuery.Data.Posts.Edge.Node {
    /// The images the post's row shows, picked as the website's post cards pick them: each album cover in the post
    /// once, or the featured images when it has none, as the narrowest crop at least `width` pixels wide. The seed
    /// shuffles them, so a list can show a different few each time it's opened, and the same ones while it's open.
    func artwork(seed: String, width: Int) -> [PostArtworkImage] {
        var seen = Set<String>()
        let covers = (editorState?.root?.children ?? []).compactMap { $0?.asImageNode?.image }
            .filter { seen.insert($0.id).inserted }
            .compactMap { image in
                image.crops.best(forWidth: width).map {
                    PostArtworkImage(id: image.id, destination: image.destination, fileName: $0.fileName)
                }
            }
        let featured = (featuredMedia ?? []).compactMap(\.asImageUpload).compactMap { image in
            image.crops.best(forWidth: width).map {
                PostArtworkImage(id: image.id, destination: image.destination, fileName: $0.fileName)
            }
        }
        let images = PostArtworkImage.shuffled(covers.isEmpty ? featured : covers, seed: seed)
        return Array(images.prefix(PostArtworkImage.maximumCount))
    }
}
