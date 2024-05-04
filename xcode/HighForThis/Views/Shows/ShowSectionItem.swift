import SwiftUI
import HighForThisAPI

struct ShowSectionItem: View {
    var id: String
    var name: String
    var date: Double
    
    var body: some View {
        VStack {
            NavigationLink {
                ShowDetail(id: id)
            } label: {
                HStack {
                    VStack(alignment: .leading) {
                        Text(parseDate(date)).foregroundColor(.gray)
                        Text(name).foregroundColor(.accentColor)
                    }
                    
                    Spacer()
                }
            }
            Divider()
        }.padding(.horizontal)
    }
}
