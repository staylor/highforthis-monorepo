import SwiftUI

struct YearPicker: View {
    var years: [Int]
    @Binding var selection: Int
    var onChange: () async -> Void

    var body: some View {
        Menu {
            Picker("filterByYear", selection: $selection) {
                Text("allYears").tag(0)
                ForEach(years, id: \.self) {
                    Text(String($0)).tag($0)
                }
            }
        } label: {
            Label(
                selection == 0 ? "allYears" : String(selection),
                systemImage: "calendar"
            )
        }
        .onChange(of: selection) {
            Task { await onChange() }
        }
    }
}
