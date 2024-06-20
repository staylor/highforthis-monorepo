import SwiftUI
import HighForThisAPI

struct ArtistMain: View {
    var name: String
    var slug: String
    @StateObject var model = ArtistModel()
    
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
                                ExternalLink(url: website, label: L10N("artistWebsite"))
                                    .padding(.vertical, 1)
                            }
                            if let url = model.appleMusic?.url! {
                                ExternalLink(url: url, label: L10N("listenOnAppleMusic"))
                            }
                        }
                        if let artwork = model.appleMusic?.artwork {
                            ArtistArtwork(
                                url: artwork.url!,
                                width: artwork.width!,
                                height: artwork.height!
                            )
                            block
                        } else {
                            block.padding(.top, 64)
                        }
                        if model.shows?.count == 0 {
                            HStack {
                                Text(L10N("noRecommendedShows"))
                                Spacer()
                            }.padding()
                            Spacer()
                        } else {
                            ArtistRecommendedShows(shows: model.shows!)
                        }
                        if model.attended!.count > 0 {
                            ArtistAttendedShows(attended: model.attended!)
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
        .onAppear() {
            model.fetchData(slug: slug)
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
