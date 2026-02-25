// swift-tools-version:6.2

import PackageDescription

let package = Package(
  name: "HighForThisAPI",
  platforms: [
    .iOS(.v26),
    .macOS(.v26),
    .tvOS(.v26),
    .watchOS(.v26),
  ],
  products: [
    .library(name: "HighForThisAPI", targets: ["HighForThisAPI"]),
  ],
  dependencies: [
    .package(url: "https://github.com/apollographql/apollo-ios.git", from: "1.0.0"),
  ],
  targets: [
    .target(
      name: "HighForThisAPI",
      dependencies: [
        .product(name: "Apollo", package: "apollo-ios"),
        .product(name: "ApolloAPI", package: "apollo-ios"),
      ],
      path: "./Sources"
    ),
  ]
)
