import SwiftUI
import HighForThisAPI

struct ArtistMain: View {
    var name: String
    var slug: String
    @State private var appleMusic: ArtistData.Artist.AsArtist.AppleMusic?
    @State private var nodes: [ArtistData.Shows.Edge.Node]?
    @Environment(\.openURL) private var openURL
    
    var body: some View {
        VStack(alignment: .leading) {
            if nodes == nil {
                Loading()
            } else {
                if let artwork = appleMusic?.artwork {
                    ArtistArtwork(
                        url: artwork.url!,
                        width: artwork.width!,
                        height: artwork.height!
                    )
                }
                VStack(alignment: .leading) {
                    TextBlock {
                        Text("\(name)").font(.title).bold()
                        if let url = appleMusic?.url! {
                            Button(action: {
                                let url = URL(string: url)
                                openURL(url!)
                            }) {
                                Text("Listen on Apple Music →").foregroundColor(.pink)
                            }
                            .buttonStyle(.plain)
                            .font(.title3)
                        }
                    }
                    if nodes?.count == 0 {
                        HStack {
                            Text("There are no shows to recommend right now.")
                            Spacer()
                        }.padding()
                        Spacer()
                    } else {
                        List {
                            ForEach(nodes!, id: \.self) { node in
                                NavigationLink {
                                    ShowDetail(id: node.id)
                                } label: {
                                    HStack {
                                        VStack(alignment: .leading) {
                                            Text(parseDate(node.date)).foregroundColor(.gray)
                                            Text(node.venue.name)
                                        }
                                        Spacer()
                                    }
                                }
                            }
                        }
                        .listStyle(.plain)
                    }
                }
            }
            Spacer()
        }
        #if os(iOS)
        .ignoresSafeArea()
        .toolbarBackground(.hidden, for: .navigationBar)
        #elseif os(macOS)
        .padding(.all, 8)
        #endif
        .onAppear() {
            getArtist(slug: slug) { data in
                self.appleMusic = data.artist!.asArtist!.appleMusic!
                
                var nodes = [ArtistData.Shows.Edge.Node]()
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
        ArtistMain(name: "Olivia Rodrigo", slug: "olivia-rodrigo")
    }
}
