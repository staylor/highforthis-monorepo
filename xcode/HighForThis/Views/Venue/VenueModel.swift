import SwiftUI
import HighForThisAPI

@Observable
class VenueModel {
    var venue: VenueData.Venue?
    var shows: [VenueData.Shows.Edge.Node]?
    var attended: [VenueData.Attended.Edge.Node]?

    func load(slug: String) async {
        let query = HighForThisAPI.VenueQuery(slug: slug)
        guard let data = await fetchData(query) else { return }

        venue = data.venue
        shows = data.shows?.edges.map { $0.node } ?? []
        attended = data.attended?.edges.map { $0.node } ?? []
    }
}
