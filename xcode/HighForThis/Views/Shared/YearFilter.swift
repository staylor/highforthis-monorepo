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
            #if os(tvOS)
            LabeledContent {
                Text(selectionTitle)
            } label: {
                Label(.filterByYear, systemImage: "line.3.horizontal.decrease")
            }
            #else
            HStack(spacing: 6) {
                if let selection { Text(verbatim: String(selection)).monospacedDigit() }
                Image(systemName: selection == nil ? "line.3.horizontal.decrease" : "line.3.horizontal.decrease.circle.fill")
            }
            #endif
        }
        .accessibilityLabel(.filterByYear)
        .accessibilityValue(selectionTitle)
        .accessibilityIdentifier("year-filter")
    }

    private var selectionTitle: String {
        selection.map(String.init) ?? String(localized: .allYears)
    }
}
