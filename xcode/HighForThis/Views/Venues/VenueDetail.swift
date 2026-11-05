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
                            .listRowSeparator(.hidden)
                    }
                    if let address = venue.address, !address.isEmpty {
                        Label(address, systemImage: "mappin.and.ellipse")
                    }
                    if let capacity = venue.capacity, !capacity.isEmpty {
                        Label {
                            Text(.capacity(capacity))
                        } icon: {
                            Image(systemName: "person.3")
                        }
                    }
                    if let website = venue.website.flatMap(URL.webURL) {
                        Link(destination: website) {
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
}

#Preview {
    NavigationStack {
        VenueDetail(slug: "music-hall-of-williamsburg", name: "Music Hall of Williamsburg")
    }
}
