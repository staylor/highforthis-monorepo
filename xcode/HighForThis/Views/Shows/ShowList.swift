import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: String
    var first: Int = 200
    var latest: GraphQLNullable<Bool> = nil
    var attended: GraphQLNullable<Bool> = nil
    @State private var year: Int = 0
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
                                            Text(show.venue.name).foregroundColor(.secondary)
                                        }
                                        
                                        Spacer()
                                    }
                                }
                            }
                        } header: {
                            Text(group.dateFormatted())
                                .foregroundColor(.primary)
                                .fontWeight(.bold)
                        }
                    }
                }
                .refreshable {
                    model.fetchShows(
                        first: first,
                        latest: latest,
                        attended: attended,
                        refresh: true
                    )
                }
                .listStyle(.plain)
                .navigationTitle(title)
                .toolbar {
                    if attended == .some(true) {
                        let filterByYear = L10N("filterByYear")
                        ToolbarItem {
                            Menu {
                                Picker(filterByYear, selection: $year) {
                                    Text(filterByYear).tag(0)
                                    ForEach(model.connection!.years!, id: \.self) {
                                        Text(String($0)).tag($0)
                                    }
                                }
                                .onChange(of: year) {
                                    model.fetchShows(
                                        first: first,
                                        latest: latest,
                                        attended: attended,
                                        year: .some(year)
                                    )
                                }
                            } label: {
                                Label(filterByYear, systemImage: "line.3.horizontal.decrease.circle")
                            }
                        }
                    }
                }
            }
            Spacer()
        }
        .onAppear() {
            model.fetchShows(first: first, latest: latest, attended: attended)
        }
    }
}

#Preview("Shows") {
    AppWrapper {
        ShowList(title: L10N("recommendedShows"), latest: .some(true))
    }
}

#Preview("History") {
    AppWrapper {
        ShowList(title: L10N("showHistory"), attended: true)
    }
}
