import HighForThisAPI
import SwiftUI

struct ShowDetail: View {
    let id: String
    let title: String

    var body: some View {
        QueryView(ShowQuery(id: id)) { data in
            if let show = data.show {
                List {
                    DetailIntro(hero: show.artwork.map(DetailHero.artwork)) {
                        DetailHeader(eyebrow: Text(show.startDate, format: .showTime(show.startDate)), title: show.headline) {
                            if let website = show.url.flatMap(URL.webURL) {
                                DetailLinks {
                                    WebsiteButton(title: .eventWebsite, destination: website)
                                        .accessibilityIdentifier("event-website")
                                }
                            }
                        }
                    }
                    ForEach(show.artists, id: \.id) { artist in
                        RouteLink(.artist(slug: artist.slug, name: artist.name)) {
                            Label(artist.name, systemImage: "music.mic")
                        }
                        .accessibilityIdentifier("artist-\(artist.slug)")
                    }
                    RouteLink(.venue(slug: show.venue.slug, name: show.venue.name)) {
                        Label(show.venue.name, systemImage: "mappin.and.ellipse")
                    }
                    .accessibilityIdentifier("venue-\(show.venue.slug)")
                }
                .listStyle(.plain)
                .rowLabelSpacing()
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
