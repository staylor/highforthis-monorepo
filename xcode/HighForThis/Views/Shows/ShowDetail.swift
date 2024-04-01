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
                if let artwork = show.artist.asArtist?.appleMusic?.artwork {
                    ArtistArtwork(
                        url: artwork.url!,
                        width: artwork.width!,
                        height: artwork.height!
                    )
                }
                TextBlock {
                    Text(parseDate(show.date)).foregroundColor(.black).font(.title3).fontWeight(.bold)
                    
                    NavigationLink(destination: {
                        ArtistMain(name: show.artist.name, slug: show.artist.slug)
                    }) {
                        Text(show.artist.name).foregroundColor(.accentColor).font(.title)
                    }
                    .buttonStyle(.plain)
                    .padding(.bottom)
                    
                    NavigationLink(destination: {
                        VenueMain(name: show.venue.name, slug: show.venue.slug)
                    }) {
                        Text(show.venue.name).foregroundColor(.black).font(.title2)
                    }
                    .buttonStyle(.plain)

                    if let address = show.venue.asVenue?.address {
                        Text(address).foregroundColor(.gray)
                    }
                    Spacer()
                }
            }
            // Required to make the full bleed image stay at the top
            Spacer()
        }
        #if os(iOS)
        .toolbarBackground(.hidden, for: .navigationBar)
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
