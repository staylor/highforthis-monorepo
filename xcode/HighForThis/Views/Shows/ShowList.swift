import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: String
    @State private var groups: [ShowGroup]?

    var body: some View {
        ZStack {
            if (groups == nil) {
                Loading()
            } else if groups!.count == 0 {
                Text("No recommended shows.")
            } else {
                VStack(alignment: .leading) {
                    TextBlock {
                        Text(title).font(.title).fontWeight(.black)
                    }
                    List {
                        ForEach(groups!) { group in
                            Section {
                                ForEach(group.shows, id: \.self) { show in
                                    NavigationLink {
                                        ShowDetail(id: show.id)
                                    } label: {
                                        HStack {
                                            VStack(alignment: .leading) {
                                                Text(show.artist.name).foregroundColor(.pink)
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
                    }.listStyle(.plain)
                    Spacer()
                }
            }
        }
        .onAppear() {
            getShowList() { nodes in
                self.groups = showGroups(nodes)
            }
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
        ShowList(title: "Recommended Shows")
    }
}
