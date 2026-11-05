#if DEBUG
import Apollo
import Foundation
import Synchronization

nonisolated enum UITestFixtures {
    static let isEnabled =
        ProcessInfo.processInfo.arguments.contains("-ui-testing")
        || ProcessInfo.processInfo.environment["HIGHFORTHIS_TESTING"] == "1"

    static func client(scenario: String = ProcessInfo.processInfo.environment["UI_TEST_SCENARIO"] ?? "normal") -> ApolloClient {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [FixtureURLProtocol.self]
        let store = ApolloStore(cache: InMemoryNormalizedCache())
        let transport = RequestChainNetworkTransport(
            urlSession: URLSession(configuration: configuration),
            interceptorProvider: DefaultInterceptorProvider.shared,
            store: store,
            endpointURL: URL(string: "https://fixtures.highforthis.test/graphql")!,
            additionalHeaders: ["X-Fixture-Scenario": scenario, "X-Fixture-Run": UUID().uuidString]
        )
        return ApolloClient(networkTransport: transport, store: store)
    }

    static let audioURL: URL = {
        let url = FileManager.default.temporaryDirectory.appending(path: "highforthis-test-audio.wav")
        let sampleCount: UInt32 = 8_000 * 120
        let byteCount = sampleCount * 2
        var data = Data("RIFF".utf8)
        func append<T: FixedWidthInteger>(_ value: T) {
            var value = value.littleEndian
            withUnsafeBytes(of: &value) { data.append(contentsOf: $0) }
        }
        append(byteCount + 36)
        data.append(Data("WAVEfmt ".utf8))
        append(UInt32(16))
        append(UInt16(1))
        append(UInt16(1))
        append(UInt32(8_000))
        append(UInt32(16_000))
        append(UInt16(2))
        append(UInt16(16))
        data.append(Data("data".utf8))
        append(byteCount)
        data.append(Data(count: Int(byteCount)))
        try! data.write(to: url, options: .atomic)
        return url
    }()

    static func mediaURL(_ fileName: String) -> URL {
        fileName == "fixture.wav" ? audioURL : FileManager.default.temporaryDirectory.appending(path: "missing-highforthis-fixture.wav")
    }
}

private nonisolated final class FixtureURLProtocol: URLProtocol, @unchecked Sendable {
    private static let requests = Mutex<[String: Int]>([:])
    private static let null = NSNull()

    override class func canInit(with request: URLRequest) -> Bool { request.url?.host == "fixtures.highforthis.test" }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        do {
            let body: Data
            if let data = request.httpBody {
                body = data
            } else if let stream = request.httpBodyStream {
                stream.open()
                defer { stream.close() }
                var data = Data()
                var buffer = [UInt8](repeating: 0, count: 4096)
                while stream.hasBytesAvailable {
                    let count = stream.read(&buffer, maxLength: buffer.count)
                    guard count >= 0 else { throw URLError(.cannotDecodeRawData) }
                    if count == 0 { break }
                    data.append(contentsOf: buffer.prefix(count))
                }
                body = data
            } else {
                throw URLError(.badServerResponse)
            }
            let json = try JSONSerialization.jsonObject(with: body) as? [String: Any] ?? [:]
            let operation = json["operationName"] as? String ?? ""
            let variables = json["variables"] as? [String: Any] ?? [:]
            let scenario = request.value(forHTTPHeaderField: "X-Fixture-Scenario") ?? "normal"
            let key = (request.value(forHTTPHeaderField: "X-Fixture-Run") ?? "") + operation
            let attempt = Self.requests.withLock { requests in
                requests[key, default: 0] += 1
                return requests[key, default: 0]
            }
            let response: [String: Any]
            if (scenario == "failOnce" && attempt == 1 && operation == "Shows") || scenario == "graphqlError" {
                response = ["data": ["__typename": "Query", "shows": Self.null], "errors": [["message": "Temporary fixture failure"]]]
            } else {
                response = ["data": try Self.data(operation: operation, variables: variables, scenario: scenario)]
            }
            let data = try JSONSerialization.data(withJSONObject: response)
            let http = HTTPURLResponse(
                url: request.url!, statusCode: 200, httpVersion: nil, headerFields: ["Content-Type": "application/json"])!
            client?.urlProtocol(self, didReceive: http, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}

    private static var artist: [String: Any] {
        [
            "__typename": "Artist", "id": "artist", "name": "Sample Artist", "slug": "sample-artist",
            "website": "https://example.com/artist", "appleMusic": null,
        ]
    }
    private static var venue: [String: Any] {
        [
            "__typename": "Venue", "id": "venue", "name": "Sample Hall", "slug": "sample-hall",
            "address": "123 Music Street", "capacity": "1,000", "website": "https://example.com/venue",
            "coordinates": ["__typename": "VenueCoordinates", "latitude": 40.719, "longitude": -73.938],
        ]
    }

    private static func show(_ index: Int, year: Int = 2025) -> [String: Any] {
        [
            "__typename": "Show", "id": "show-\(year)-\(index)", "title": "Evening Set \(index + 1)",
            "date": year == 2019 ? 1_573_049_600_000.0 : 1_762_300_800_000.0,
            "artists": [artist], "venue": venue,
        ]
    }

    private static func connection(_ type: String, items: [[String: Any]], after: String? = nil, years: [Int] = []) -> [String: Any] {
        let offset = after.flatMap(Int.init) ?? 0
        let page = Array(items.dropFirst(offset).prefix(2))
        return [
            "__typename": "\(type)Connection", "count": items.count, "years": years,
            "edges": page.map { ["__typename": "\(type)Edge", "node": $0] },
            "pageInfo": [
                "__typename": "PageInfo", "endCursor": page.isEmpty ? null : String(offset + page.count) as Any,
                "hasNextPage": offset + page.count < items.count,
            ],
        ]
    }

    private static func data(operation: String, variables: [String: Any], scenario: String) throws -> [String: Any] {
        let after = variables["after"] as? String
        let year = variables["year"] as? Int ?? 2025
        let emptyYear = scenario == "emptyYearMetadata" && variables["year"] is Int
        let shows = scenario == "empty" || year == 2027 || emptyYear ? [] : (0..<5).map { show($0, year: year) }
        let showConnection = connection("Show", items: shows, after: after, years: emptyYear ? [] : [2027, 2025, 2019])
        var result: [String: Any] = ["__typename": "Query"]
        switch operation {
        case "Shows": result["shows"] = showConnection
        case "Show": result["show"] = variables["id"] as? String == "missing" ? null : show(0)
        case "Artist":
            result.merge(["artist": artist, "shows": showConnection, "attended": showConnection]) { _, new in new }
        case "Venue":
            result.merge(["venue": venue, "shows": showConnection, "attended": showConnection]) { _, new in new }
        case "Videos":
            let videos = (0..<5).map { index in
                [
                    "__typename": "Video", "id": "video-\(index)", "dataId": "video\(index)", "slug": "video-\(index)",
                    "title": "Sample Artist — A Long Song Title, Live at Sample Hall", "thumbnails": [],
                ] as [String: Any]
            }
            result["videos"] = connection("Video", items: scenario == "empty" ? [] : videos, after: after, years: [2025, 2019])
        case "Podcasts":
            result["podcasts"] = connection("Podcast", items: scenario == "empty" ? [] : (0..<4).map { podcast($0) }, after: after)
        case "Podcast":
            let index = Int((variables["id"] as? String ?? "").replacingOccurrences(of: "podcast-", with: "")) ?? 0
            result["podcast"] = podcast(index, brokenAudio: scenario == "brokenAudio")
        case "Posts":
            result["posts"] = connection("Post", items: scenario == "empty" ? [] : (0..<4).map(post), after: after)
        case "Post": result["post"] = post(0)
        default: throw URLError(.badServerResponse)
        }
        return result
    }

    private static func podcast(_ index: Int, brokenAudio: Bool = false) -> [String: Any] {
        [
            "__typename": "Podcast", "id": "podcast-\(index)", "date": 1_762_300_800_000.0,
            "title": "Listening Notes \(index + 1)", "description": "A conversation about music, recordings, and live shows.",
            "audio": index == 1
                ? null
                : [
                    "__typename": "AudioUpload", "id": "audio-\(index)", "duration": 120,
                    "destination": "ui-test", "fileName": brokenAudio ? "missing.wav" : "fixture.wav",
                ],
        ]
    }

    private static func element(_ typename: String, type: String, fields: [String: Any]) -> [String: Any] {
        ["__typename": typename, "type": type, "version": 1, "direction": null, "format": 0, "indent": 0]
            .merging(fields) { _, new in new }
    }

    private static func post(_ index: Int) -> [String: Any] {
        let text: (String) -> [String: Any] = {
            [
                "__typename": "TextNode", "text": $0, "format": 0, "detail": 0, "mode": "normal", "style": "", "textFormat": 0,
                "textStyle": "", "type": "text",
            ]
        }
        return [
            "__typename": "Post", "id": "post-\(index)", "slug": "post-\(index)", "title": "Records Worth Hearing \(index + 1)",
            "summary": "Notes from the listening room.", "featuredMedia": [],
            "editorState": [
                "__typename": "EditorState",
                "root": element(
                    "ElementNode", type: "root",
                    fields: [
                        "children": [
                            element("HeadingNode", type: "heading", fields: ["tag": "h2", "children": [text("A second listen")]]),
                            element(
                                "ElementNode", type: "paragraph",
                                fields: ["children": [text(String(repeating: "A record rewards a second listen. ", count: 12))]]),
                            element("HeadingNode", type: "heading", fields: ["tag": "h3", "children": [text("The live recording")]]),
                            element("QuoteNode", type: "quote", fields: ["children": [text("Music brings people together.")]]),
                            element("CodeNode", type: "code", fields: ["children": [text("side A\nside B")]]),
                        ]
                    ]),
            ],
        ]
    }
}
#endif
