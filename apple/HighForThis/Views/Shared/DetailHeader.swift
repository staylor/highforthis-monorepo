import CoreLocation
import SwiftUI

extension Text {
    /// A line over a title that says what or when it is, as the website's pages have over theirs: small capitals in
    /// the accent color.
    func eyebrowStyle() -> some View {
        font(.caption.weight(.bold))
            .tracking(1)
            .textCase(.uppercase)
            .foregroundStyle(.tint)
    }
}

/// What a detail screen opens with, as each of the website's pages does: a line saying what or when it is, its title,
/// and what goes with them, such as an address or links.
struct DetailHeader<Details: View>: View {
    @Environment(DetailHeaderVisibility.self) private var visibility: DetailHeaderVisibility?
    private let eyebrow: Text?
    private let title: String
    private let details: Details

    init(eyebrow: Text? = nil, title: String, @ViewBuilder details: () -> Details) {
        self.eyebrow = eyebrow
        self.title = title
        self.details = details()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                eyebrow?.eyebrowStyle()
                Text(title)
                    .font(.title.weight(.black))
                    .textCase(.uppercase)
                    .fixedSize(horizontal: false, vertical: true)
                    // In capitals on the screen, but not to VoiceOver. A label that's text would be in capitals too.
                    .accessibilityLabel(title)
                    .accessibilityAddTraits(.isHeader)
            }
            details
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            // The bar has the title while the header isn't on screen. The bar is glass, which shows what's under it,
            // so the header counts as on screen until it's this far past the bar's edge, where its title is clear of
            // the bar's.
            Color.clear
                .padding(.bottom, -48)
                .onScrollVisibilityChange(threshold: 0.01) { visibility?.isVisible = $0 }
                .onDisappear { visibility?.isVisible = false }
        }
    }
}

extension DetailHeader where Details == EmptyView {
    init(eyebrow: Text? = nil, title: String) {
        self.init(eyebrow: eyebrow, title: title) { EmptyView() }
    }
}

/// The heading over a section of a screen, as the website heads one: its name in heavy capitals, with a note under it,
/// such as how many there are.
struct SectionHeading: View {
    private let title: LocalizedStringResource
    private let note: Text?

    init(_ title: LocalizedStringResource, note: Text? = nil) {
        self.title = title
        self.note = note
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.title3.weight(.black))
                .textCase(.uppercase)
                .accessibilityLabel(String(localized: title))
                .accessibilityAddTraits(.isHeader)
            note?
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// The picture or map a detail screen opens with.
enum DetailHero {
    case artwork(Artwork)
    case map(name: String, coordinate: CLLocationCoordinate2D)
}

/// The top of a detail screen's list: its picture or map, and its header. Where there's room they're side by side,
/// as the website lays them out. On a phone, and at the largest text sizes, the picture comes first, from edge to edge.
struct DetailIntro<Header: View>: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    private let hero: DetailHero?
    private let header: Header

    init(hero: DetailHero?, @ViewBuilder header: () -> Header) {
        self.hero = hero
        self.header = header()
    }

    var body: some View {
        if let hero, horizontalSizeClass == .regular, !dynamicTypeSize.isAccessibilitySize {
            HStack(alignment: .center, spacing: .readable(28)) {
                view(of: hero, isSquare: true)
                    .frame(width: .readable(260), height: .readable(260))
                    .clipShape(.rect(cornerRadius: 12))
                header
            }
            .padding(.vertical, 8)
            .listRowSeparatorHidden()
        } else {
            if let hero {
                view(of: hero, isSquare: false)
                    .listRowInsets(EdgeInsets())
                    .listRowSeparatorHidden()
            }
            header
                .padding(.vertical, 4)
                .listRowSeparatorHidden()
        }
    }

    /// The hero filling a square it's given, or across the screen's width at a height that leaves room under it.
    @ViewBuilder private func view(of hero: DetailHero, isSquare: Bool) -> some View {
        switch hero {
        case .artwork(let artwork):
            if isSquare {
                RemoteImage(url: artwork.url, contentMode: .fill)
                    .accessibilityHidden(true)
            } else {
                RemoteImage(url: artwork.url, aspectRatio: artwork.aspectRatio)
                    .frame(maxWidth: .infinity, maxHeight: 440)
                    .accessibilityHidden(true)
            }
        case .map(let name, let coordinate):
            VenueMap(name: name, coordinate: coordinate, height: isSquare ? nil : 240)
        }
    }
}

/// A detail header's links to websites: in a row, or one under another when a row doesn't fit them. tvOS has no web
/// browser, so it has none.
struct DetailLinks<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        #if !os(tvOS)
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 10) { content }
            VStack(alignment: .leading, spacing: 10) { content }
        }
        #endif
    }
}

/// A link to a website, drawn as a button with an arrow that says it leaves the app.
struct WebsiteButton: View {
    let title: LocalizedStringResource
    let destination: URL

    var body: some View {
        WebLink(destination: destination) {
            HStack(spacing: 6) {
                Text(title)
                Image(systemName: "arrow.up.right")
                    .imageScale(.small)
                    .fontWeight(.semibold)
                    .accessibilityHidden(true)
            }
            // A Mac's bordered button is gray whatever its tint, so its words take the accent color themselves.
            .foregroundStyle(.tint)
        }
        .font(.subheadline.weight(.semibold))
        .buttonStyle(.bordered)
        .buttonBorderShape(.capsule)
        .tint(.accentColor)
    }
}
