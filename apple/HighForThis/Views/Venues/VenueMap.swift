import MapKit
import SwiftUI

struct VenueMap: View {
    let name: String
    let coordinate: CLLocationCoordinate2D
    /// How tall the map is, or nil for one that fills the frame it's given.
    var height: CGFloat? = 240

    var body: some View {
        #if os(watchOS)
        Button(.openInMaps, systemImage: "map", action: openInMaps)
            .accessibilityValue(name)
            .accessibilityIdentifier("venue-map")
        #elseif os(tvOS)
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

    #if !os(watchOS)
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
        .frame(height: height)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }

    #endif

    #if !os(tvOS)
    private func openInMaps() {
        let item = MKMapItem(location: CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude), address: nil)
        item.name = name
        item.openInMaps()
    }
    #endif
}
