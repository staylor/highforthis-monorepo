import SwiftUI
import HighForThisAPI

struct VideoList: View {
    @State private var year: Int = 0
    @State private var model = VideoListModel()
    @Environment(\.openURL) private var openURL

    var body: some View {
        Group {
            if let videos = model.videos {
                if videos.isEmpty {
                    ContentUnavailableView(
                        "noVideos",
                        systemImage: "video.slash"
                    )
                } else {
                    List {
                        ForEach(videos, id: \.self) { video in
                            Button {
                                if let url = URL(string: "youtube://v/\(video.dataId)") {
                                    openURL(url)
                                }
                            } label: {
                                VideoListRow(video: video)
                            }
                            .buttonStyle(.plain)
                        }

                        if model.connection?.pageInfo.hasNextPage == true {
                            Button {
                                Task { await model.fetchCursor() }
                            } label: {
                                Text("loadMore")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)
                            .listRowBackground(Color.clear)
                            .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16))
                        }
                    }
                    .listStyle(.plain)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("videos")
        .toolbar {
            if let years = model.connection?.years {
                ToolbarItem {
                    YearPicker(years: years, selection: $year) {
                        await model.fetchYear(year)
                    }
                }
            }
        }
        .task {
            await model.fetchVideos()
        }
    }
}

#Preview {
    AppWrapper {
        VideoList()
    }
}
