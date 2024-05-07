import SwiftUI
import HighForThisAPI

struct VenueRecommendedShows: View {
    var shows: [VenueData.Shows.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("recommendedShows"))
        ForEach(shows, id: \.self) { node in
            let title = node.title ?? ""
            ShowSectionItem(id: node.id, name: title.isEmpty ? node.artists[0].name : title, date: node.date)
        }
    }
}
