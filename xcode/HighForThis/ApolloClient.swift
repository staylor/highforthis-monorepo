import Foundation
import Apollo
import HighForThisAPI

let cachePolicy: CachePolicy = .returnCacheDataElseFetch

typealias ArtistData = HighForThisAPI.ArtistQuery.Data
typealias PostData = HighForThisAPI.PostQuery.Data.Post
typealias VenueData = HighForThisAPI.VenueQuery.Data

func getData<Query: GraphQLQuery>(_ query: Query, cachePolicy: CachePolicy = cachePolicy, completion: @escaping ((Query.Data) -> Void)) {
    #if DEBUG
    print("\(Query.operationName) is being fetched.")
    #endif
    Network.shared.apollo.fetch(query: query, cachePolicy: cachePolicy) { result in
        switch result {
        case .success(let graphQLResult):
            guard let data = graphQLResult.data else {
                #if DEBUG
                print("Query returned no data: \(Query.operationName)")
                #endif
                return
            }
            completion(data)
        case .failure(let error):
            #if DEBUG
            print("Query failed: \(error)")
            #endif
        }
    }
}
