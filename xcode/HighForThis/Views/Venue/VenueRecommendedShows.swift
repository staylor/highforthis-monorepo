import SwiftUI
import HighForThisAPI

struct VenueRecommendedShows: View {
    var shows: [VenueData.Shows.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("recommendedShows"))
        ForEach(shows, id: \.self) { node in
            let title = node.title ?? ""
            let label = title.isEmpty ? node.artists.map { $0.name }.joined(separator: " / ") : title
            ShowSectionItem(id: node.id, name: label, date: node.date)
        }
    }
}
