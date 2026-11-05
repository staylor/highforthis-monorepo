import SwiftUI

struct YearFilter: View {
    let years: [Int]
    @Binding var selection: Int?

    private var availableYears: [Int] {
        var values = Set(years)
        if let selection { values.insert(selection) }
        return values.sorted(by: >)
    }

    var body: some View {
        Menu {
            Picker(.filterByYear, selection: $selection) {
                Text(.allYears).tag(Int?.none)
                ForEach(availableYears, id: \.self) { year in
                    Text(verbatim: String(year)).tag(Int?.some(year))
                }
            }
        } label: {
            HStack(spacing: 6) {
                if let selection { Text(verbatim: String(selection)).monospacedDigit() }
                Image(systemName: selection == nil ? "line.3.horizontal.decrease" : "line.3.horizontal.decrease.circle.fill")
            }
        }
        .accessibilityLabel(.filterByYear)
        .accessibilityValue(selection.map(String.init) ?? String(localized: .allYears))
        .accessibilityIdentifier("year-filter")
    }
}
