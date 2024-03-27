import SwiftUI
import HighForThisAPI
import CachedAsyncImage

struct VideoList: View {
    @Namespace var topID
    @State private var year: Int = 0
    @StateObject var model = VideoListModel()
    
    var body: some View {
        VStack(alignment: .leading) {
            if model.videos == nil {
                Spacer()
                Loading()
            } else if model.videos!.count == 0 {
                Text("No videos.")
            } else {
                ScrollViewReader { proxy in
                    TextBlock {
                        HStack {
                            Button(action: {
                                withAnimation {
                                    proxy.scrollTo(topID)
                                }
                            }, label: {
                                Text("Videos")
                                    .font(.title)
                                    .foregroundColor(.black)
                                    .fontWeight(.black)
                            })
                            Spacer()

                            Picker("Filter by year", selection: $year) {
                                Text("Filter by year").tag(0)
                                ForEach(model.connection!.years!, id: \.self) {
                                    Text(String($0)).tag($0)
                                }
                            }
                            .pickerStyle(.menu)
                            .onChange(of: year) {
                                model.fetchYear(year)
                            }
                        }
                    }
                    List {
                        EmptyView().id(topID)
                        ForEach(model.videos!, id: \.self) { video in
                            Button(action: {
                                let url = URL(string: "youtube://v/\(video.dataId)")
                                UIApplication.shared.open(url!)
                            }, label: {
                                HStack {
                                    Paragraph(video.title).padding(.trailing).font(.caption)
                                    if let thumb = video.thumbnails.first(where: {$0.width != 0}) {
                                        let url = URL(string: thumb.url)
                                        Spacer()
                                        CachedAsyncImage(url: url) { image in
                                            image.resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .frame(height: 100)
                                        }  placeholder: {
                                            ImageLoading().frame(height: 100)
                                        }
                                    }
                                }
                            })
                        }
                        if model.connection!.pageInfo.hasNextPage!  {
                            Button(action: {
                                model.fetchCursor()
                            }, label: {
                                Text("Load More")
                            }).foregroundColor(.pink)
                        }
                    }.listStyle(.plain)
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
