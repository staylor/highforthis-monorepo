import HighForThisAPI
import SwiftUI

/// Who and where we've seen most, as the website's stats pages have it: how many shows, artists and venues there have
/// been, the artists or venues seen most, ranked, with a bar for how many shows each had, and everyone else under how
/// many shows they had, billed like a festival poster. The query asks for the artists' stats and the venues' at once,
/// so choosing between them doesn't wait for another request.
struct ShowStats: View {
    @State private var subject = StatsSubject.artists

    var body: some View {
        QueryView(ShowStatsQuery(leaders: Int32(StatsBoard.leaderLimit))) { data in
            let board = StatsBoard(data, subject: subject)
            ScrollView {
                VStack(alignment: .leading, spacing: 36) {
                    DetailHeader(eyebrow: Text(.statsEyebrow), title: String(localized: .showStatsTitle)) {
                        Picker(.statsFor, selection: $subject) {
                            Text(.artists).tag(StatsSubject.artists)
                            Text(.venues).tag(StatsSubject.venues)
                        }
                        .pickerStyle(.segmented)
                        .labelsHidden()
                        .fixedSize()
                        .accessibilityIdentifier("stats-subject")
                    }
                    StatsTotals(totals: data.showTotals)
                    if !board.leaders.isEmpty {
                        StatsLeaderboard(board: board, subject: subject)
                    }
                    if !board.tiers.isEmpty {
                        StatsLineup(tiers: board.tiers, subject: subject)
                    }
                }
                .frame(maxWidth: .readable(760), alignment: .leading)
                .padding()
                .frame(maxWidth: .infinity)
            }
        }
        .detailTitle(String(localized: .showStatsTitle))
    }
}

extension EnvironmentValues {
    /// Whether the stats are a tab of their own, as `ContentView` decides, so History links to them only where they
    /// aren't.
    @Entry var statsHaveATab = true
}

/// How many shows, artists and venues there have been, and since when: four across where they fit, and otherwise two.
private struct StatsTotals: View {
    let totals: ShowStatsQuery.Data.ShowTotals

    private var tiles: [StatsTotal] {
        var tiles = [
            StatsTotal(label: .shows, value: totals.shows.formatted()),
            StatsTotal(label: .artists, value: totals.artists.formatted()),
            StatsTotal(label: .venues, value: totals.venues.formatted()),
        ]
        if let year = totals.firstYear() {
            tiles.append(StatsTotal(label: .since, value: String(year)))
        }
        return tiles
    }

    var body: some View {
        let tiles = tiles
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) {
                ForEach(tiles.indices, id: \.self) { tiles[$0] }
            }
            Grid(horizontalSpacing: 12, verticalSpacing: 12) {
                ForEach(Array(stride(from: 0, to: tiles.count, by: 2)), id: \.self) { start in
                    GridRow {
                        ForEach(start..<min(start + 2, tiles.count), id: \.self) { tiles[$0] }
                    }
                }
            }
            VStack(spacing: 12) {
                ForEach(tiles.indices, id: \.self) { tiles[$0] }
            }
        }
    }
}

private struct StatsTotal: View {
    let label: LocalizedStringResource
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption.weight(.bold))
                .tracking(1)
                .textCase(.uppercase)
                .foregroundStyle(.secondary)
            Text(verbatim: value)
                .font(.largeTitle.weight(.heavy))
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
        }
        .frame(minWidth: .readable(132), maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(.fill.quaternary, in: .rect(cornerRadius: 16))
        .accessibilityElement(children: .combine)
    }
}

/// The artists seen most, or the venues been to most, ranked, each with a bar for its shows next to the most any had.
/// The podium's three have bigger pictures, as the website puts them on a podium.
private struct StatsLeaderboard: View {
    let board: StatsBoard
    let subject: StatsSubject

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionHeading(subject == .artists ? .mostSeen : .mostVisited)
            ForEach(board.leaders) { leader in
                RouteLink(leader.entity.route) {
                    StatsLeaderRow(leader: leader, most: board.most)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("stats-\(leader.entity.slug)")
            }
        }
    }
}

/// A leader's rank, picture, name, years and shows. At accessibility text sizes the rank and picture go above the
/// words, which then have the row's width.
private struct StatsLeaderRow: View {
    let leader: StatsLeader
    let most: Int
    @ScaledMetric(relativeTo: .body) private var scaledPictureSize: CGFloat = .readable(44)
    @ScaledMetric(relativeTo: .title3) private var rankWidth: CGFloat = .readable(30)
    @Environment(\.displayScale) private var displayScale
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    /// The picture grows with the text, but not so much that it crowds the list, and the podium's are bigger.
    private var pictureSize: CGFloat { min(scaledPictureSize, .readable(72)) * (leader.isOnThePodium ? 1.4 : 1) }

    /// As wide as the podium's pictures, so every row's name and bar start in line.
    private var pictureColumnWidth: CGFloat { min(scaledPictureSize, .readable(72)) * 1.4 }

    var body: some View {
        Group {
            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 12) {
                        rank
                        picture
                    }
                    words
                    count
                }
            } else {
                HStack(spacing: .readable(12)) {
                    rank.frame(minWidth: rankWidth, alignment: .trailing)
                    picture.frame(width: pictureColumnWidth)
                    words
                    count
                }
            }
        }
        .padding(.vertical, 6)
        .contentShape(.rect)
    }

    private var rank: some View {
        Text(leader.rank, format: .number)
            .font(.title3.weight(.heavy))
            .monospacedDigit()
            .foregroundStyle(leader.isOnThePodium ? AnyShapeStyle(.tint) : AnyShapeStyle(.secondary))
            .accessibilityLabel(Text(.rank(leader.rank)))
    }

    private var picture: some View {
        StatsPicture(
            entity: leader.entity,
            artwork: leader.artwork(maximumWidth: Int((pictureSize * displayScale).rounded(.up))),
            size: pictureSize
        )
    }

    private var words: some View {
        VStack(alignment: .leading, spacing: 6) {
            RowLabel(title: leader.entity.name, detail: detail)
            StatsBar(fraction: most > 0 ? Double(leader.count) / Double(most) : 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    /// Where a venue is, and the years of the first show and the latest.
    private var detail: String {
        leader.place.map { String(localized: .placeAndYears($0, leader.yearsText)) } ?? leader.yearsText
    }

    private var count: some View {
        Text(leader.count, format: .number)
            .font(.title2.weight(.heavy))
            .monospacedDigit()
            .accessibilityLabel(Text(.showCount(leader.count)))
    }
}

/// How many shows a leader had, as a bar as long as that is next to the most any had.
private struct StatsBar: View {
    let fraction: Double

    var body: some View {
        Capsule()
            .fill(.tint.opacity(0.15))
            .frame(height: 6)
            .overlay(alignment: .leading) {
                GeometryReader { proxy in
                    Capsule()
                        .fill(.tint)
                        .frame(width: max(proxy.size.height, proxy.size.width * min(max(fraction, 0), 1)))
                }
            }
            .accessibilityHidden(true)
    }
}

/// An artist's picture, or its initials when it has none, as a venue always does, as the website shows them.
private struct StatsPicture: View {
    let entity: StatsEntity
    let artwork: Artwork?
    let size: CGFloat

    var body: some View {
        Group {
            if let artwork {
                RemoteImage(url: artwork.url, contentMode: .fill, placeholder: "music.mic")
            } else {
                Circle()
                    .fill(.fill.secondary)
                    .overlay {
                        Text(verbatim: entity.initials)
                            .font(.system(size: size * 0.36, weight: .heavy))
                            .foregroundStyle(.tint)
                            .lineLimit(1)
                            .minimumScaleFactor(0.5)
                            .padding(size * 0.14)
                    }
            }
        }
        .frame(width: size, height: size)
        .clipShape(.circle)
        .accessibilityHidden(true)
    }
}

/// Everyone after the leaders, under how many shows each had, billed like a festival poster: the more shows, the bigger
/// the names.
private struct StatsLineup: View {
    let tiers: [StatsTier]
    let subject: StatsSubject

    var body: some View {
        VStack(spacing: 20) {
            SectionHeading(subject == .artists ? .alsoOnTheBill : .everywhereElse)
            ForEach(tiers) { tier in
                VStack(spacing: 12) {
                    StatsTierName(count: tier.count)
                    FlowLayout(spacing: .readable(10), lineSpacing: 8) {
                        ForEach(Array(tier.entities.enumerated()), id: \.element.id) { index, entity in
                            HStack(spacing: .readable(10)) {
                                if index > 0 {
                                    Text(verbatim: "★")
                                        .foregroundStyle(.tint)
                                        .accessibilityHidden(true)
                                }
                                RouteLink(entity.route) {
                                    Text(entity.name)
                                        .multilineTextAlignment(.center)
                                        // In capitals on the screen, but not to VoiceOver
                                        .accessibilityLabel(entity.name)
                                }
                                .buttonStyle(.plain)
                                .accessibilityIdentifier("stats-\(entity.slug)")
                            }
                        }
                    }
                    .font(tier.font.weight(.heavy))
                    .textCase(.uppercase)
                }
            }
        }
        .padding()
        .background(.fill.quinary, in: .rect(cornerRadius: 24))
    }
}

/// A tier's name between two rules: Once, Twice, or how many times.
private struct StatsTierName: View {
    let count: Int

    var body: some View {
        HStack(spacing: 12) {
            rule
            Text(title)
                .font(.caption.weight(.heavy))
                .tracking(3)
                .textCase(.uppercase)
                .foregroundStyle(.tint)
                .fixedSize()
                .accessibilityAddTraits(.isHeader)
            rule
        }
    }

    private var title: LocalizedStringResource {
        switch count {
        case 1: .once
        case 2: .twice
        default: .timesCount(count)
        }
    }

    private var rule: some View {
        Rectangle()
            .fill(.separator)
            .frame(height: 1)
            .accessibilityHidden(true)
    }
}

extension StatsTier {
    /// The more shows a tier had, the bigger its names, as a poster bills its headliners.
    fileprivate var font: Font {
        switch count {
        case 1: .subheadline
        case 2: .body
        case 3: .title3
        default: .title2
        }
    }
}

extension StatsEntity {
    fileprivate var route: Route {
        switch kind {
        case .artist: .artist(slug: slug, name: name)
        case .venue: .venue(slug: slug, name: name)
        }
    }
}

/// Views in lines, as many to a line as fit, each line centered, as the website's lineup sets its names. A view wider
/// than a line has the line to itself, at the line's width.
private struct FlowLayout: Layout {
    var spacing: CGFloat
    var lineSpacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let lines = lines(fitting: proposal.width, subviews: subviews)
        let height = lines.map(\.height).reduce(0, +) + lineSpacing * CGFloat(max(lines.count - 1, 0))
        return CGSize(width: proposal.width ?? lines.map(\.width).max() ?? 0, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for line in lines(fitting: bounds.width, subviews: subviews) {
            var x = bounds.minX + max(0, bounds.width - line.width) / 2
            for item in line.items {
                subviews[item.index].place(
                    at: CGPoint(x: x, y: y + (line.height - item.size.height) / 2), proposal: ProposedViewSize(item.size))
                x += item.size.width + spacing
            }
            y += line.height + lineSpacing
        }
    }

    private struct Line {
        var items: [(index: Int, size: CGSize)] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func lines(fitting width: CGFloat?, subviews: Subviews) -> [Line] {
        let maximumWidth = width ?? .infinity
        var lines: [Line] = []
        var line = Line()
        for index in subviews.indices {
            var size = subviews[index].sizeThatFits(.unspecified)
            if size.width > maximumWidth {
                size = subviews[index].sizeThatFits(ProposedViewSize(width: maximumWidth, height: nil))
            }
            if !line.items.isEmpty, line.width + spacing + size.width > maximumWidth {
                lines.append(line)
                line = Line()
            }
            line.width += (line.items.isEmpty ? 0 : spacing) + size.width
            line.height = max(line.height, size.height)
            line.items.append((index, size))
        }
        if !line.items.isEmpty {
            lines.append(line)
        }
        return lines
    }
}

#Preview {
    NavigationStack { ShowStats() }
}
