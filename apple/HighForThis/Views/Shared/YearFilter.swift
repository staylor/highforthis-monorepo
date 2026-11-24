import SwiftUI

struct YearFilter: View {
    let years: [Int]
    @Binding var selection: Int?
    /// Without All Years, a year is always chosen, and the filter isn't drawn as one that narrows the list.
    var includesAllYears = true

    private var availableYears: [Int] {
        var values = Set(years)
        if let selection { values.insert(selection) }
        return values.sorted(by: >)
    }

    var body: some View {
        Menu {
            Picker(.filterByYear, selection: $selection) {
                if includesAllYears {
                    Text(.allYears).tag(Int?.none)
                }
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
                Image(
                    systemName: selection == nil || !includesAllYears
                        ? "line.3.horizontal.decrease" : "line.3.horizontal.decrease.circle.fill")
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
