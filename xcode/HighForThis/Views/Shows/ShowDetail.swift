import SwiftUI
import HighForThisAPI

struct ShowDetail: View {
    var id: ObjID
    @State private var show: ShowData?
    
    var body: some View {
        VStack(alignment: .leading) {
            if (show == nil) {
                // Required to make the spinner align in the center
                Spacer()
                Loading()
            } else {
                let show = show!
                if let artwork = show.artists[0].appleMusic?.artwork {
                    ArtistArtwork(
                        url: artwork.url!,
                        width: artwork.width!,
                        height: artwork.height!
                    )
                }
                TextBlock {
                    Group {
                        Text(parseDate(show.date, format: "EEEE, MM/dd/yyyy")) +
                        Text(verbatim: " - ") +
                        Text(parseDate(show.date, format: "h:mma"))
                    }
                    .foregroundColor(.black)
                    .font(.subheadline)
                    .padding(.bottom, 8)
                    
                    VStack(alignment: .leading) {
                        ForEach(show.artists, id: \.self) { artist in
                            InternalLink(artist.name, color: .accentColor) {
                                ArtistMain(name: artist.name, slug: artist.slug)
                            }
                        }

                        InternalLink(show.venue.name) {
                            VenueMain(name: show.venue.name, slug: show.venue.slug)
                        }
                    }.padding(.bottom, 32)
                    
                    // ExternalLink(url: "", label: "Tickets")

                    Spacer()
                }
            }
            // Required to make the full bleed image stay at the top
            Spacer()
        }
        #if os(iOS)
        .ignoresSafeArea()
        #elseif os(macOS)
        .padding(.all, 8)
        #endif
        .onAppear() {
            getShow(id: id) { show in
                self.show = show
            }
        }
    }
}

#Preview {
    AppWrapper {
        ShowDetail(id: PREVIEW_SHOW_ID)
    }
}

let PREVIEW_SHOW_ID = ObjID("5a3d8330bf3bd82f73a5ffab")
