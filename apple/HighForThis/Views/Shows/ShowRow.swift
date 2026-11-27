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
    /// Whether the row says where the show is, which a venue's page already does.
    var showsVenue = true
    @ScaledMetric(relativeTo: .body) private var scaledImageSize: CGFloat = .readable(44)
    @Environment(\.displayScale) private var displayScale
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    /// The picture grows with the text, but not so much that it crowds the list.
    private var imageSize: CGFloat { min(scaledImageSize, .readable(72)) }

    var body: some View {
        if dynamicTypeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: 8) {
                picture
                RowLabel(eyebrow: Text(show.startDate, format: .showDay), title: show.headline, detail: venue)
            }
        } else {
            HStack(spacing: .readable(12)) {
                DateBadge(date: show.startDate)
                picture
                RowLabel(title: show.headline, detail: venue)
            }
        }
    }

    private var venue: String? { showsVenue ? show.venue.name : nil }

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

/// A few of an artist's or a venue's shows, set as the show lists set theirs: headed by month, each with its day and its
/// main artist's picture. A heading over them says which shows they are, and a link after them opens the rest of them.
/// Without any, there's no heading either, as on the website.
struct DatedShowsSection: View {
    let title: LocalizedStringResource
    /// How many there are in all, for a heading that says so.
    var count: Int?
    let shows: DatedShowsSection_shows?
    /// The list of all of them, which the section links to when it has only some.
    let all: ShowFilter
    /// The artist's or the venue's name, which that list opens with.
    let name: String
    /// Whether the rows say where each show is, which a venue's page already does.
    var showsVenue = true

    var body: some View {
        let rows = shows?.edges.map(\.node.fragments.showList_show) ?? []
        if !rows.isEmpty {
            SectionHeading(title, note: count.map { Text(.showCount($0)) })
                .padding(.top, 16)
                // Close to the shows it's over, which the month's header already leaves room above
                .listRowInsets(.bottom, 0)
                .listRowSeparatorHidden()
            ForEach(ShowMonth.months(from: rows)) { month in
                Section {
                    ForEach(month.shows, id: \.id) { show in
                        RouteLink(.show(id: show.id, title: show.headline)) {
                            ShowListRow(show: show, showsVenue: showsVenue)
                        }
                        .accessibilityIdentifier("show-\(show.id)")
                    }
                } header: {
                    Text(month.date, format: .showMonth)
                }
            }
            if shows?.pageInfo.hasNextPage == true {
                RouteLink(.viewAllShows, route: .shows(all, name: name))
                    .accessibilityIdentifier(all.kind == .upcoming ? "view-all-upcoming" : "view-all-history")
            }
        }
    }
}
