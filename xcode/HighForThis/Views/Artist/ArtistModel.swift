import SwiftUI
import HighForThisAPI

class ArtistModel: ObservableObject {
    @Published var website: String?
    @Published var appleMusic: ArtistData.Artist.AppleMusic?
    @Published var shows: [ArtistData.Shows.Edge.Node]?
    @Published var attended: [ArtistData.Attended.Edge.Node]?
    
    func fetchData(slug: String) {
        let query = HighForThisAPI.ArtistQuery(slug: slug)
        getData(query) { data in
            self.website = data.artist!.website
            if data.artist?.appleMusic != nil {
                self.appleMusic = data.artist!.appleMusic!
            }
            var shows = [ArtistData.Shows.Edge.Node]()
            for edge in data.shows!.edges {
                shows.append(edge.node)
            }
            self.shows = shows
            
            var attended = [ArtistData.Attended.Edge.Node]()
            for edge in data.attended!.edges {
                attended.append(edge.node)
            }
            self.attended = attended
        }
    }
}
