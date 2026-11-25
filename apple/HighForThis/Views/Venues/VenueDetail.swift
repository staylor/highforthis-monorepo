import CoreLocation
import HighForThisAPI
import SwiftUI

struct VenueDetail: View {
    let slug: String
    let name: String

    var body: some View {
        QueryView(VenueQuery(slug: slug)) { data in
            if let venue = data.venue {
                let website = venue.website.flatMap(URL.webURL)
                let attended = data.attended?.edges.map(\.node.fragments.showList_show) ?? []
                List {
                    DetailIntro(hero: venue.coordinate.map { .map(name: venue.name, coordinate: $0) }) {
                        DetailHeader(eyebrow: Text(.venue), title: venue.name) {
                            VStack(alignment: .leading, spacing: 4) {
                                if let address = venue.address, !address.isEmpty {
                                    Text(address)
                                        .selectableText()
                                }
                                if let capacity = venue.capacity, !capacity.isEmpty {
                                    Text(.capacity(capacity))
                                }
                            }
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            if let website {
                                DetailLinks {
                                    WebsiteButton(title: .venueWebsite, destination: website)
                                }
                            }
                        }
                    }
                    DatedShowsSection(
                        title: .recommendedShows,
                        shows: data.shows?.edges.map(\.node.fragments.showList_show) ?? [],
                        all: data.shows?.pageInfo.hasNextPage == true ? ShowFilter(kind: .upcoming, venue: slug) : nil
                    ) { $0.headline }
                    DatedShowsSection(
                        title: .attended,
                        count: data.attended?.count ?? attended.count,
                        shows: attended,
                        all: data.attended?.pageInfo.hasNextPage == true ? ShowFilter(kind: .history, venue: slug) : nil
                    ) { $0.headline }
                }
                .listStyle(.plain)
            } else {
                NotFoundView()
            }
        }
        .detailTitle(name)
    }
}

extension VenueQuery.Data.Venue {
    /// Where the venue is on a map, when the API has a place for it that there is.
    fileprivate var coordinate: CLLocationCoordinate2D? {
        guard let latitude = coordinates?.latitude, let longitude = coordinates?.longitude else { return nil }
        let coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        return CLLocationCoordinate2DIsValid(coordinate) ? coordinate : nil
    }
}

#Preview {
    NavigationStack {
        VenueDetail(slug: "music-hall-of-williamsburg", name: "Music Hall of Williamsburg")
    }
}
