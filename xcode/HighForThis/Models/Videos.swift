import Foundation
import HighForThisAPI

nonisolated extension Video_video {
    /// Opens in the YouTube app when it's installed, and in the browser when it isn't.
    var youTubeURL: URL {
        URL(string: "https://www.youtube.com/watch")!.appending(queryItems: [URLQueryItem(name: "v", value: dataId)])
    }
}
