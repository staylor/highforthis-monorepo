import SwiftUI
import AVKit
import HighForThisAPI

struct PodcastDetail: View {
    var id: ObjID
    @State private var podcast: HighForThisAPI.PodcastQuery.Data.Podcast?
    @StateObject private var viewModel = AudioPlayerViewModel()

    var body: some View {
        VStack(alignment: .leading) {
            if podcast == nil {
                Spacer()
                Loading()
            } else {
                let podcast = podcast!
                let posted = L10N("posted \(parseDate(podcast.date!))")
                TextBlock {
                    VStack(alignment: .leading) {
                        Text(podcast.title).foregroundColor(.black).font(.title).fontWeight(.bold)
                        Text(posted).foregroundColor(.gray).padding(.bottom)
                        Text(podcast.description)
                    }.padding(.vertical, 24)
                    HStack {
                        Button(action: {
                            viewModel.toggle(url: cdnUrl("\(podcast.audio!.destination)/\(podcast.audio!.fileName)"))
                        }) {
                            Image(systemName: viewModel.isPlaying ? "pause.circle.fill" : "play.circle.fill").resizable()
                                .foregroundColor(.accentColor)
                                .frame(width: 50, height: 50)
                                .aspectRatio(contentMode: .fit)
                        }.buttonStyle(.plain)
                        Spacer()
                        Image(systemName: "waveform")
                            .resizable()
                            .frame(width: 80, height: 80)
                    }.padding(.trailing)
                }
            }
            Spacer()
        }
        .onAppear() {
            let query = HighForThisAPI.PodcastQuery(id: id)
            getData(query) { data in
                self.podcast = data.podcast!
            }
        }
    }
}

#Preview {
    AppWrapper {
        PodcastDetail(id: PREVIEW_PODCAST_ID)
    }
}

let PREVIEW_PODCAST_ID = ObjID("5cc94450a331ab4fcdcd8cd7")
