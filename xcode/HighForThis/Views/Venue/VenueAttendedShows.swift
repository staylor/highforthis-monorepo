import SwiftUI
import HighForThisAPI

struct VenueAttendedShows: View {
    var attended: [VenueData.Attended.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("weWereThere"))
        ForEach(attended, id: \.self) { node in
            let title = node.title ?? ""
            ShowSectionItem(id: node.id, name: title.isEmpty ? node.artists[0].name : title, date: node.date)
        }
    }
}
