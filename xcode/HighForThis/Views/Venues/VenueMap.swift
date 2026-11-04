import MapKit
import SwiftUI

/// Where a venue is. Tapping the map opens the venue in Maps.
struct VenueMap: View {
    let name: String
    let coordinate: CLLocationCoordinate2D

    var body: some View {
        Map(
            initialPosition: .region(
                MKCoordinateRegion(center: coordinate, span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005))
            ),
            interactionModes: []
        ) {
            Marker(name, systemImage: "music.note.house.fill", coordinate: coordinate)
                .tint(Color.accentColor)
        }
        .frame(height: 260)
        .onTapGesture(perform: openInMaps)
        .accessibilityElement()
        .accessibilityLabel(.openInMaps)
        .accessibilityAddTraits(.isButton)
        .accessibilityAction {
            openInMaps()
        }
    }

    private func openInMaps() {
        let item = MKMapItem(location: CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude), address: nil)
        item.name = name
        item.openInMaps()
    }
}

#Preview {
    VenueMap(name: "Brooklyn Steel", coordinate: CLLocationCoordinate2D(latitude: 40.7193319, longitude: -73.9387361))
}
