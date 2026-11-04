# AGENTS.md

Guidance for coding agents working in `xcode/`. Read [`README.md`](README.md) for building and code generation, and [`ARCHITECTURE.md`](ARCHITECTURE.md) for how the code fits together.

## Commands

```bash
# Unit tests, on the Mac
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis -destination 'platform=macOS' -only-testing:HighForThisTests \
  CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM=

# Builds
xcodebuild build -project HighForThis.xcodeproj -scheme HighForThis -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO
xcodebuild build -project HighForThis.xcodeproj -scheme HighForThis -destination 'generic/platform=macOS' CODE_SIGNING_ALLOWED=NO

# Unit and UI tests on an iPhone simulator
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis -destination 'platform=iOS Simulator,name=iPhone 18 Pro' \
  CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM=

# Regenerate HighForThisAPI after changing graphql/, from the repository root
pnpm codegen:ios

# Formatting
swift format lint --recursive --strict HighForThis HighForThisTests HighForThisUITests
```

## Rules

- Keep iOS and macOS building without warnings: CI fails on any.
- Deploy to 26.0, and keep building with Xcode 26 as well as 27. An API that's new in 27 goes behind `if #available`, with a fallback for 26. Check layout changes on both; CI runs the UI tests on both.
- Xcode 26's Swift 6.2 makes extensions of the generated types, and the string catalog's symbols, main-actor isolated where 6.4 doesn't: mark extensions that pure code uses `nonisolated`.
- Screens fetch through `QueryView`, or an `@Observable` model that takes its loader as a closure, as `VideoFeed` does, so the tests can replace it.
- Put logic that doesn't need SwiftUI in `Models/`, `nonisolated` when it's pure, and test it with Swift Testing, building fixtures from `HighForThisAPITestMocks`.
- Swift 6 with main-actor default isolation: callbacks from system frameworks that may arrive on other threads are `@Sendable` and hop to the main actor. Use `@Observable`, `os.Logger` and async APIs, not `ObservableObject`, `print` or completion handlers.
- Add strings to `Localizable.xcstrings` under a symbolic key, and use the generated symbol.
- Don't edit `HighForThisAPI` by hand, apart from `SchemaConfiguration.swift`. Change the operations in `graphql/` and run `pnpm codegen:ios`; `pnpm lint` checks them against the schema.
- Give new list rows an accessibility identifier, and add a UI test for new navigation.
