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

/// A video, which opens on YouTube. tvOS can't open it, so there it's only the title and thumbnail.
struct VideoLink: View {
    let video: Video_video
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        #if os(tvOS)
        label
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(video.title)
            .accessibilityIdentifier("video-\(video.id)")
        #else
        Link(destination: video.youTubeURL) { label }
            .accessibilityLabel(video.title)
            .accessibilityHint(.opensYouTube)
            .accessibilityIdentifier("video-\(video.id)")
        #endif
    }

    private var label: some View {
        let layout =
            dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 12)) : AnyLayout(HStackLayout(spacing: 12))
        return layout {
            Text(video.title)
                .font(.body)
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
            RemoteImage(
                url: video.thumbnails.best(forWidth: 480).flatMap { URL.webURL($0.url) }, aspectRatio: 16 / 9, contentMode: .fill
            )
            .frame(width: dynamicTypeSize.isAccessibilitySize ? nil : 120)
            .clipShape(.rect(cornerRadius: 8))
            .accessibilityHidden(true)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack { VideoList() }
}
