import SwiftUI

struct Paragraph: View {
    var content: String
    
    init(_ content: String) {
        self.content = content
    }
    
    var body: some View {
        Text(content)
            .padding(.bottom)
            .fixedSize(horizontal: false, vertical: true)
    }
}
