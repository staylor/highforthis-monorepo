import SwiftUI
import AVKit
import HighForThisAPI

struct PodcastDetail: View {
    var id: ObjID
    @State private var podcast: PodcastData?
    @StateObject private var viewModel = AudioPlayerViewModel()

    var body: some View {
        VStack(alignment: .leading) {
            if podcast == nil {
                Spacer()
                Loading()
            } else {
                let podcast = podcast!
                TextBlock {
                    Image(systemName: "waveform")
                        .resizable()
                        .frame(width: 80, height: 80)
                    VStack(alignment: .leading) {
                        Text(podcast.title).foregroundColor(.black).font(.title2).fontWeight(.bold).padding(.vertical)
                        Text(podcast.description).padding(.bottom)
                    }
                    HStack {
                        Button(action: {
                            viewModel.toggle(url: cdnUrl("\(podcast.audio!.destination)/\(podcast.audio!.fileName)"))
                        }) {
                            Image(systemName: viewModel.isPlaying ? "pause.circle.fill" : "play.circle.fill").resizable()
                                .foregroundColor(.pink)
                                .frame(width: 50, height: 50)
                                .aspectRatio(contentMode: .fit)
                        }
                    }.padding(.trailing)
                }
            }
            Spacer()
        }
        .onAppear() {
            getPodcast(id: id) { podcast in
                self.podcast = podcast
            }
        }
    }
}

#Preview {
    PodcastDetail(id: PREVIEW_PODCAST_ID)
}

let PREVIEW_PODCAST_ID = ObjID("5cc94450a331ab4fcdcd8cd7")
