import HighForThisAPI
import SwiftUI

/// A show's day in the lists that head their shows by month, as the website's home page has it: the day of the month
/// in the accent color, over the day of the week.
struct DateBadge: View {
    let date: Date
    @ScaledMetric(relativeTo: .title3) private var width: CGFloat = .readable(34)

    var body: some View {
        VStack(spacing: 0) {
            Text(date, format: .showDayNumber)
                .font(.title3.weight(.bold))
                .monospacedDigit()
                .foregroundStyle(.tint)
            Text(date, format: .showWeekday)
                .font(.caption2.weight(.semibold))
                .textCase(.uppercase)
                .foregroundStyle(.secondary)
        }
        // As wide as the widest day, so the pictures and names beside the badges line up.
        .frame(minWidth: width)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(date, format: .showSpokenDay))
    }
}

/// A show in a list of shows: its day, its main artist's picture, then its headline and venue. At accessibility text
/// sizes the picture goes above the text, which then has the row's width, and the day is spelled out over the headline.
struct ShowListRow: View {
    let show: ShowList_show
    @ScaledMetric(relativeTo: .body) private var scaledImageSize: CGFloat = .readable(44)
    @Environment(\.displayScale) private var displayScale
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    /// The picture grows with the text, but not so much that it crowds the list.
    private var imageSize: CGFloat { min(scaledImageSize, .readable(72)) }

    var body: some View {
        if dynamicTypeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: 8) {
                picture
                RowLabel(eyebrow: Text(show.startDate, format: .showDay), title: show.headline, detail: show.venue.name)
            }
        } else {
            HStack(spacing: .readable(12)) {
                DateBadge(date: show.startDate)
                picture
                RowLabel(title: show.headline, detail: show.venue.name)
            }
        }
    }

    private var picture: some View {
        RemoteImage(
            url: show.headlinerArtwork(maximumWidth: Int((imageSize * displayScale).rounded(.up)))?.url,
            contentMode: .fill,
            placeholder: "music.mic"
        )
        .frame(width: imageSize, height: imageSize)
        .clipShape(.circle)
        .accessibilityHidden(true)
    }
}

/// A few of an artist's or a venue's shows under a heading, with a link to the rest of them. Without any, there's no
/// heading either, as on the website. The page already says who or where, so each row leads with the date.
struct DatedShowsSection: View {
    let title: LocalizedStringResource
    /// How many there are in all, for a heading that says so.
    var count: Int?
    let shows: DatedShowsSection_shows?
    /// The list of all of them, which the section links to when it has only some.
    let all: ShowFilter
    /// What a row calls its show: where it is on an artist's page, and who's playing on a venue's.
    let name: (ShowList_show) -> String

    var body: some View {
        let rows = shows?.edges.map(\.node.fragments.showList_show) ?? []
        if !rows.isEmpty {
            Section {
                ForEach(rows, id: \.id) { show in
                    RouteLink(.show(id: show.id, title: show.headline)) {
                        RowLabel(eyebrow: Text(show.startDate, format: .showDate), title: name(show))
                    }
                    .accessibilityIdentifier("show-\(show.id)")
                }
                if shows?.pageInfo.hasNextPage == true {
                    RouteLink(.viewAllShows, route: .shows(all))
                }
            } header: {
                HStack(alignment: .firstTextBaseline) {
                    Text(title)
                    Spacer()
                    if let count {
                        Text(.showCount(count))
                    }
                }
            }
        }
    }
}
