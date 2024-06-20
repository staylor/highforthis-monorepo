import SwiftUI
import HighForThisAPI

struct VenueMain: View {
    var name: String
    var slug: String
    @StateObject var model = VenueModel()
    
    var body: some View {
        ZStack {
            if model.venue == nil {
                Loading()
            } else {
                let venue = model.venue!
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
                        if model.shows!.count > 0 {
                            VenueRecommendedShows(shows: model.shows!)
                        }
                        if model.attended!.count > 0 {
                            VenueAttendedShows(attended: model.attended!)
                        }
                    }.padding(.bottom, 32)
                }.ignoresSafeArea()
            }
        }
        #if os(iOS)
        .ignoresSafeArea()
        #elseif os(macOS)
        .padding(.all, 8)
        #endif
        .onAppear() {
            model.fetchData(slug: slug)
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
