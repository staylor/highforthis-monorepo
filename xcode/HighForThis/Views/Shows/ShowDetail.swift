import SwiftUI
import HighForThisAPI

struct ShowDetail: View {
    var id: ObjID
    @State private var show: HighForThisAPI.ShowQuery.Data.Show?

    var body: some View {
        VStack(alignment: .leading) {
            if let show {
                if let artwork = show.artists.first?.appleMusic?.artwork,
                   let url = artwork.url,
                   let width = artwork.width,
                   let height = artwork.height {
                    ArtistArtwork(
                        url: url,
                        width: width,
                        height: height
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

                    Spacer()
                }
            } else {
                Spacer()
                Loading()
            }
            Spacer()
        }
        #if os(iOS)
        .ignoresSafeArea()
        #elseif os(macOS)
        .padding(.all, 8)
        #endif
        .onAppear {
            let query = HighForThisAPI.ShowQuery(id: id)
            getData(query) { data in
                DispatchQueue.main.async {
                    self.show = data.show
                }
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
