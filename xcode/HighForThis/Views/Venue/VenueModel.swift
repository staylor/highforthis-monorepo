import SwiftUI
import HighForThisAPI

class VenueModel: ObservableObject {
    @Published var venue: VenueData.Venue?
    @Published var shows: [VenueData.Shows.Edge.Node]?
    @Published var attended: [VenueData.Attended.Edge.Node]?
    
    func fetchData(slug: String) {
        let query = HighForThisAPI.VenueQuery(slug: slug)
        getData(query) { data in
            self.venue = data.venue!
            
            var shows = [VenueData.Shows.Edge.Node]()
            for edge in data.shows!.edges {
                shows.append(edge.node)
            }
            self.shows = shows
            
            var attended = [VenueData.Attended.Edge.Node]()
            for edge in data.attended!.edges {
                attended.append(edge.node)
            }
            self.attended = attended
        }
    }
}
