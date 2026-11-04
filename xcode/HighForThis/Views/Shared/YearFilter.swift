import SwiftUI

struct YearFilter: View {
    let years: [Int]
    @Binding var selection: Int?

    var body: some View {
        Menu {
            Picker(.filterByYear, selection: $selection) {
                Text(.allYears).tag(Int?.none)
                ForEach(years, id: \.self) { year in
                    Text(verbatim: String(year)).tag(Int?.some(year))
                }
            }
        } label: {
            Label(.filterByYear, systemImage: "line.3.horizontal.decrease")
        }
        .accessibilityIdentifier("year-filter")
    }
}
