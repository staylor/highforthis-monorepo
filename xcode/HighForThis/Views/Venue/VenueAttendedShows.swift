import SwiftUI
import HighForThisAPI

struct VenueAttendedShows: View {
    var attended: [VenueData.Attended.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("weWereThere"))
        ForEach(attended, id: \.self) { node in
            ShowSectionItem(id: node.id, name: node.artist.name, date: node.date)
        }
    }
}
