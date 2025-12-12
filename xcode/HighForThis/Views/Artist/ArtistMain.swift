import SwiftUI
import HighForThisAPI

struct ArtistMain: View {
    var name: String
    var slug: String
    @State private var model = ArtistModel()
    
    var body: some View {
        ZStack {
            if model.shows == nil {
                Loading()
            } else {
                ScrollView {
                    VStack(alignment: .leading) {
                        let block = TextBlock {
                            Text(name).font(.title).bold()
                            if let website = model.website {
                                ExternalLink(url: website, label: "artistWebsite")
                                    .padding(.vertical, 1)
                            }
                            if let url = model.appleMusic?.url {
                                ExternalLink(url: url, label: "listenOnAppleMusic")
                            }
                        }
                        if let artwork = model.appleMusic?.artwork,
                           let url = artwork.url,
                           let width = artwork.width,
                           let height = artwork.height {
                            ArtistArtwork(
                                url: url,
                                width: width,
                                height: height
                            )
                            block
                        } else {
                            block.padding(.top, 64)
                        }
                        if let shows = model.shows, !shows.isEmpty {
                            ArtistRecommendedShows(shows: shows)
                        } else {
                            HStack {
                                Text("noRecommendedShows")
                                Spacer()
                            }.padding()
                            Spacer()
                        }
                        if let attended = model.attended, !attended.isEmpty {
                            ArtistAttendedShows(attended: attended)
                        }
                        Spacer()
                    }.padding(.bottom, 32)
                }
            }
        }
        #if os(iOS)
        .ignoresSafeArea()
        #elseif os(macOS)
        .padding(.all, 8)
        #endif
        .task {
            await model.load(slug: slug)
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
