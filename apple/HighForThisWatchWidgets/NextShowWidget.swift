import Apollo
import HighForThisAPI
import SwiftUI
import WidgetKit
import os

nonisolated extension NextShowQuery.Data.Shows.Edge.Node: ShowSummary {
    var artistNames: [String] { artists.map(\.name) }
}

private struct FeaturedShow {
    let id: String?
    let title: String
    let venue: String
    let day: VenueDay
}

extension FeaturedShow {
    init(_ show: NextShowMemory.Show) {
        self.init(id: show.id, title: show.title, venue: show.venue, day: VenueDay(show.localDate))
    }
}

private struct NextShowEntry: TimelineEntry {
    let date: Date
    let show: FeaturedShow?
    /// Whether the fetch failed, and how many have in a row
    var unavailable = false
    var failures = 0

    var link: WatchShowLink { WatchShowLink(id: show?.id, title: show?.title) }
}

private struct NextShowProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextShowEntry {
        let now = Date()
        let day = VenueDay(now.formatted(.iso8601.year().month().day().dateSeparator(.dash)))
        let sample = FeaturedShow(id: nil, title: String(localized: .nextShow), venue: String(localized: .venue), day: day)
        return NextShowEntry(date: now, show: sample)
    }

    func getSnapshot(in context: Context, completion: @escaping @Sendable (NextShowEntry) -> Void) {
        if context.isPreview {
            completion(placeholder(in: context))
        } else {
            Task { completion(await entry()) }
        }
    }

    func getTimeline(in context: Context, completion: @escaping @Sendable (Timeline<NextShowEntry>) -> Void) {
        Task {
            let current = await entry()
            // The API's upcoming list changes at midnight in New York. Also check during the day for schedule edits.
            var calendar = Calendar(identifier: .gregorian)
            calendar.timeZone = .newYork
            let midnight = calendar.startOfDay(for: current.date)
            let tomorrow = calendar.date(byAdding: .day, value: 1, to: midnight)!
            let wait = current.unavailable ? NextShowMemory.retryDelay(afterFailures: current.failures) : 3 * 60 * 60
            let refresh = min(tomorrow, current.date.addingTimeInterval(wait))
            completion(Timeline(entries: [current], policy: .after(refresh)))
        }
    }

    private func entry() async -> NextShowEntry {
        var memory = NextShowMemory.load(from: .standard)
        do {
            let data = try await ApolloClient.highForThis.data(for: NextShowQuery(), cachePolicy: .networkOnly)
            guard let shows = data.shows else { throw MissingDataError() }
            let show = shows.edges.first.map { edge in
                let node = edge.node
                return NextShowMemory.Show(id: node.id, title: node.headline, venue: node.venue.name, localDate: node.schedule.localDate)
            }
            memory.found(show)
            memory.save(to: .standard)
            return NextShowEntry(date: .now, show: show.map { FeaturedShow($0) })
        } catch {
            Logger.api.error("Couldn't load next show: \(error.localizedDescription)")
            // The show the last fetch found, rather than none, until its day has passed
            memory.failed()
            memory.save(to: .standard)
            let show = memory.fallback(at: .now)
            return NextShowEntry(date: .now, show: show.map { FeaturedShow($0) }, unavailable: true, failures: memory.failures)
        }
    }
}

private struct NextShowFace: View {
    let entry: NextShowEntry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        Group {
            if let show = entry.show {
                let day = show.day
                switch family {
                case .accessoryCircular:
                    VStack(spacing: 0) {
                        Text(day.formatted(.dateTime.month(.abbreviated))).font(.caption)
                        Text(day.formatted(.showDayNumber)).font(.title2.bold())
                    }
                    .accessibilityLabel(Text(.dateAndVenue(day.formatted(.showSpokenDay), show.title)))
                case .accessoryInline:
                    Text(.dateAndVenue(day.formatted(.dateTime.month(.abbreviated).day()), show.title))
                default:
                    VStack(alignment: .leading) {
                        Label(day.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day()), systemImage: "calendar")
                            .font(.caption).widgetAccentable()
                        Text(show.title).font(.headline)
                        Text(show.venue).font(.caption)
                    }
                    .lineLimit(1)
                }
            } else if family == .accessoryCircular {
                Image(systemName: "calendar").accessibilityLabel(.openShows)
            } else {
                Label(entry.unavailable ? .openShows : .noRecommendedShows, systemImage: "calendar")
            }
        }
        .containerBackground(for: .widget) { Color.clear }
        .widgetURL(entry.link.url)
    }
}

@main
struct NextShowWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NextShow", provider: NextShowProvider()) { entry in NextShowFace(entry: entry) }
            .configurationDisplayName(Text(.nextShow))
            .description(Text(.nextShowDescription))
            .supportedFamilies([.accessoryInline, .accessoryCircular, .accessoryRectangular])
    }
}
