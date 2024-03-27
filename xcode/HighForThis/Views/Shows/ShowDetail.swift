import SwiftUI
import HighForThisAPI

struct ShowDetail: View {
    var id: ObjID
    @State private var show: ShowData?
    
    var body: some View {
        VStack {
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
                    
                    NavigationLink(show.artist.name) {
                        ArtistMain(name: show.artist.name, slug: show.artist.slug)
                    }.foregroundColor(.pink).font(.title).padding(.bottom)
                    
                    NavigationLink(show.venue.name) {
                        VenueMain(name: show.venue.name, slug: show.venue.slug)
                    }.foregroundColor(.black).font(.title2)
                    
                    if let address = show.venue.asVenue?.address {
                        Text(address).foregroundColor(.gray)
                    }
                }
            }
            // Required to make the full bleed image stay at the top
            Spacer()
        }
        .toolbarBackground(.hidden, for: .navigationBar)
        .ignoresSafeArea()
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
