import SwiftUI
import HighForThisAPI

struct VenueMain: View {
    var name: String
    var slug: String
    @State private var venue: VenueData.Venue?
    @State private var shows: [VenueData.Shows.Edge.Node]?
    @State private var attended: [VenueData.Attended.Edge.Node]?
    
    var body: some View {
        ZStack {
            if venue == nil {
                Loading()
            } else {
                let venue = venue!
                ScrollView {
                    VStack(alignment: .leading) {
                        if let coordinates = venue.coordinates {
                            MapView(
                                name: name,
                                latitude: coordinates.latitude!,
                                longitude: coordinates.longitude!
                            )
                        }
                        TextBlock {
                            Text(name).font(.title).bold().padding(.bottom, 2)
                            if let address = venue.address {
                                Paragraph(address)
                                    .foregroundColor(.gray)
                                    .padding(.bottom, 2)
                            }
                            if let capacity = venue.capacity {
                                Text(L10N("capacity \(capacity)"))
                                    .foregroundColor(.gray)
                                    .padding(.bottom, 2)
                            }
                            if let website = venue.website {
                                ExternalLink(url: website, label: L10N("venueWebsite"))
                            }
                        }
                        if shows!.count > 0 {
                            VenueRecommendedShows(shows: shows!)
                        }
                        if attended!.count > 0 {
                            VenueAttendedShows(attended: attended!)
                        }
                    }.padding(.bottom, 32)
                }.ignoresSafeArea()
            }
        }
        #if os(iOS)
        .toolbarBackground(.hidden, for: .navigationBar)
        #endif
        .onAppear() {
            getVenue(slug: slug) { data in
                self.venue = data.venue!
                
                var shows = [VenueData.Shows.Edge.Node]()
                for edge in data.shows!.edges {
                    shows.append(edge.node)
                }
                self.shows = shows
                
                var attended = [VenueData.Attended.Edge.Node]()
                for edge in data.attended!.edges {
                    attended.append(edge.node)
                }
                self.attended = attended
            }
        }
    }
}

#Preview("MHOW") {
    AppWrapper {
        VenueMain(name: "Music Hall of Williamsburg", slug: "music-hall-of-williamsburg")
    }
}

#Preview("Radio City Music Hall") {
    AppWrapper {
        VenueMain(name: "Radio City Music Hall", slug: "radio-city-music-hall")
    }
}

#Preview("United Palace") {
    AppWrapper {
        VenueMain(name: "United Palace", slug: "united-palace-theatre")
    }
}

#Preview("Hammerstein Ballroom") {
    AppWrapper {
        VenueMain(name: "Hammerstein Ballroom", slug: "hammerstein-ballroom")
    }
}

#Preview("Forest Hills Stadium") {
    AppWrapper {
        VenueMain(name: "Forest Hills Stadium", slug: "forest-hills-stadium")
    }
}

#Preview("Barclays Center") {
    AppWrapper {
        VenueMain(name: "Barclays Center", slug: "barclays-center")
    }
}

#Preview("Knockdown Center") {
    AppWrapper {
        VenueMain(name: "Knockdown Center", slug: "knockdown-center")
    }
}
