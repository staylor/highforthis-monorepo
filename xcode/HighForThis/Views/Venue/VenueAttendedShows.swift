import SwiftUI
import HighForThisAPI

struct VenueAttendedShows: View {
    var attended: [VenueData.Attended.Edge.Node]
    
    var body: some View {
        ShowsSectionHeader(L10N("weWereThere"))
        ForEach(attended, id: \.self) { node in
            let title = node.title ?? ""
            let label = title.isEmpty ? node.artists.map { $0.name }.joined(separator: " / ") : title
            ShowSectionItem(id: node.id, name: label, date: node.date)
        }
    }
}
