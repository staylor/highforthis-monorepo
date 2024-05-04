import SwiftUI
import HighForThisAPI

struct ArtistMain: View {
    var name: String
    var slug: String
    @State private var website: String?
    @State private var appleMusic: ArtistData.Artist.AppleMusic?
    @State private var shows: [ArtistData.Shows.Edge.Node]?
    @State private var attended: [ArtistData.Attended.Edge.Node]?
    
    var body: some View {
        ZStack {
            if shows == nil {
                Loading()
            } else {
                ScrollView {
                    VStack(alignment: .leading) {
                        let block = TextBlock {
                            Text(name).font(.title).bold()
                            if let website = website {
                                ExternalLink(url: website, label: L10N("artistWebsite"))
                                    .padding(.vertical, 1)
                            }
                            if let url = appleMusic?.url! {
                                ExternalLink(url: url, label: L10N("listenOnAppleMusic"))
                            }
                        }
                        if let artwork = appleMusic?.artwork {
                            ArtistArtwork(
                                url: artwork.url!,
                                width: artwork.width!,
                                height: artwork.height!
                            )
                            block
                        } else {
                            block.padding(.top, 64)
                        }
                        if shows?.count == 0 {
                            HStack {
                                Text(L10N("noRecommendedShows"))
                                Spacer()
                            }.padding()
                            Spacer()
                        } else {
                            ArtistRecommendedShows(shows: shows!)
                        }
                        if attended!.count > 0 {
                            ArtistAttendedShows(attended: attended!)
                        }
                        Spacer()
                    }.padding(.bottom, 32)
                }
            }
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
                if data.artist?.appleMusic != nil {
                    self.appleMusic = data.artist!.appleMusic!
                }
                var shows = [ArtistData.Shows.Edge.Node]()
                for edge in data.shows!.edges {
                    shows.append(edge.node)
                }
                self.shows = shows
                
                var attended = [ArtistData.Attended.Edge.Node]()
                for edge in data.attended!.edges {
                    attended.append(edge.node)
                }
                self.attended = attended
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

#Preview("No artwork") {
    AppWrapper {
        ArtistMain(name: "Mac DeMarco", slug: "mac-demarco")
    }
}
