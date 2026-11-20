import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct PostArtworkTests {
    private nonisolated static func image(_ id: String, widths: [Int] = [150, 300, 640]) -> Mock<ImageUpload> {
        Mock<ImageUpload>(
            crops: widths.map { Mock<ImageUploadCrop>(fileName: "\(id)-\($0).jpg", width: $0) }, destination: "2023/12", id: id)
    }

    private nonisolated static func post(covers: [String], coverWidths: [Int] = [150, 300, 640], featured: [String] = []) async
        -> PostsQuery.Data.Posts.Edge.Node
    {
        let imageNodes = covers.map { Mock<ImageNode>(image: image($0, widths: coverWidths)) }
        let children: [(any AnyMock)?] = [Mock<HeadingNode>()] + imageNodes + [nil]
        return await PostsQuery.Data.Posts.Edge.Node.from(
            Mock<Post>(
                editorState: Mock<EditorState>(root: Mock<ElementNode>(children: children)), featuredMedia: featured.map { image($0) },
                id: "post")
        )
    }

    @Test func albumCoversReplaceTheFeaturedImage() async {
        let post = await Self.post(covers: ["cover-a", "cover-b"], featured: ["featured"])

        let artwork = post.artwork(seed: "seed", width: 300)

        #expect(Set(artwork.map(\.id)) == ["cover-a", "cover-b"])
        #expect(artwork.contains { $0.url.absoluteString == "https://storage.googleapis.com/wonderboymusic/2023/12/cover-a-300.jpg" })
    }

    @Test func aCoverInThePostTwiceShowsOnce() async {
        let post = await Self.post(covers: ["cover-a", "cover-b", "cover-a"])

        #expect(post.artwork(seed: "seed", width: 300).map(\.id).sorted() == ["cover-a", "cover-b"])
    }

    @Test func aRowShowsFiveCovers() async {
        let post = await Self.post(covers: (1...7).map { "cover-\($0)" })

        let artwork = post.artwork(seed: "seed", width: 300)

        #expect(artwork.count == 5)
        #expect(Set(artwork.map(\.id)).count == 5)
    }

    @Test func postsWithoutUsableCoversShowTheirFeaturedImage() async {
        let withoutCovers = await Self.post(covers: [], featured: ["featured"])
        let withoutCrops = await Self.post(covers: ["cover-a"], coverWidths: [], featured: ["featured"])

        for post in [withoutCovers, withoutCrops] {
            #expect(
                post.artwork(seed: "seed", width: 300).map(\.url.absoluteString) == [
                    "https://storage.googleapis.com/wonderboymusic/2023/12/featured-300.jpg"
                ])
        }
    }

    @Test func theSeedSetsTheOrder() async {
        let post = await Self.post(covers: (1...5).map { "cover-\($0)" })
        let order = { (seed: String) in post.artwork(seed: seed, width: 300).map(\.id) }

        #expect(order("list-a") == order("list-a"))
        #expect(order("list-a") != order("list-b"))
        #expect(Set(order("list-a")) == Set(order("list-b")))
    }
}
