import Foundation
import HighForThisAPI
import SwiftUI

/// Lexical's text format bitmask, from `TEXT_TYPE_TO_FORMAT` in the lexical package.
nonisolated struct LexicalFormat: OptionSet {
    let rawValue: Int

    static let bold = LexicalFormat(rawValue: 1 << 0)
    static let italic = LexicalFormat(rawValue: 1 << 1)
    static let strikethrough = LexicalFormat(rawValue: 1 << 2)
    static let underline = LexicalFormat(rawValue: 1 << 3)
    static let code = LexicalFormat(rawValue: 1 << 4)
}

nonisolated enum LexicalRun: Equatable {
    case text(String, LexicalFormat = [])
    case lineBreak
}

nonisolated extension AttributedString {
    init(lexicalRuns runs: [LexicalRun]) {
        self.init()
        for run in runs {
            switch run {
            case .lineBreak:
                append(AttributedString("\n"))
            case .text(let text, let format):
                var piece = AttributedString(text)
                var intent: InlinePresentationIntent = []
                if format.contains(.bold) { intent.insert(.stronglyEmphasized) }
                if format.contains(.italic) { intent.insert(.emphasized) }
                if format.contains(.strikethrough) { intent.insert(.strikethrough) }
                if format.contains(.code) { intent.insert(.code) }
                if !intent.isEmpty { piece.inlinePresentationIntent = intent }
                if format.contains(.underline) { piece.underlineStyle = .single }
                append(piece)
            }
        }
    }
}

/// A post's content as the app shows it, flattened from the Lexical editor state the CMS saves. Like the website,
/// it skips text blocks with nothing in them and nodes it doesn't show.
nonisolated enum PostBlock: Equatable {
    case heading(level: Int, text: AttributedString)
    case paragraph(AttributedString)
    case quote(AttributedString)
    case code(AttributedString)
    case image(url: URL, aspectRatio: Double, altText: String)
    case video(Video_video)

    private typealias Node = PostQuery.Data.Post.EditorState.Root.Child

    static func blocks(in editorState: PostQuery.Data.Post.EditorState?) -> [PostBlock] {
        (editorState?.root?.children ?? []).compactMap { child in
            child.flatMap(block)
        }
    }

    private static func block(_ node: Node) -> PostBlock? {
        // Images and videos are element nodes too, without text, so they come first.
        if let image = node.asImageNode?.image {
            guard let crop = image.crops.filter({ $0.height > 0 }).best(forWidth: 640) else { return nil }
            let url = AppConfiguration.uploadURL(destination: image.destination, fileName: crop.fileName)
            return .image(url: url, aspectRatio: Double(crop.width) / Double(crop.height), altText: image.altText ?? "")
        }
        if let video = node.asVideoNode?.video {
            return .video(video.fragments.video_video)
        }
        guard let element = node.asElementNodeType, let text = text(element.children) else { return nil }
        if let heading = node.asHeadingNode {
            return .heading(level: heading.tag?.value?.level ?? 3, text: text)
        }
        // Lexical's names for the nodes, from which the API types them.
        return switch element.type {
        case "paragraph": .paragraph(text)
        case "quote": .quote(text)
        case "code": .code(text)
        default: nil
        }
    }

    /// The text and line breaks in a block, or nil when it has no text.
    private static func text(_ children: [Node.AsElementNodeType.Child?]?) -> AttributedString? {
        let runs = (children ?? []).compactMap { $0?.run }
        let hasText = runs.contains { run in
            if case .text(let text, _) = run { !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty } else { false }
        }
        return hasText ? AttributedString(lexicalRuns: runs) : nil
    }
}

nonisolated extension HeadingTag {
    var level: Int {
        switch self {
        case .h1: 1
        case .h2: 2
        case .h3: 3
        case .h4: 4
        case .h5: 5
        case .h6: 6
        }
    }
}

nonisolated extension PostQuery.Data.Post.EditorState.Root.Child.AsElementNodeType.Child {
    /// The text or the line break this is, or nil for another kind of node.
    var run: LexicalRun? {
        if asLinebreakNode != nil { return .lineBreak }
        return asTextNode.map { .text($0.text ?? "", LexicalFormat(rawValue: $0.format ?? 0)) }
    }
}
