import SwiftUI
import HighForThisAPI

class ArtistModel: ObservableObject {
    @Published var website: String?
    @Published var appleMusic: ArtistData.Artist.AppleMusic?
    @Published var shows: [ArtistData.Shows.Edge.Node]?
    @Published var attended: [ArtistData.Attended.Edge.Node]?

    func fetchData(slug: String) {
        let query = HighForThisAPI.ArtistQuery(slug: slug)
        getData(query) { [weak self] data in
            guard let self else { return }
            DispatchQueue.main.async {
                self.website = data.artist?.website
                self.appleMusic = data.artist?.appleMusic
                self.shows = data.shows?.edges.map { $0.node } ?? []
                self.attended = data.attended?.edges.map { $0.node } ?? []
            }
        }
    }
}
