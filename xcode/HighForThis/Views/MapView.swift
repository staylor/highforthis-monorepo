import SwiftUI
import MapKit

struct MapView: View {
    var name: String
    var latitude: Double
    var longitude: Double

    var body: some View {
        let coords = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        let region = MKCoordinateRegion(
            center: coords,
            span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005)
        )
        Map(initialPosition: .region(region)) {
            Marker(name, systemImage: "music.note.house.fill", coordinate: coords).tint(Color.pink)
        }
        .frame(height: 300)
        .mapStyle(.standard(elevation: .automatic))
        .mapControlVisibility(.visible)
        .onTapGesture {
            let location = name.addingPercentEncoding(withAllowedCharacters: .alphanumerics)
            let mapsUrl = "maps://?q=\(location!)&center=\(latitude),\(longitude)&z=18"
            let url = URL(string: mapsUrl)
            UIApplication.shared.open(url!)
        }
    }
}

#Preview {
    VStack(alignment: .leading) {
        MapView(name: "Brooklyn Steel", latitude:  40.7193319, longitude: -73.9387361)
        Spacer()
    }.ignoresSafeArea()
}
