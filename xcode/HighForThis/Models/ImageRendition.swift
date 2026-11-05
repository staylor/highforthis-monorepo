import HighForThisAPI

/// One of the sizes an image is available in: the CMS resizes uploads into crops, and YouTube offers thumbnails.
nonisolated protocol ImageRendition {
    var width: Int { get }
}

nonisolated extension Collection where Element: ImageRendition {
    /// The narrowest rendition at least `width` pixels wide, or the widest when none is.
    func best(forWidth width: Int) -> Element? {
        let valid = filter { $0.width > 0 }
        return valid.filter { $0.width >= width }.min { $0.width < $1.width } ?? valid.max { $0.width < $1.width }
    }
}

nonisolated extension PostsQuery.Data.Posts.Edge.Node.FeaturedMedium.AsImageUpload.Crop: ImageRendition {}
nonisolated extension PostQuery.Data.Post.EditorState.Root.Child.AsImageNode.Image.Crop: ImageRendition {}
nonisolated extension Video_video.Thumbnail: ImageRendition {}
