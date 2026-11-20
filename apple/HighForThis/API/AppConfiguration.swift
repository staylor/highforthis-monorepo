import Foundation

/// The servers the app talks to, from the `GRAPHQL_ENDPOINT` and `UPLOADS_URL` build settings by way of Info.plist.
nonisolated enum AppConfiguration {
    static let graphQLEndpoint = url(forInfoDictionaryKey: "GraphQLEndpoint")
    static let uploadsURL = url(forInfoDictionaryKey: "UploadsURL")

    /// Where the CMS stores an upload, as the web app's `uploadUrl` builds it.
    static func uploadURL(destination: String, fileName: String) -> URL {
        #if DEBUG
        if UITestFixtures.isEnabled, destination == "ui-test" { return UITestFixtures.mediaURL(fileName) }
        #endif
        return uploadsURL.appending(path: destination).appending(path: fileName)
    }

    private static func url(forInfoDictionaryKey key: String) -> URL {
        guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String, let url = URL.webURL(value) else {
            preconditionFailure("Info.plist has no URL for \(key)")
        }
        return url
    }
}
