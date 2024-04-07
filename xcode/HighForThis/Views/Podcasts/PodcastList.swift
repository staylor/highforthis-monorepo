import SwiftUI

struct PodcastList: View {
    @State var podcasts: [PodcastListNode]?

    var body: some View {
        VStack(alignment: .leading) {
            if podcasts == nil {
                Spacer()
                Loading()
            } else if podcasts!.count == 0 {
                Text("No podcast episodes.")
            } else {
                TextBlock {
                    Text("Podcast Episodes").font(.title).fontWeight(.black)
                }
                List {
                    ForEach(podcasts!, id: \.self) { podcast in
                        NavigationLink {
                            PodcastDetail(id: podcast.id)
                        } label: {
                            VStack(alignment: .leading) {
                                Text("Posted: \(parseDate(podcast.date!))").foregroundColor(.gray).padding(.bottom, 1)
                                Text(podcast.title).font(.title3).foregroundColor(.pink)
                            }
                        }
                    }
                }.listStyle(.plain)
            }
            Spacer()
        }.onAppear() {
            getPodcasts() { nodes in
                self.podcasts = nodes
            }
        }
        
    }
}

#Preview {
    AppWrapper {
        PodcastList()
    }
}
