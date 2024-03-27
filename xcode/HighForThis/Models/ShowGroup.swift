import SwiftUI

struct ShowGroup: Identifiable {
    var id = UUID()
    var date: Double
    var shows: [ShowListNode]
    
    func dateFormatted() -> String {
        return parseDate(date)
    }
}
