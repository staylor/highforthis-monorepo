import CoreLocation
import HighForThisAPI
import SwiftUI

struct VenueDetail: View {
    let slug: String
    let name: String

    var body: some View {
        QueryView(VenueQuery(slug: slug)) { data in
            if let venue = data.venue {
                let upcoming = data.shows?.edges.map(\.node.fragments.showList_show) ?? []
                let attended = data.attended?.edges.map(\.node.fragments.showList_show) ?? []
                List {
                    if let latitude = venue.coordinates?.latitude, let longitude = venue.coordinates?.longitude,
                        CLLocationCoordinate2DIsValid(CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
                    {
                        VenueMap(name: venue.name, coordinate: CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
                            .listRowInsets(EdgeInsets())
                            .listRowSeparatorHidden()
                    }
                    if let address = venue.address, !address.isEmpty {
                        Label(address, systemImage: "mappin.and.ellipse")
                    }
                    if let capacity = venue.capacity, !capacity.isEmpty {
                        Label {
                            Text(.capacity(capacity))
                        } icon: {
                            Image(systemName: Self.capacitySymbol)
                        }
                    }
                    if let website = venue.website.flatMap(URL.webURL) {
                        WebLink(destination: website) {
                            Label(.venueWebsite, systemImage: "safari")
                        }
                    }
                    if !upcoming.isEmpty {
                        Section(.recommendedShows) {
                            ForEach(upcoming, id: \.id) { show in
                                DatedShowLink(show: show, title: show.headline)
                            }
                            if data.shows?.pageInfo.hasNextPage == true {
                                NavigationLink(.viewAllShows, value: Route.shows(ShowFilter(kind: .upcoming, venue: slug)))
                            }
                        }
                    }
                    if !attended.isEmpty {
                        Section(.venueWeWereThere(data.attended?.count ?? attended.count)) {
                            ForEach(attended, id: \.id) { show in
                                DatedShowLink(show: show, title: show.headline)
                            }
                            if data.attended?.pageInfo.hasNextPage == true {
                                NavigationLink(.viewAllShows, value: Route.shows(ShowFilter(kind: .history, venue: slug)))
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

    #if os(tvOS)
    // person.3 is wider than the column tvOS lists give a label's icon.
    private static let capacitySymbol = "person.2"
    #else
    private static let capacitySymbol = "person.3"
    #endif
}

#Preview {
    NavigationStack {
        VenueDetail(slug: "music-hall-of-williamsburg", name: "Music Hall of Williamsburg")
    }
}
