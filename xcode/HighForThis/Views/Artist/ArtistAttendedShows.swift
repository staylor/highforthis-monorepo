import SwiftUI
import HighForThisAPI

struct ArtistAttendedShows: View {
    var attended: [ArtistData.Attended.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("artistWeWereThere \(attended.count)"))
        ForEach(attended, id: \.self) { node in
            ShowSectionItem(id: node.id, name: node.venue.name, date: node.date)
        }
    }
}
