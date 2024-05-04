import SwiftUI
import HighForThisAPI

struct ShowsSectionHeader: View {
    var label: String
    
    init(_ label: String) {
        self.label = label
    }
    
    var body: some View {
        Text(label)
            .font(.title3)
            .bold()
            .padding()
    }
}
