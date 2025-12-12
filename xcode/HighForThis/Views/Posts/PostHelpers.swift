import SwiftUI

enum TextFormat: Int {
    case bold = 1
    case italic = 2
    case strikethrough = 4
    case underline = 8
    case code = 16
    case `subscript` = 32
    case superscript = 64
    case highlight = 128
}

func formatText(view: Text, format: Int) -> Text {
    var result = view

    if format & TextFormat.bold.rawValue != 0 {
        result = result.bold()
    }
    if format & TextFormat.italic.rawValue != 0 {
        result = result.italic()
    }
    if format & TextFormat.underline.rawValue != 0 {
        result = result.underline()
    }
    if format & TextFormat.strikethrough.rawValue != 0 {
        result = result.strikethrough()
    }
    if format & TextFormat.code.rawValue != 0 {
        result = result.monospaced()
    }

    return result
}
