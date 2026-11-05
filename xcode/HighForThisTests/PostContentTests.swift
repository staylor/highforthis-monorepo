import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import SwiftUI
import Testing

@testable import HighForThis

struct PostContentTests {
    @Test func formatBitsMatchLexical() {
        #expect(LexicalFormat(rawValue: 11) == [.bold, .italic, .underline])
        #expect(LexicalFormat(rawValue: 20) == [.strikethrough, .code])
    }

    @Test func formatsCombine() {
        let text = AttributedString(lexicalRuns: [
            .text("bold italic", [.bold, .italic]),
            .text(" underlined", .underline),
            .lineBreak,
            .text("plain"),
        ])

        #expect(String(text.characters) == "bold italic underlined\nplain")
        let runs = Array(text.runs)
        #expect(runs.count == 3)
        #expect(runs[0].inlinePresentationIntent == [.stronglyEmphasized, .emphasized])
        #expect(runs[1].underlineStyle == Text.LineStyle.single)
        #expect(runs[2].inlinePresentationIntent == nil)
        #expect(runs[2].underlineStyle == nil)
    }

    @Test func blocksFollowTheEditorState() async throws {
        let editorState = await PostQuery.Data.Post.EditorState.from(
            Mock<EditorState>(
                root: Mock<ElementNode>(children: [
                    Mock<HeadingNode>(children: [Mock<TextNode>(text: "Albums")], tag: .case(.h3)),
                    Mock<ElementNode>(
                        children: [Mock<TextNode>(format: 1, text: "Bold"), Mock<LinebreakNode>(), Mock<TextNode>(text: "next")],
                        type: "paragraph"
                    ),
                    Mock<ImageNode>(
                        image: Mock<ImageUpload>(
                            crops: [
                                Mock<ImageUploadCrop>(fileName: "cover-1200.jpg", height: 600, width: 1200),
                                Mock<ImageUploadCrop>(fileName: "cover-640.jpg", height: 320, width: 640),
                            ],
                            destination: "2023/12"
                        )
                    ),
                    Mock<QuoteNode>(children: [Mock<TextNode>(format: 2, text: "Quoted")]),
                    Mock<VideoNode>(video: Mock<Video>(dataId: "fbFeM3QW8Cc", id: "video")),
                ])
            )
        )

        let blocks = PostBlock.blocks(in: editorState)

        #expect(
            Array(blocks.prefix(4)) == [
                .heading(level: 3, text: AttributedString("Albums")),
                .paragraph(AttributedString(lexicalRuns: [.text("Bold", .bold), .lineBreak, .text("next")])),
                .image(
                    url: URL(string: "https://storage.googleapis.com/wonderboymusic/2023/12/cover-640.jpg")!, aspectRatio: 2, altText: ""),
                .quote(AttributedString(lexicalRuns: [.text("Quoted", .italic)])),
            ]
        )
        guard case .video(let video) = try #require(blocks.last), blocks.count == 5 else {
            Issue.record("Expected the video last, in five blocks: \(blocks)")
            return
        }
        #expect(video.dataId == "fbFeM3QW8Cc")
    }

    @Test func emptyTextAndUnsupportedNodesAreSkipped() async {
        let editorState = await PostQuery.Data.Post.EditorState.from(
            Mock<EditorState>(
                root: Mock<ElementNode>(children: [
                    Mock<ElementNode>(children: [Mock<TextNode>(text: "  "), Mock<LinebreakNode>()], type: "paragraph"),
                    Mock<ElementNode>(children: [Mock<TextNode>(text: "Item")], type: "list"),
                    Mock<HeadingNode>(children: [], tag: .case(.h2)),
                    Mock<ImageNode>(image: Mock<ImageUpload>(crops: [])),
                    nil,
                ])
            )
        )

        #expect(PostBlock.blocks(in: editorState).isEmpty)
    }
}
