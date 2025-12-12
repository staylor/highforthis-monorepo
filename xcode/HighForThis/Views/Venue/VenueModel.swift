import SwiftUI
import HighForThisAPI

class VenueModel: ObservableObject {
    @Published var venue: VenueData.Venue?
    @Published var shows: [VenueData.Shows.Edge.Node]?
    @Published var attended: [VenueData.Attended.Edge.Node]?

    func fetchData(slug: String) {
        let query = HighForThisAPI.VenueQuery(slug: slug)
        getData(query) { [weak self] data in
            guard let self else { return }
            DispatchQueue.main.async {
                self.venue = data.venue
                self.shows = data.shows?.edges.map { $0.node } ?? []
                self.attended = data.attended?.edges.map { $0.node } ?? []
            }
        }
    }
}
