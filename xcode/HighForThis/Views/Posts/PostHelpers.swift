import SwiftUI

enum FORMATS: Int {
    case BOLD = 1
    case ITALIC = 2
    case STRIKETHROUGH = 4
    case UNDERLINE = 8
    case CODE = 16
    case SUBSCRIPT = 32
    case SUPERSCRIPT = 64
    case HIGHLIGHT = 128
}

func formatText(view: Text, format: Int) -> Text {
    switch format {
    case FORMATS.BOLD.rawValue:
        return view.bold()
    case FORMATS.ITALIC.rawValue:
        return view.italic()
    case FORMATS.UNDERLINE.rawValue:
        return view.underline()
    case FORMATS.BOLD.rawValue | FORMATS.ITALIC.rawValue:
        return view.bold().italic()
    case FORMATS.BOLD.rawValue | FORMATS.ITALIC.rawValue | FORMATS.UNDERLINE.rawValue:
        return view.bold().italic().underline()
    default:
        return view
    }
}
