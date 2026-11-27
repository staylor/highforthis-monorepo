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

/// A show in a list of shows: its day, its main artist's picture, then its headline and venue, leaving out what all of
/// the list's shows have in common (`rowWords(in:)`). At accessibility text sizes the picture goes above the text, which
/// then has the row's width, and the day is spelled out over it.
struct ShowListRow: View {
    let show: ShowList_show
    /// The shows the list has, such as an artist's, whose rows needn't name the artist.
    let filter: ShowFilter
    @ScaledMetric(relativeTo: .body) private var scaledImageSize: CGFloat = .readable(44)
    @Environment(\.displayScale) private var displayScale
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    /// The picture grows with the text, but not so much that it crowds the list.
    private var imageSize: CGFloat { min(scaledImageSize, .readable(72)) }

    var body: some View {
        let words = show.rowWords(in: filter)
        if dynamicTypeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: 8) {
                if words.hasPicture {
                    picture
                }
                RowLabel(eyebrow: Text(show.startDate, format: .showDay), title: words.title, detail: words.detail)
            }
        } else {
            HStack(spacing: .readable(12)) {
                DateBadge(date: show.startDate)
                if words.hasPicture {
                    picture
                }
                RowLabel(title: words.title, detail: words.detail)
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

/// An artist's or a venue's shows, set as the show lists set theirs: headed by month, each with its day. A heading over
/// them says which shows they are, and when there are more than the page asked for, a link after them opens the rest.
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
                            ShowListRow(show: show, filter: all)
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
