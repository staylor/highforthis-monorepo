import Foundation
import Apollo
import HighForThisAPI

let cachePolicy: CachePolicy = .returnCacheDataElseFetch

typealias ArtistData = HighForThisAPI.ArtistQuery.Data
typealias PostData = HighForThisAPI.PostQuery.Data.Post
typealias VenueData = HighForThisAPI.VenueQuery.Data

func fetchData<Query: GraphQLQuery>(_ query: Query, cachePolicy: CachePolicy = cachePolicy) async -> Query.Data? {
    #if DEBUG
    print("\(Query.operationName) is being fetched.")
    #endif

    return await withCheckedContinuation { continuation in
        Network.shared.apollo.fetch(query: query, cachePolicy: cachePolicy) { result in
            switch result {
            case .success(let graphQLResult):
                #if DEBUG
                if let errors = graphQLResult.errors {
                    print("GraphQL errors: \(errors)")
                }
                #endif
                continuation.resume(returning: graphQLResult.data)
            case .failure(let error):
                #if DEBUG
                print("Query failed: \(error)")
                #endif
                continuation.resume(returning: nil)
            }
        }
    }
}
