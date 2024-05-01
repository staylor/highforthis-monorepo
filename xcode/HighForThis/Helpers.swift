import Foundation
import CoreLocation
import SwiftUI

func L10N(_ key: String.LocalizationValue) -> String {
    return String(localized: key, table: "Localizable")
}

var isPreview: Bool {
    return ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
}

var graphqlEndpoint: String {
    return "https://graphql.highforthis.com/graphql"
    // return ProcessInfo.processInfo.environment["GRAPHQL_ENDPOINT"]
}

var staticAssetsHost: String {
    return "https://static.highforthis.com"
    // return ProcessInfo.processInfo.environment["STATIC_ASSETS_HOST"]!
}

var screenWidth: CGFloat {
    #if os(iOS)
    return UIScreen.main.bounds.size.width.rounded(.up)
    #elseif os(macOS)
    return NSScreen.main!.visibleFrame.size.width.rounded(.up)
    #endif
}

func parseDate(_ unixTime: Double, format: String = "MM/dd/yyyy") -> String {
    let date = Date(timeIntervalSince1970: TimeInterval(unixTime / 1000))
    let writer = DateFormatter()
    writer.dateFormat = format
    
    return writer.string(from: date)
}

func cdnUrl(_ path: String) -> String {
    return "\(staticAssetsHost)/\(path)"
}
