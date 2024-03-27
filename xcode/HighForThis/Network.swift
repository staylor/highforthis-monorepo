import Foundation
import Apollo

struct Network {
    static var shared = Network()
    
    private(set) lazy var apollo: ApolloClient = {
        let endpoint = ProcessInfo.processInfo.environment["GRAPHQL_ENDPOINT"]!
        let client = URLSessionClient()
        let cache = InMemoryNormalizedCache()
        let url = URL(string: endpoint)
        
        let store = ApolloStore(cache: cache)
        let provider = DefaultInterceptorProvider(client: client, store: store)
        let transport = RequestChainNetworkTransport(interceptorProvider: provider, endpointURL: url!)
        
        return ApolloClient(networkTransport: transport, store: store)
    }()
}
