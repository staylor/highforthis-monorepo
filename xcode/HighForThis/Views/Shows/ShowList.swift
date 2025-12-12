import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: String
    var first: Int = 200
    var latest: GraphQLNullable<Bool> = nil
    var attended: GraphQLNullable<Bool> = nil
    @State private var year: Int = 0
    @State private var model = ShowListModel()

    var body: some View {
        VStack(alignment: .leading) {
            if let groups = model.groups {
                if groups.isEmpty {
                    Text(L10N("noRecommendedShows"))
                } else {
                    List {
                        ForEach(groups) { group in
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
                        await model.fetchShows(
                            first: first,
                            latest: latest,
                            attended: attended,
                            refresh: true
                        )
                    }
                    .listStyle(.plain)
                    .navigationTitle(title)
                    .toolbar {
                        if attended == .some(true), let years = model.connection?.years {
                            let filterByYear = L10N("filterByYear")
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
                                    Task {
                                        await model.fetchShows(
                                            first: first,
                                            latest: latest,
                                            attended: attended,
                                            year: .some(year)
                                        )
                                    }
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
        .task {
            await model.fetchShows(first: first, latest: latest, attended: attended)
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
