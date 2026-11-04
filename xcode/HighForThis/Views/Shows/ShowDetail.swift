import HighForThisAPI
import SwiftUI

struct ShowDetail: View {
    let id: String
    let title: String

    var body: some View {
        QueryView(ShowQuery(id: id)) { data in
            if let show = data.show {
                List {
                    if let artwork = show.artwork {
                        ArtworkHeader(artwork: artwork)
                    }
                    Label {
                        Text(show.startDate, format: .dateTime.weekday(.wide).month(.wide).day().year().hour().minute())
                    } icon: {
                        Image(systemName: "calendar")
                    }
                    ForEach(show.artists, id: \.id) { artist in
                        NavigationLink(value: Route.artist(slug: artist.slug, name: artist.name)) {
                            Label(artist.name, systemImage: "music.mic")
                        }
                        .accessibilityIdentifier("artist-\(artist.slug)")
                    }
                    NavigationLink(value: Route.venue(slug: show.venue.slug, name: show.venue.name)) {
                        Label(show.venue.name, systemImage: "mappin.and.ellipse")
                    }
                    .accessibilityIdentifier("venue-\(show.venue.slug)")
                }
                .listStyle(.plain)
            } else {
                NotFoundView()
            }
        }
        .detailTitle(title)
    }
}

extension ShowQuery.Data.Show {
    /// The first artist's artwork that Apple Music has.
    fileprivate var artwork: Artwork? {
        artists.lazy
            .compactMap(\.appleMusic?.artwork)
            .compactMap { Artwork(template: $0.url, width: $0.width, height: $0.height) }
            .first
    }
}

#Preview {
    NavigationStack {
        ShowDetail(id: "cmrim0x9jlu5l0mnsp5kou3nb", title: "Jeff Tweedy")
    }
}
