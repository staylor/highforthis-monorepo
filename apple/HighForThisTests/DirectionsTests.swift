import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct DirectionsTests {
    @Test func directionsJoinTheVenueAddressOnOneLine() async throws {
        let show = await ShowList_show.from(
            Mock<Show>(
                id: "show",
                venue: Mock<Venue>(address: "3730 N Clark St\nChicago, IL 60613", id: "venue", name: "Metro", slug: "metro")
            )
        )
        let directions = try #require(show.venue.address.flatMap(URL.directions))
        let components = try #require(URLComponents(url: directions, resolvingAgainstBaseURL: false))
        #expect(components.scheme == "maps")
        #expect(
            components.queryItems == [
                URLQueryItem(name: "daddr", value: "3730 N Clark St, Chicago, IL 60613"),
                URLQueryItem(name: "dirflg", value: "d"),
            ]
        )
    }

    @Test func directionsEscapeTheAddress() throws {
        let directions = try #require(URL.directions(to: "Lot 5 & Main St"))
        #expect(directions.absoluteString == "maps://?daddr=Lot%205%20%26%20Main%20St&dirflg=d")
    }

    @Test(arguments: ["", " \n \n"])
    func blankAddressHasNoDirections(address: String) {
        #expect(URL.directions(to: address) == nil)
    }
}
