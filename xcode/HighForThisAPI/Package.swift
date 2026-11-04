// swift-tools-version:6.1

import PackageDescription

let package = Package(
  name: "HighForThisAPI",
  platforms: [
    .iOS(.v15),
    .macOS(.v12),
    .tvOS(.v15),
    .watchOS(.v8),
    .visionOS(.v1),
  ],
  products: [
    .library(name: "HighForThisAPI", targets: ["HighForThisAPI"]),
    .library(name: "HighForThisAPITestMocks", targets: ["HighForThisAPITestMocks"]),
  ],
  dependencies: [
    .package(url: "https://github.com/apollographql/apollo-ios", exact: "2.5.0"),
  ],
  targets: [
    .target(
      name: "HighForThisAPI",
      dependencies: [
        .product(name: "ApolloAPI", package: "apollo-ios"),
      ],
      path: "./Sources"
    ),
    .target(
      name: "HighForThisAPITestMocks",
      dependencies: [
        .product(name: "ApolloTestSupport", package: "apollo-ios"),
        .target(name: "HighForThisAPI"),
      ],
      path: "./HighForThisAPITestMocks"
    ),
  ],
  swiftLanguageModes: [.v6, .v5]
)
