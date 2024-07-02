import Foundation

enum ConfigurationError: Error {
    case missingKey(String)
}

var isPreview: Bool {
    return ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
}

class Configuration {
    private static var memoizedValues: [String: String] = [:]

    static func getEnvVar(_ key: String) throws -> String {
        if let memoizedValue = memoizedValues[key] {
            return memoizedValue
        }

        guard let setting = Bundle.main.infoDictionary?[key] as? String else {
            throw ConfigurationError.missingKey(key)
        }

        memoizedValues[key] = setting
        return setting
    }
}

func getEnvVar(_ envVar: String) -> String {
    do {
        let setting = try Configuration.getEnvVar(envVar)
        return setting
    } catch ConfigurationError.missingKey(let key) {
        print("You must set the following User-defined setting: \(key).")
    } catch {
        print("An unexpected error occurred: \(error).")
    }
    return ""
}
