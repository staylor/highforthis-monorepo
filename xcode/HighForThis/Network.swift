import Foundation
import Apollo

class Network {
    static let shared = Network()

    lazy var apollo: ApolloClient = {
        let endpoint = getEnvVar("GRAPHQL_ENDPOINT")
        let client = URLSessionClient()
        let cache = InMemoryNormalizedCache()

        guard let url = URL(string: endpoint) else {
            fatalError("Invalid GRAPHQL_ENDPOINT: \(endpoint)")
        }

        let store = ApolloStore(cache: cache)
        let provider = DefaultInterceptorProvider(client: client, store: store)
        let transport = RequestChainNetworkTransport(interceptorProvider: provider, endpointURL: url)

        return ApolloClient(networkTransport: transport, store: store)
    }()

    private init() {}
}
