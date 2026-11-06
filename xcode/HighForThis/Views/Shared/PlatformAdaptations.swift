import SwiftUI

extension View {
    func listRowSeparatorHidden() -> some View {
        #if os(tvOS)
        self
        #else
        listRowSeparator(.hidden)
        #endif
    }

    func selectableText() -> some View {
        #if os(tvOS)
        self
        #else
        textSelection(.enabled)
        #endif
    }

    /// The Siri Remote scrolls only by moving focus, so on tvOS each block of text a reader scrolls through takes focus.
    func focusableForReading() -> some View {
        #if os(tvOS)
        modifier(ReadingFocus())
        #else
        self
        #endif
    }
}

#if os(tvOS)
/// The highlight extends past the text, so focusable blocks stay aligned with their neighbors.
private struct ReadingFocus: ViewModifier {
    @FocusState private var isFocused: Bool

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(.fill.tertiary.opacity(isFocused ? 1 : 0), in: .rect(cornerRadius: 20))
            .padding(.horizontal, -24)
            .padding(.vertical, -12)
            .accessibilityElement(children: .combine)
            .focusable()
            .focused($isFocused)
            .focusEffectDisabled()
            .animation(.smooth(duration: 0.2), value: isFocused)
    }
}
#endif

nonisolated extension CGFloat {
    /// A column width in points. tvOS body text is 29 points to iOS's 17, so its columns are that much wider.
    static func readable(_ points: CGFloat) -> CGFloat {
        #if os(tvOS)
        points * 29 / 17
        #else
        points
        #endif
    }
}

/// tvOS has no web browser, so links to websites are left out there.
struct WebLink<Label: View>: View {
    let destination: URL
    @ViewBuilder let label: Label

    var body: some View {
        #if !os(tvOS)
        Link(destination: destination) { label }
        #endif
    }
}
