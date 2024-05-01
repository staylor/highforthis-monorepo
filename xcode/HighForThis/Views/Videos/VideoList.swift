import SwiftUI
import HighForThisAPI
import CachedAsyncImage

struct VideoList: View {
    @State private var year: Int = 0
    @StateObject var model = VideoListModel()
    @Environment(\.openURL) private var openURL
    
    var body: some View {
        VStack(alignment: .leading) {
            if model.videos == nil {
                Spacer()
                Loading()
            } else if model.videos!.count == 0 {
                Text(L10N("noVideos"))
            } else {
                let filterByYear = L10N("filterByYear")
                List {
                    ForEach(model.videos!, id: \.self) { video in
                        Button(action: {
                            let url = URL(string: "youtube://v/\(video.dataId)")
                            openURL(url!)
                        }, label: {
                            HStack {
                                Paragraph(video.title).padding(.trailing).font(.subheadline)
                                if let thumb = video.thumbnails.first(where: {$0.width != 0}) {
                                    let url = URL(string: thumb.url)
                                    Spacer()
                                    CachedAsyncImage(url: url) { image in
                                        image.resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(height: 90)
                                    }  placeholder: {
                                        ImageLoading(width: 120, height: 90)
                                    }
                                }
                            }
                        }).buttonStyle(.plain)
                    }
                    if model.connection!.pageInfo.hasNextPage!  {
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
                    ToolbarItem {
                        Picker(filterByYear, selection: $year) {
                            #if os(macOS)
                            Text(verbatim: "--").tag(0)
                            #elseif os(iOS)
                            Text(filterByYear).tag(0)
                            #endif
                            ForEach(model.connection!.years!, id: \.self) {
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
            Spacer()
        }
        .onAppear() {
            model.fetchData()
        }
    }
}

#Preview {
    AppWrapper {
        VideoList()
    }
}
