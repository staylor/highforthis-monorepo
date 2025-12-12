import Foundation
import CoreLocation
import SwiftUI

var screenWidth: CGFloat {
    #if os(iOS)
    return UIScreen.main.bounds.size.width.rounded(.up)
    #elseif os(macOS)
    return (NSScreen.main?.visibleFrame.size.width ?? 640).rounded(.up)
    #endif
}

func parseDate(_ unixTime: Double, format: String = "MM/dd/yyyy") -> String {
    let date = Date(timeIntervalSince1970: TimeInterval(unixTime / 1000))
    let writer = DateFormatter()
    writer.dateFormat = format
    
    return writer.string(from: date)
}

func cdnUrl(_ path: String) -> String {
    let staticAssetsHost = getEnvVar("STATIC_ASSETS_HOST")
    return "\(staticAssetsHost)/\(path)"
}
