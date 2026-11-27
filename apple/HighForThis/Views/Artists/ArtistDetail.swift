import HighForThisAPI
import SwiftUI

struct ArtistDetail: View {
    let slug: String
    let name: String

    var body: some View {
        QueryView(ArtistQuery(slug: slug)) { data in
            if let artist = data.artist {
                let artwork = artist.appleMusic?.artwork.flatMap { Artwork(template: $0.url, width: $0.width, height: $0.height) }
                let website = artist.website.flatMap(URL.webURL)
                let appleMusic = artist.appleMusic?.url.flatMap(URL.webURL)
                List {
                    DetailIntro(hero: artwork.map(DetailHero.artwork)) {
                        DetailHeader(eyebrow: Text(.artist), title: artist.name) {
                            if website != nil || appleMusic != nil {
                                DetailLinks {
                                    if let website {
                                        WebsiteButton(title: .artistWebsite, destination: website)
                                    }
                                    if let appleMusic {
                                        WebsiteButton(title: .listenOnAppleMusic, destination: appleMusic)
                                    }
                                }
                            }
                        }
                    }
                    DatedShowsSection(
                        title: .recommendedShows,
                        shows: data.shows?.fragments.datedShowsSection_shows,
                        all: ShowFilter(kind: .upcoming, artist: slug),
                        name: artist.name
                    )
                    DatedShowsSection(
                        title: .attended,
                        count: data.attended?.count,
                        shows: data.attended?.fragments.datedShowsSection_shows,
                        all: ShowFilter(kind: .history, artist: slug),
                        name: artist.name
                    )
                }
                .listStyle(.plain)
            } else {
                NotFoundView()
            }
        }
        .detailTitle(name)
    }
}

#Preview("With shows") {
    NavigationStack {
        ArtistDetail(slug: "julia-jacklin", name: "Julia Jacklin")
    }
}

#Preview("No artwork") {
    NavigationStack {
        ArtistDetail(slug: "mac-demarco", name: "Mac DeMarco")
    }
}
