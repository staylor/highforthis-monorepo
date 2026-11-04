import Apollo
import HighForThisAPI
import SwiftUI

struct VideoList: View {
    @State private var feed = VideoFeed()
    @State private var year: Int?

    var body: some View {
        content
            .navigationTitle(.videos)
            .toolbar {
                if !feed.years.isEmpty {
                    ToolbarItem {
                        YearFilter(years: feed.years, selection: $year)
                    }
                }
            }
            .task(id: year) {
                await feed.show(year: year)
            }
    }

    @ViewBuilder private var content: some View {
        if !feed.videos.isEmpty {
            List {
                ForEach(feed.videos, id: \.id) { video in
                    VideoLink(video: video)
                }
                if let error = feed.error {
                    LoadFailedView(error: error) {
                        await feed.loadMore()
                    }
                } else if feed.hasNextPage {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        // Keyed by the count, so it asks for the next page again while it stays on screen.
                        .task(id: feed.videos.count) {
                            await feed.loadMore()
                        }
                }
            }
            .listStyle(.plain)
            .refreshable {
                await feed.reload(year: year, cachePolicy: .networkOnly)
            }
        } else if let error = feed.error {
            LoadFailedView(error: error) {
                await feed.reload(year: year, cachePolicy: .networkOnly)
            }
        } else if feed.hasLoaded {
            ContentUnavailableView(.noVideos, systemImage: "video.slash")
        } else {
            ProgressView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

/// A video, which plays on YouTube.
struct VideoLink: View {
    let video: Video_video

    var body: some View {
        Link(destination: video.youTubeURL) {
            HStack(alignment: .top, spacing: 12) {
                Text(video.title)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                RemoteImage(url: video.thumbnail(forWidth: 480).flatMap { URL(string: $0.url) }, aspectRatio: 16 / 9, contentMode: .fill)
                    .frame(width: 160)
                    .clipShape(.rect(cornerRadius: 6))
            }
        }
        .accessibilityIdentifier("video-\(video.id)")
    }
}

extension Video_video {
    fileprivate func thumbnail(forWidth width: Int) -> Thumbnail? {
        thumbnails.best(forWidth: width)
    }
}

#Preview {
    NavigationStack {
        VideoList()
    }
}
