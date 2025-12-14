import SwiftUI
import HighForThisAPI

struct VenueMain: View {
    var name: String
    var slug: String
    @State private var model = VenueModel()

    var body: some View {
        ZStack {
            if let venue = model.venue {
                ScrollView {
                    VStack(alignment: .leading) {
                        if let coordinates = venue.coordinates,
                           let latitude = coordinates.latitude,
                           let longitude = coordinates.longitude {
                            MapView(
                                name: name,
                                latitude: latitude,
                                longitude: longitude
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
                                Text("capacity \(capacity)")
                                    .foregroundColor(.gray)
                                    .padding(.bottom, 2)
                            }
                            if let website = venue.website {
                                ExternalLink(url: website, label: "venueWebsite")
                            }
                        }
                        if let shows = model.shows, !shows.isEmpty {
                            VenueRecommendedShows(shows: shows)
                        }
                        if let attended = model.attended, !attended.isEmpty {
                            VenueAttendedShows(attended: attended)
                        }
                    }.padding(.bottom, 32)
                }
            } else {
                Loading()
            }
        }
        #if os(iOS)
        .frame(maxWidth: 640)
        .frame(maxWidth: .infinity)
        .ignoresSafeArea(edges: UIDevice.current.userInterfaceIdiom == .phone ? .all : [])
        #elseif os(macOS)
        .padding(.all, 8)
        #endif
        .task {
            await model.load(slug: slug)
        }
    }
}

#Preview("MHOW") {
    NavigationStack {
        VenueMain(name: "Music Hall of Williamsburg", slug: "music-hall-of-williamsburg")
    }
}

#Preview("Radio City Music Hall") {
    NavigationStack {
        VenueMain(name: "Radio City Music Hall", slug: "radio-city-music-hall")
    }
}

#Preview("United Palace") {
    NavigationStack {
        VenueMain(name: "United Palace", slug: "united-palace-theatre")
    }
}

#Preview("Hammerstein Ballroom") {
    NavigationStack {
        VenueMain(name: "Hammerstein Ballroom", slug: "hammerstein-ballroom")
    }
}

#Preview("Forest Hills Stadium") {
    NavigationStack {
        VenueMain(name: "Forest Hills Stadium", slug: "forest-hills-stadium")
    }
}

#Preview("Barclays Center") {
    NavigationStack {
        VenueMain(name: "Barclays Center", slug: "barclays-center")
    }
}

#Preview("Knockdown Center") {
    NavigationStack {
        VenueMain(name: "Knockdown Center", slug: "knockdown-center")
    }
}
