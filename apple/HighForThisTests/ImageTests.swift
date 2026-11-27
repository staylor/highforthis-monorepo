import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct ImageTests {
    private nonisolated struct Rendition: ImageRendition {
        let width: Int
    }

    @Test func artworkIsScaledDownToTheMaximumWidth() throws {
        let artwork = try #require(Artwork(template: "https://example.com/{w}x{h}bb.jpg", width: 3000, height: 2000))
        #expect(artwork.url.absoluteString == "https://example.com/1500x1000bb.jpg")
        #expect(artwork.aspectRatio == 1.5)
    }

    @Test func smallArtworkKeepsItsSize() throws {
        let artwork = try #require(Artwork(template: "https://example.com/{w}x{h}bb.jpg", width: 600, height: 400))
        #expect(artwork.url.absoluteString == "https://example.com/600x400bb.jpg")
    }

    private nonisolated static let incompleteArtwork: [(template: String?, width: Int?, height: Int?)] = [
        (nil, 100, 100),
        ("https://example.com/{w}x{h}bb.jpg", nil, 100),
        ("https://example.com/{w}x{h}bb.jpg", 100, 0),
    ]

    @Test(arguments: incompleteArtwork)
    func artworkNeedsATemplateAndASize(artwork: (template: String?, width: Int?, height: Int?)) {
        #expect(Artwork(template: artwork.template, width: artwork.width, height: artwork.height) == nil)
        #expect(ArtworkTemplate(template: artwork.template, width: artwork.width, height: artwork.height) == nil)
    }

    private nonisolated static let template = "https://example.com/{w}x{h}bb.jpg"

    // The square beside a detail screen's header, as an iPad draws it
    @Test func artworkFillingASquareIsDownloadedAtTheSquaresSize() throws {
        let square = try #require(ArtworkTemplate(template: Self.template, width: 3000, height: 3000))
        #expect(square.filling(square: 260, scale: 2)?.url.absoluteString == "https://example.com/520x520bb.jpg")
        // Artwork wider than it's tall is as tall as the square, so wider than it
        let wide = try #require(ArtworkTemplate(template: Self.template, width: 3000, height: 2000))
        #expect(wide.filling(square: 260, scale: 2)?.url.absoluteString == "https://example.com/780x520bb.jpg")
    }

    // Across a phone's screen, in a frame no taller than 440 points
    @Test func artworkAcrossTheScreenIsDownloadedNoBiggerThanItsFrame() throws {
        let square = try #require(ArtworkTemplate(template: Self.template, width: 3000, height: 3000))
        #expect(square.fitting(height: 440, scale: 3)?.url.absoluteString == "https://example.com/1320x1320bb.jpg")
        let tall = try #require(ArtworkTemplate(template: Self.template, width: 1000, height: 4000))
        #expect(tall.fitting(height: 440, scale: 3)?.url.absoluteString == "https://example.com/330x1320bb.jpg")
    }

    @Test func artworkIsNeverDownloadedBiggerThanTheLargestOrThanItIs() throws {
        let wide = try #require(ArtworkTemplate(template: Self.template, width: 4000, height: 1000))
        #expect(wide.fitting(height: 440, scale: 3)?.url.absoluteString == "https://example.com/1500x375bb.jpg")
        let small = try #require(ArtworkTemplate(template: Self.template, width: 400, height: 400))
        #expect(small.fitting(height: 440, scale: 3)?.url.absoluteString == "https://example.com/400x400bb.jpg")
    }

    @Test func bestRenditionIsTheNarrowestThatIsWideEnough() {
        #expect([300, 1200, 640, 150].map(Rendition.init).best(forWidth: 360)?.width == 640)
    }

    @Test func bestRenditionFallsBackToTheWidest() {
        #expect([150, 300].map(Rendition.init).best(forWidth: 360)?.width == 300)
        #expect([Rendition]().best(forWidth: 360) == nil)
    }

    @Test func portraitArtworkBoundsBothDimensions() throws {
        let artwork = try #require(Artwork(template: "https://example.com/{w}x{h}.jpg", width: 1000, height: 4000))
        #expect(artwork.url.absoluteString == "https://example.com/375x1500.jpg")
        #expect(artwork.aspectRatio == 0.25)
    }

    @Test func invalidImageDimensionsAreRejected() {
        #expect(Artwork(template: "https://example.com/{w}x{h}.jpg", width: 100, height: 100, maximumWidth: 0) == nil)
        #expect([0, -50].map(Rendition.init).best(forWidth: 300) == nil)
    }

    @Test(arguments: ["", "relative/path", "javascript:alert(1)", "file:///etc/passwd", "https://user:password@example.com"])
    func externalLinksRequireWebURLs(_ value: String) {
        #expect(URL.webURL(value) == nil)
    }

    @Test func externalLinksAllowHTTPSAndHTTP() {
        #expect(URL.webURL("https://example.com/artist")?.host == "example.com")
        #expect(URL.webURL("http://example.com")?.host == "example.com")
    }

    @Test func uploadsAreInTheCMSBucket() {
        let url = AppConfiguration.uploadURL(destination: "2023/12", fileName: "8f0d347b0c91317f-640x0.jpg")
        #expect(url.absoluteString == "https://storage.googleapis.com/wonderboymusic/2023/12/8f0d347b0c91317f-640x0.jpg")
    }

    @Test func videosOpenOnYouTube() async {
        let video = await Video_video.from(Mock<Video>(dataId: "fbFeM3QW8Cc"))
        #expect(video.youTubeURL.absoluteString == "https://www.youtube.com/watch?v=fbFeM3QW8Cc")
    }
}
