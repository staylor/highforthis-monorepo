import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: String
    var first: Int = 200
    var latest: GraphQLNullable<Bool> = nil
    var attended: GraphQLNullable<Bool> = nil
    @State private var year: GraphQLNullable<Int> = nil
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
                    if attended == true {
                        let filterByYear = L10N("filterByYear")
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
                                model.fetchShows(
                                    first: first,
                                    latest: latest,
                                    attended: attended,
                                    year: year
                                )
                            }
                            #if os(macOS)
                            .frame(maxWidth: 160)
                            #endif
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
        ShowList(title: L10N("recommendedShows"), latest: true)
    }
}

#Preview("History") {
    AppWrapper {
        ShowList(title: L10N("showHistory"), attended: true)
    }
}
