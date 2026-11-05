import MapKit
import SwiftUI

struct VenueMap: View {
    let name: String
    let coordinate: CLLocationCoordinate2D

    var body: some View {
        Button(action: openInMaps) {
            Map(
                initialPosition: .region(
                    MKCoordinateRegion(center: coordinate, span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005))
                ),
                interactionModes: []
            ) {
                Marker(name, systemImage: "music.note.house.fill", coordinate: coordinate)
                    .tint(Color.accentColor)
            }
            .mapStyle(.standard(pointsOfInterest: .excludingAll))
            .frame(height: 240)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(.openInMaps)
        .accessibilityValue(name)
        .accessibilityIdentifier("venue-map")
    }

    private func openInMaps() {
        let item = MKMapItem(location: CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude), address: nil)
        item.name = name
        item.openInMaps()
    }
}
