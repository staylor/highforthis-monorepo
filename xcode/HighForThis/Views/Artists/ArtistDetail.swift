import HighForThisAPI
import SwiftUI

struct ArtistDetail: View {
    let slug: String
    let name: String

    var body: some View {
        QueryView(ArtistQuery(slug: slug)) { data in
            if let artist = data.artist {
                let upcoming = data.shows?.edges.map(\.node.fragments.showList_show) ?? []
                let attended = data.attended?.edges.map(\.node.fragments.showList_show) ?? []
                List {
                    if let artwork = artist.appleMusic?.artwork.flatMap({ Artwork(template: $0.url, width: $0.width, height: $0.height) }) {
                        ArtworkHeader(artwork: artwork)
                    }
                    if let website = artist.website.flatMap(URL.webURL) {
                        WebLink(destination: website) {
                            Label(.artistWebsite, systemImage: "safari")
                        }
                    }
                    if let appleMusic = artist.appleMusic?.url.flatMap(URL.webURL) {
                        WebLink(destination: appleMusic) {
                            Label(.listenOnAppleMusic, systemImage: "music.note")
                        }
                    }
                    Section(.recommendedShows) {
                        if upcoming.isEmpty {
                            Text(.noRecommendedShows)
                                .foregroundStyle(.secondary)
                        }
                        ForEach(upcoming, id: \.id) { show in
                            DatedShowLink(show: show, title: show.venue.name)
                        }
                        if data.shows?.pageInfo.hasNextPage == true {
                            NavigationLink(.viewAllShows, value: Route.shows(ShowFilter(kind: .upcoming, artist: slug)))
                        }
                    }
                    if !attended.isEmpty {
                        Section(.artistWeWereThere(data.attended?.count ?? attended.count)) {
                            ForEach(attended, id: \.id) { show in
                                DatedShowLink(show: show, title: show.venue.name)
                            }
                            if data.attended?.pageInfo.hasNextPage == true {
                                NavigationLink(.viewAllShows, value: Route.shows(ShowFilter(kind: .history, artist: slug)))
                            }
                        }
                    }
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
