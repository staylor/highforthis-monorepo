import SwiftUI
import HighForThisAPI

struct ShowsSectionHeader: View {
    var label: String
    
    init(_ label: String) {
        self.label = label
    }
    
    var body: some View {
        Text(label)
            .font(.headline)
            .bold()
            .padding(.horizontal)
            .padding(.top, 20)
            .padding(.bottom, 8)
    }
}

#Preview {
    AppWrapper {
        VStack(alignment: .leading) {
            ShowsSectionHeader(L10N("recommendedShows"))
            ShowSectionItem(id: "foo", name: "Arcade Fire", date: 1519434000000)
            Spacer()
        }
    }
}
