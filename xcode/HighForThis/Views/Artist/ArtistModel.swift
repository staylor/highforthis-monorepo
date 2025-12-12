import SwiftUI
import HighForThisAPI

@Observable
class ArtistModel {
    var website: String?
    var appleMusic: ArtistData.Artist.AppleMusic?
    var shows: [ArtistData.Shows.Edge.Node]?
    var attended: [ArtistData.Attended.Edge.Node]?

    func load(slug: String) async {
        let query = HighForThisAPI.ArtistQuery(slug: slug)
        guard let data = await fetchData(query) else { return }

        website = data.artist?.website
        appleMusic = data.artist?.appleMusic
        shows = data.shows?.edges.map { $0.node } ?? []
        attended = data.attended?.edges.map { $0.node } ?? []
    }
}
