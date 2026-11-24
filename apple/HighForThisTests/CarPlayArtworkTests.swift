#if os(iOS) && canImport(CarPlay)
import Foundation
import Testing
import UIKit

@testable import HighForThis

struct CarPlayArtworkTests {
    private static let size = CGSize(width: 40, height: 40)

    @Test func artworkFillsACircleAtTheCarScreensScale() async throws {
        // A wide red picture, fetched from a file as it would be from Apple Music
        let file = FileManager.default.temporaryDirectory.appending(path: "carplay-artwork-\(UUID().uuidString).png")
        let picture = UIGraphicsImageRenderer(size: CGSize(width: 90, height: 60)).image { context in
            UIColor.red.setFill()
            context.fill(CGRect(x: 0, y: 0, width: 90, height: 60))
        }
        try #require(picture.pngData()).write(to: file)
        defer { try? FileManager.default.removeItem(at: file) }

        let image = try #require(await CarPlayArtwork.circle(from: file, size: Self.size, scale: 3))

        #expect(image.size == Self.size)
        #expect(image.scale == 3)
        // The corners are cut away, and the picture is cropped to fill the circle from top to bottom.
        #expect(alpha(of: image, x: 0, y: 0) == 0)
        #expect(alpha(of: image, x: 60, y: 60) == 255)
        #expect(alpha(of: image, x: 60, y: 3) == 255)
    }

    @Test func thereIsNoArtworkWithoutAnImage() async {
        let missing = FileManager.default.temporaryDirectory.appending(path: "missing-\(UUID().uuidString).png")

        #expect(await CarPlayArtwork.circle(from: missing, size: Self.size, scale: 2) == nil)
    }

    @Test func placeholderHasTheCarScreensScaleInLightAndDark() throws {
        let traits = UITraitCollection { traits in
            traits.displayScale = 2
            traits.userInterfaceStyle = .dark
        }

        let placeholder = CarPlayArtwork.placeholder(size: Self.size, traits: traits)

        #expect(placeholder.size == Self.size)
        #expect(placeholder.scale == 2)
        let asset = try #require(placeholder.imageAsset)
        let light = asset.image(with: UITraitCollection(userInterfaceStyle: .light))
        let dark = asset.image(with: UITraitCollection(userInterfaceStyle: .dark))
        // The circle above the microphone is fainter in light, as the system's fills are.
        #expect(alpha(of: light, x: 40, y: 6) < alpha(of: dark, x: 40, y: 6))
        #expect(alpha(of: dark, x: 0, y: 0) == 0)
    }

    /// The alpha of the pixel at `x`, `y`, counting from the top left.
    private func alpha(of image: UIImage, x: Int, y: Int) -> UInt8 {
        guard let cgImage = image.cgImage else { return 0 }
        var pixel: [UInt8] = [0, 0, 0, 0]
        pixel.withUnsafeMutableBytes { buffer in
            let context = CGContext(
                data: buffer.baseAddress, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4,
                space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
            // Core Graphics counts from the bottom left.
            context?.draw(cgImage, in: CGRect(x: -x, y: y + 1 - cgImage.height, width: cgImage.width, height: cgImage.height))
        }
        return pixel[3]
    }
}
#endif
