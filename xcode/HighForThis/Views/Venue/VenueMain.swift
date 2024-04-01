import SwiftUI
import HighForThisAPI

struct VenueMain: View {
    var name: String
    var slug: String
    @State private var venue: VenueData.Venue.AsVenue?
    @State private var nodes: [VenueData.Shows.Edge.Node]?
    @Environment(\.openURL) private var openURL
    
    var body: some View {
        ZStack {
            if venue == nil {
                Loading()
            } else {
                let venue = venue!
                VStack(alignment: .leading) {
                    if let coordinates = venue.coordinates {
                        MapView(
                            name: name,
                            latitude: coordinates.latitude!,
                            longitude: coordinates.longitude!
                        )
                    }
                    TextBlock {
                        Text("\(name)").font(.title).bold().padding(.bottom, 2)
                        if let address = venue.address {
                            Text(address)
                                .foregroundColor(.gray)
                                .padding(.bottom, 2)
                        }
                        if let capacity = venue.capacity {
                            Text("Capacity: \(capacity)")
                                .foregroundColor(.gray)
                                .padding(.bottom, 2)
                        }
                        if let website = venue.website {
                            Button(action: {
                                let url = URL(string: website)
                                openURL(url!)
                            }, label: {
                                Text("Website →")
                                    .font(.system(size: 18))
                                    .underline()
                                    .foregroundColor(.pink)
                            })
                            .buttonStyle(.plain)
                        }
                    }
                    Text("Recommended Shows")
                        .font(.title3)
                        .bold()
                        .padding(.horizontal)
                        .padding(.top, 20)
                    List {
                        ForEach(nodes!, id: \.self) { node in
                            NavigationLink {
                                ShowDetail(id: node.id)
                            } label: {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(parseDate(node.date)).foregroundColor(.gray)
                                        Text(node.artist.name).foregroundColor(.pink)
                                    }
                                    
                                    Spacer()
                                }
                            }
                        }
                    }.listStyle(.plain)
                }
            }
        }
        #if os(iOS)
        .toolbarBackground(.hidden, for: .navigationBar)
        #endif
        .onAppear() {
            getVenue(slug: slug) { data in
                self.venue = data.venue!.asVenue!
                
                var nodes = [VenueData.Shows.Edge.Node]()
                for edge in data.shows!.edges {
                    nodes.append(edge.node)
                }
                self.nodes = nodes
            }
        }
    }
}

#Preview {
    AppWrapper {
        VenueMain(name: "Music Hall of Williamsburg", slug: "music-hall-of-williamsburg")
    }
}
