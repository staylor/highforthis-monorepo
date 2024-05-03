import SwiftUI
import HighForThisAPI

struct ArtistMain: View {
    var name: String
    var slug: String
    @State private var website: String?
    @State private var appleMusic: ArtistData.Artist.AppleMusic?
    @State private var nodes: [ArtistData.Shows.Edge.Node]?
    
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
                        Text(name).font(.title).bold()
                        if let website = website {
                            ExternalLink(url: website, label: L10N("artistWebsite"))
                                .padding(.vertical, 1)
                        }
                        if let url = appleMusic?.url! {
                            ExternalLink(url: url, label: L10N("listenOnAppleMusic"))
                        }
                    }
                    if nodes?.count == 0 {
                        HStack {
                            Text(L10N("noRecommendedShows"))
                            Spacer()
                        }.padding()
                        Spacer()
                    } else {
                        Text(L10N("recommendedShows"))
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
                self.website = data.artist!.website
                self.appleMusic = data.artist!.appleMusic!
                
                var nodes = [ArtistData.Shows.Edge.Node]()
                for edge in data.shows!.edges {
                    nodes.append(edge.node)
                }
                self.nodes = nodes
            }
        }
    }
}

#Preview("With shows") {
    AppWrapper {
        ArtistMain(name: "Julia Jacklin", slug: "julia-jacklin")
    }
}

#Preview("No shows") {
    AppWrapper {
        ArtistMain(name: "Olivia Rodrigo", slug: "olivia-rodrigo")
    }
}
