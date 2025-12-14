import SwiftUI
import HighForThisAPI

struct ShowsSectionHeader: View {
    var label: LocalizedStringKey

    init(_ label: LocalizedStringKey) {
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
    NavigationStack {
        VStack(alignment: .leading) {
            ShowsSectionHeader("recommendedShows")
            ShowSectionItem(id: "foo", name: "Arcade Fire", date: 1519434000000)
            Spacer()
        }
    }
}
