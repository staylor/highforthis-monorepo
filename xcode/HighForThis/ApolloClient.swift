import Foundation
import Apollo
import HighForThisAPI

let cachePolicy: CachePolicy = .returnCacheDataElseFetch

typealias ArtistData = HighForThisAPI.ArtistQuery.Data
typealias PostData = HighForThisAPI.PostQuery.Data.Post
typealias VenueData = HighForThisAPI.VenueQuery.Data

func getData<Query: GraphQLQuery>(_ query: Query, cachePolicy: CachePolicy = cachePolicy, completion: @escaping ((Query.Data) -> ())) {
    print("\(Query.operationName) is being fetched.")
    Network.shared.apollo.fetch(query: query, cachePolicy: cachePolicy) { result in
        switch result {
        case .success(let graphQLResult):
            completion(graphQLResult.data!);
        case .failure(let error):
            print("Query failed: \(error)")
        }
    }
}
