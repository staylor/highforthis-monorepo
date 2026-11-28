import SwiftUI

extension View {
    func listRowSeparatorHidden() -> some View {
        #if os(tvOS) || os(watchOS)
        self
        #else
        listRowSeparator(.hidden)
        #endif
    }

    func selectableText() -> some View {
        #if os(tvOS) || os(watchOS)
        self
        #else
        textSelection(.enabled)
        #endif
    }

    /// A plain list on tvOS sets its rows close together, and draws the focused one as a platter the width of the
    /// list, so there each row has more room above and below it.
    func spacedListRow() -> some View {
        #if os(tvOS)
        listRowInsets(.vertical, 24)
        #else
        self
        #endif
    }

    /// On tvOS a section's first row, when focused, has a platter that would touch the section's header, so there the
    /// header has room under it.
    func spacedSectionHeader() -> some View {
        #if os(tvOS)
        padding(.bottom, 12)
        #else
        self
        #endif
    }

    /// tvOS sets a row's icon right against its title, so there the rows' labels put some room between them.
    func rowLabelSpacing() -> some View {
        #if os(tvOS)
        labelStyle(SpacedLabelStyle())
        #else
        self
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
private struct SpacedLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 20) {
            configuration.icon
                .foregroundStyle(.tint)
            configuration.title
        }
    }
}

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
        #if !os(tvOS) && !os(watchOS)
        Link(destination: destination) { label }
        #endif
    }
}
