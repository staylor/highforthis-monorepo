import MapKit
import SwiftUI

struct VenueMap: View {
    let name: String
    let coordinate: CLLocationCoordinate2D

    var body: some View {
        #if os(tvOS)
        // There's no Maps app on tvOS to open.
        map
        #else
        Button(action: openInMaps) { map }
            .buttonStyle(.plain)
            .accessibilityLabel(.openInMaps)
            .accessibilityValue(name)
            .accessibilityIdentifier("venue-map")
        #endif
    }

    private var map: some View {
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

    #if !os(tvOS)
    private func openInMaps() {
        let item = MKMapItem(location: CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude), address: nil)
        item.name = name
        item.openInMaps()
    }
    #endif
}
