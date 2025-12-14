import SwiftUI
import AVKit
import HighForThisAPI

struct PodcastDetail: View {
    var id: ObjID
    @State private var podcast: HighForThisAPI.PodcastQuery.Data.Podcast?
    @State private var audioPlayer = AudioPlayerViewModel()

    var body: some View {
        VStack(alignment: .leading) {
            if let podcast {
                let posted = podcast.date.map { "posted \(parseDate($0))" } ?? ""
                TextBlock {
                    VStack(alignment: .leading) {
                        Text(podcast.title).foregroundColor(.black).font(.title).fontWeight(.bold)
                        Text(posted).foregroundColor(.gray).padding(.bottom)
                        Text(podcast.description)
                    }.padding(.vertical, 24)
                    HStack {
                        if let audio = podcast.audio {
                            Button(action: {
                                audioPlayer.toggle(url: cdnUrl("\(audio.destination)/\(audio.fileName)"))
                            }) {
                                Image(systemName: audioPlayer.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                                    .resizable()
                                    .foregroundColor(.accentColor)
                                    .frame(width: 50, height: 50)
                                    .aspectRatio(contentMode: .fit)
                            }.buttonStyle(.plain)
                        }
                        Spacer()
                        Image(systemName: "waveform")
                            .resizable()
                            .frame(width: 80, height: 80)
                    }.padding(.trailing)
                    if let error = audioPlayer.error {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                            .padding(.top, 8)
                    }
                }
            } else {
                Spacer()
                Loading()
            }
            Spacer()
        }
        .task {
            let query = HighForThisAPI.PodcastQuery(id: id)
            if let data = await fetchData(query) {
                podcast = data.podcast
            }
        }
    }
}

#Preview {
    PodcastDetail(id: PREVIEW_PODCAST_ID)
}

let PREVIEW_PODCAST_ID = ObjID("5cc94450a331ab4fcdcd8cd7")
