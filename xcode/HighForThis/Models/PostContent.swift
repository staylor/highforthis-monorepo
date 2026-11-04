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
    case image(url: URL, aspectRatio: Double)
    case video(Video_video)

    static func blocks(in editorState: PostQuery.Data.Post.EditorState?) -> [PostBlock] {
        (editorState?.root?.children ?? []).compactMap { child in
            child.flatMap(block)
        }
    }

    private static func block(_ node: PostQuery.Data.Post.EditorState.Root.Child) -> PostBlock? {
        if let heading = node.asHeadingNode {
            return text(heading.children).map { .heading(level: heading.tag?.value?.level ?? 3, text: $0) }
        }
        if let quote = node.asQuoteNode {
            return text(quote.children).map(PostBlock.quote)
        }
        if let element = node.asElementNode, element.type == "paragraph" {
            return text(element.children).map(PostBlock.paragraph)
        }
        if let image = node.asImageNode?.image, let crop = image.crops.first(where: { $0.width == 640 }) ?? image.crops.first,
            crop.width > 0, crop.height > 0
        {
            let url = AppConfiguration.uploadURL(destination: image.destination, fileName: crop.fileName)
            return .image(url: url, aspectRatio: Double(crop.width) / Double(crop.height))
        }
        if let video = node.asVideoNode?.video {
            return .video(video.fragments.video_video)
        }
        return nil
    }

    private static func text(_ children: [(some LexicalTextNode)?]?) -> AttributedString? {
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

/// The text and line breaks inside headings, paragraphs and quotes, which the generated code gives distinct types.
nonisolated protocol LexicalTextNode {
    var run: LexicalRun? { get }
}

nonisolated extension PostQuery.Data.Post.EditorState.Root.Child.AsHeadingNode.Child: LexicalTextNode {
    var run: LexicalRun? {
        if asLinebreakNode != nil { return .lineBreak }
        return asTextNode.map { .text($0.text ?? "", LexicalFormat(rawValue: $0.format ?? 0)) }
    }
}

nonisolated extension PostQuery.Data.Post.EditorState.Root.Child.AsElementNode.Child: LexicalTextNode {
    var run: LexicalRun? {
        if asLinebreakNode != nil { return .lineBreak }
        return asTextNode.map { .text($0.text ?? "", LexicalFormat(rawValue: $0.format ?? 0)) }
    }
}

nonisolated extension PostQuery.Data.Post.EditorState.Root.Child.AsQuoteNode.Child: LexicalTextNode {
    var run: LexicalRun? {
        if asLinebreakNode != nil { return .lineBreak }
        return asTextNode.map { .text($0.text ?? "", LexicalFormat(rawValue: $0.format ?? 0)) }
    }
}
