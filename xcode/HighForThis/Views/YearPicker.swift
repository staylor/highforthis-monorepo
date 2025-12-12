import SwiftUI

struct YearPicker: View {
    var years: [Int]
    @Binding var selection: Int
    var onChange: () async -> Void

    var body: some View {
        Menu {
            Picker(L10N("filterByYear"), selection: $selection) {
                Text(L10N("allYears")).tag(0)
                ForEach(years, id: \.self) {
                    Text(String($0)).tag($0)
                }
            }
        } label: {
            Label(
                selection == 0 ? L10N("allYears") : String(selection),
                systemImage: "calendar"
            )
        }
        .onChange(of: selection) {
            Task { await onChange() }
        }
    }
}
