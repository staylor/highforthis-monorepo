import SwiftUI
import HighForThisAPI
import CachedAsyncImage

struct VideoList: View {
    @State private var year: Int = 0
    @StateObject private var model = VideoListModel()
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(alignment: .leading) {
            if let videos = model.videos {
                if videos.isEmpty {
                    Text(L10N("noVideos"))
                } else {
                    let filterByYear = L10N("filterByYear")
                    List {
                        ForEach(videos, id: \.self) { video in
                            Button(action: {
                                if let url = URL(string: "youtube://v/\(video.dataId)") {
                                    openURL(url)
                                }
                            }, label: {
                                HStack {
                                    Paragraph(video.title).padding(.trailing).font(.subheadline)
                                    if let thumb = video.thumbnails.first(where: { $0.width != 0 }) {
                                        Spacer()
                                        CachedAsyncImage(url: URL(string: thumb.url)) { image in
                                            image.resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .frame(height: 90)
                                        } placeholder: {
                                            ImageLoading(width: 120, height: 90)
                                        }
                                    }
                                }
                            }).buttonStyle(.plain)
                        }
                        if model.connection?.pageInfo.hasNextPage == true {
                            Button(action: {
                                model.fetchCursor()
                            }, label: {
                                Text(L10N("loadMore"))
                                    .font(.title3)
                                    .foregroundColor(.accentColor)
                                    #if os(macOS)
                                    .padding(8)
                                    #endif
                            })
                            #if os(macOS)
                            .padding(.vertical)
                            #endif
                        }
                    }
                    .listStyle(.plain)
                    .navigationTitle(L10N("videos"))
                    .toolbar {
                        if let years = model.connection?.years {
                            ToolbarItem {
                                Picker(filterByYear, selection: $year) {
                                    #if os(macOS)
                                    Text(verbatim: "--").tag(0)
                                    #elseif os(iOS)
                                    Text(filterByYear).tag(0)
                                    #endif
                                    ForEach(years, id: \.self) {
                                        Text(String($0)).tag($0)
                                    }
                                }
                                .onChange(of: year) {
                                    model.fetchYear(year)
                                }
                                #if os(macOS)
                                .frame(maxWidth: 160)
                                #endif
                            }
                        }
                    }
                }
            } else {
                Spacer()
                Loading()
            }
            Spacer()
        }
        .onAppear {
            model.fetchData()
        }
    }
}

#Preview {
    AppWrapper {
        VideoList()
    }
}
