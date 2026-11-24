#if os(iOS) && canImport(CarPlay)
import UIKit

/// Pictures for CarPlay's list rows. CarPlay asks for images ready to show, at its list rows' image size and the car
/// screen's scale, so these are drawn as circles, as the app's show rows have them.
nonisolated enum CarPlayArtwork {
    /// The image at `url`, cropped to fill a circle `size` points across. Nil if it couldn't be fetched or decoded.
    @concurrent static func circle(from url: URL, size: CGSize, scale: CGFloat) async -> UIImage? {
        guard let (data, _) = try? await URLSession.shared.data(from: url), let image = UIImage(data: data),
            image.size.width > 0, image.size.height > 0
        else { return nil }
        return circle(size: size, scale: scale) { bounds in
            let fill = max(bounds.width / image.size.width, bounds.height / image.size.height)
            let drawn = CGSize(width: image.size.width * fill, height: image.size.height * fill)
            image.draw(in: CGRect(origin: CGPoint(x: bounds.midX - drawn.width / 2, y: bounds.midY - drawn.height / 2), size: drawn))
        }
    }

    /// A microphone in a grey circle, as the app's show rows have for an artist without artwork, in the car screen's
    /// light and dark styles. Trait collections are built on the main actor.
    @MainActor static func placeholder(size: CGSize, traits: UITraitCollection) -> UIImage {
        let asset = UIImageAsset()
        for style in [UIUserInterfaceStyle.light, .dark] {
            // Without the scale, the asset gives the image back at 1x, twice or three times too big.
            let styleTraits = UITraitCollection { styleTraits in
                styleTraits.userInterfaceStyle = style
                styleTraits.displayScale = traits.displayScale
            }
            let fill = UIColor.systemFill.resolvedColor(with: styleTraits)
            let symbol = UIImage(systemName: "music.mic", withConfiguration: UIImage.SymbolConfiguration(pointSize: size.height * 0.4))?
                .withTintColor(UIColor.secondaryLabel.resolvedColor(with: styleTraits), renderingMode: .alwaysOriginal)
            let image = circle(size: size, scale: traits.displayScale) { bounds in
                fill.setFill()
                UIRectFill(bounds)
                if let symbol {
                    symbol.draw(at: CGPoint(x: bounds.midX - symbol.size.width / 2, y: bounds.midY - symbol.size.height / 2))
                }
            }
            asset.register(image, with: styleTraits)
        }
        return asset.image(with: traits)
    }

    private static func circle(size: CGSize, scale: CGFloat, draw: (CGRect) -> Void) -> UIImage {
        let format = UIGraphicsImageRendererFormat()
        format.scale = scale
        format.opaque = false
        return UIGraphicsImageRenderer(size: size, format: format).image { _ in
            let bounds = CGRect(origin: .zero, size: size)
            UIBezierPath(ovalIn: bounds).addClip()
            draw(bounds)
        }
    }
}
#endif
