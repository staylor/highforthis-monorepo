import SwiftUI
import HighForThisAPI

struct VenueRecommendedShows: View {
    var shows: [VenueData.Shows.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("recommendedShows"))
        ForEach(shows, id: \.self) { node in
            ShowSectionItem(id: node.id, name: node.artist.name, date: node.date)
        }
    }
}
