import HighForThisAPI
import SwiftUI

struct VideoList: View {
    @State private var feed = Feeds.videos()
    @State private var year: Int?

    var body: some View {
        FeedList(feed: feed, filter: VideoFilter(year: year), emptyTitle: .noVideos, systemImage: "video.slash") { videos in
            ForEach(videos, id: \.id) { video in VideoLink(video: video) }
        }
        .navigationTitle(.videos)
        .toolbar {
            if !feed.years.isEmpty || year != nil {
                ToolbarItem { YearFilter(years: feed.years, selection: $year) }
            }
        }
    }
}

/// A video, which opens on YouTube. tvOS can't open it, so there it's only the thumbnail and title.
struct VideoLink: View {
    let video: Video_video

    var body: some View {
        link
            .accessibilityLabel(video.title)
            .accessibilityIdentifier("video-\(video.id)")
    }

    @ViewBuilder private var link: some View {
        #if os(tvOS)
        label
            .accessibilityElement(children: .ignore)
        #else
        Link(destination: video.youTubeURL) { label }
            #if os(macOS)
        // A Mac draws a link's label in the color of a link in text: its title, and the frame its picture loads in.
        .buttonStyle(.plain)
            #endif
            .accessibilityHint(.opensYouTube)
        #endif
    }

    private var label: some View {
        PictureRow(pictureWidth: 120, regularPictureWidth: 160) {
            RemoteImage(url: video.thumbnails.best(forWidth: 480).flatMap { URL.webURL($0.url) }, aspectRatio: 16 / 9, contentMode: .fill)
                .overlay { PlayBadge() }
        } words: {
            RowLabel(title: video.title)
        }
    }
}

/// The mark on a thumbnail that says tapping it plays a video, in the website's pink, which keeps a white symbol
/// readable in light and dark. tvOS can't play the video, so it has no mark.
private struct PlayBadge: View {
    var body: some View {
        #if !os(tvOS)
        Image(systemName: "play.fill")
            .font(.caption)
            .foregroundStyle(.white)
            .padding(8)
            .background(Color(red: 229 / 255, green: 0, blue: 130 / 255).opacity(0.9), in: .circle)
        #endif
    }
}

#Preview {
    NavigationStack { VideoList() }
}
