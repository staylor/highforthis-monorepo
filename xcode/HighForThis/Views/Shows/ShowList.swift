import SwiftUI
import HighForThisAPI

struct ShowList: View {
    var title: LocalizedStringKey
    var first: Int = 200
    var latest: GraphQLNullable<Bool> = nil
    var attended: GraphQLNullable<Bool> = nil
    @State private var year: Int = 0
    @State private var model = ShowListModel()

    var body: some View {
        Group {
            if let groups = model.groups {
                if groups.isEmpty {
                    ContentUnavailableView(
                        "noRecommendedShows",
                        systemImage: "calendar.badge.exclamationmark"
                    )
                } else {
                    List {
                        ForEach(groups) { group in
                            Section {
                                ForEach(group.shows, id: \.self) { show in
                                    NavigationLink {
                                        ShowDetail(id: show.id)
                                    } label: {
                                        ShowListRow(show: show)
                                    }
                                }
                            } header: {
                                Text(group.dateFormatted())
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                    .refreshable {
                        await model.fetchShows(
                            first: first,
                            latest: latest,
                            attended: attended,
                            refresh: true
                        )
                    }
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle(title)
        .toolbar {
            if attended == .some(true), let years = model.connection?.years {
                ToolbarItem {
                    YearPicker(years: years, selection: $year) {
                        await model.fetchShows(
                            first: first,
                            latest: latest,
                            attended: attended,
                            year: .some(year)
                        )
                    }
                }
            }
        }
        .task {
            await model.fetchShows(first: first, latest: latest, attended: attended)
        }
    }
}

#Preview("Shows") {
    NavigationStack {
        ShowList(title: "recommendedShows", latest: .some(true))
    }
}

#Preview("History") {
    NavigationStack {
        ShowList(title: "showHistory", attended: true)
    }
}
