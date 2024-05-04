import SwiftUI
import HighForThisAPI

struct ArtistRecommendedShows: View {
    var shows: [ArtistData.Shows.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("recommendedShows"))
        ForEach(shows, id: \.self) { node in
            ShowSectionItem(id: node.id, name: node.venue.name, date: node.date)
        }
    }
}
