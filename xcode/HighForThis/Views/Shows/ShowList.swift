import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: String
    @StateObject var model = ShowListModel()

    var body: some View {
        VStack(alignment: .leading) {
            if (model.groups == nil) {
                Spacer()
                Loading()
            } else if model.groups!.count == 0 {
                Text(L10N("noRecommendedShows"))
            } else {
                List {
                    ForEach(model.groups!) { group in
                        Section {
                            ForEach(group.shows, id: \.self) { show in
                                let title = show.title ?? ""
                                let label = title.isEmpty ? show.artists.map { $0.name }.joined(separator: " / ") : title
                                NavigationLink {
                                    ShowDetail(id: show.id)
                                } label: {
                                    HStack {
                                        VStack(alignment: .leading) {
                                            Text(label).foregroundColor(.accentColor)
                                            Text(show.venue.name).foregroundColor(.gray)
                                        }
                                        
                                        Spacer()
                                    }
                                }
                            }
                        } header: {
                            Text(group.dateFormatted())
                                .foregroundColor(.black)
                                .fontWeight(.bold)
                        }
                    }
                }
                .refreshable {
                    model.fetchShows(refresh: true)
                }
                .listStyle(.plain)
                .navigationTitle(title)
            }
            Spacer()
        }
        .onAppear() {
            model.fetchShows()
        }
    }
}

#Preview {
    AppWrapper {
        ShowList(title: L10N("recommendedShows"))
    }
}
