import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: String
    @State private var groups: [ShowGroup]?

    var body: some View {
        VStack(alignment: .leading) {
            if (groups == nil) {
                Spacer()
                Loading()
            } else if groups!.count == 0 {
                Text(L10N("noRecommendedShows"))
            } else {
                List {
                    ForEach(groups!) { group in
                        Section {
                            ForEach(group.shows, id: \.self) { show in
                                NavigationLink {
                                    ShowDetail(id: show.id)
                                } label: {
                                    HStack {
                                        VStack(alignment: .leading) {
                                            Text(show.artist.name).foregroundColor(.accentColor)
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
                    fetchShows(refresh: true)
                }
                .listStyle(.plain)
                .navigationTitle(title)
            }
            Spacer()
        }
        .onAppear() {
            fetchShows()
        }
    }
    
    func fetchShows(refresh: Bool = false) {
        getShowList(refresh: refresh) { nodes in
            self.groups = showGroups(nodes)
        }
    }
    
    func showGroups(_ nodes: [ShowListNode]) -> [ShowGroup] {
        var dict: [Double:ShowGroup] = [:]
        for show in nodes {
            if dict[show.date] == nil {
                dict[show.date] = ShowGroup(date: show.date, shows: []);
            }
            dict[show.date]!.shows.append(show)
        }
        let sortedKeys = dict.keys.sorted()
        var byDate: [ShowGroup] = []
        for key in sortedKeys {
            byDate.append(dict[key]!)
        }
        return byDate
    }
}

#Preview {
    AppWrapper {
        ShowList(title: L10N("recommendedShows"))
    }
}
