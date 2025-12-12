# HighForThis iOS App Architecture

A SwiftUI-based iOS app for a music-centric blog, featuring concert listings, podcasts, videos, and blog posts.

## Project Structure

```
xcode/
├── HighForThis/                      # Main iOS app target
│   ├── HighForThisApp.swift          # App entry point (@main)
│   ├── ApolloClient.swift            # GraphQL data fetching utilities
│   ├── Network.swift                 # Apollo network configuration
│   ├── Environment.swift             # Build configuration/environment variables
│   ├── Helpers.swift                 # Utility functions (date parsing)
│   │
│   ├── Models/
│   │   └── AudioPlayerViewModel.swift    # Audio playback state management
│   │
│   ├── Views/
│   │   ├── ContentView.swift         # Main TabView with 5 tabs
│   │   ├── AppWrapper.swift          # Navigation wrapper component
│   │   │
│   │   ├── Shows/                    # Concert/show listings
│   │   │   ├── ShowList.swift        # List view (recommended or attended)
│   │   │   ├── ShowListModel.swift   # ViewModel for show data
│   │   │   ├── ShowDetail.swift      # Single show detail view
│   │   │   ├── ShowSectionItem.swift # Show row component
│   │   │   └── ShowsSectionHeader.swift  # Date section header
│   │   │
│   │   ├── Podcasts/
│   │   │   ├── PodcastList.swift     # Podcast episode list
│   │   │   └── PodcastDetail.swift   # Episode detail with audio player
│   │   │
│   │   ├── Videos/
│   │   │   ├── VideoList.swift       # YouTube video list with pagination
│   │   │   └── VideoListModel.swift  # ViewModel with cursor-based pagination
│   │   │
│   │   ├── Posts/
│   │   │   ├── PostList.swift        # Blog post list
│   │   │   ├── Post.swift            # Post detail view
│   │   │   ├── ElementNode.swift     # Rich text element renderer
│   │   │   ├── HeadingNode.swift     # Heading renderer
│   │   │   ├── ImageNode.swift       # Image renderer
│   │   │   └── PostHelpers.swift     # Post rendering utilities
│   │   │
│   │   ├── Artist/
│   │   │   ├── ArtistMain.swift      # Artist profile view
│   │   │   ├── ArtistModel.swift     # ViewModel for artist data
│   │   │   ├── ArtistArtwork.swift   # Apple Music artwork component
│   │   │   ├── ArtistRecommendedShows.swift
│   │   │   └── ArtistAttendedShows.swift
│   │   │
│   │   ├── Venue/
│   │   │   ├── VenueMain.swift       # Venue profile view
│   │   │   ├── VenueModel.swift      # ViewModel for venue data
│   │   │   ├── VenueRecommendedShows.swift
│   │   │   └── VenueAttendedShows.swift
│   │   │
│   │   └── Shared Components/
│   │       ├── Loading.swift         # Loading spinner
│   │       ├── ImageLoading.swift    # Async image with caching
│   │       ├── TextBlock.swift       # Rich text container
│   │       ├── Paragraph.swift       # Paragraph renderer
│   │       ├── MapView.swift         # Venue location map
│   │       ├── Stripes.swift         # Decorative stripes pattern
│   │       ├── ExternalLink.swift    # External URL button
│   │       └── InternalLink.swift    # In-app navigation link
│   │
│   ├── graphql/
│   │   └── operations/               # GraphQL query definitions
│   │       ├── Shows.graphql         # Show list query
│   │       ├── Show.graphql          # Single show query
│   │       ├── Artist.graphql
│   │       ├── Venue.graphql
│   │       ├── Videos.graphql
│   │       ├── Podcasts.graphql
│   │       ├── Posts.graphql
│   │       └── ...fragments
│   │
│   └── Assets.xcassets               # App icons, colors, images
│
├── HighForThisAPI/                   # Swift Package for GraphQL types
│   ├── Package.swift                 # SPM configuration (Apollo 1.0.0+)
│   └── Sources/
│       ├── Operations/Queries/       # Generated query classes
│       ├── Fragments/                # Generated fragment types
│       └── Schema/                   # Generated schema types
│
└── HighForThis.xcodeproj             # Xcode project file
```

## Architecture Pattern

**MVVM (Model-View-ViewModel)**

- **Views**: SwiftUI views handle UI rendering and user interaction
- **ViewModels**: `ObservableObject` classes manage state and business logic
- **Models**: GraphQL-generated types serve as data models

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SwiftUI   │────▶│  ViewModel  │────▶│   getData() │────▶│   Apollo    │
│    View     │◀────│ @Published  │◀────│   callback  │◀────│   Client    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. View creates/owns ViewModel via `@StateObject`
2. View triggers data fetch on `.onAppear` or user action
3. ViewModel calls `getData()` with GraphQL query
4. Apollo fetches from network (or cache)
5. Callback updates `@Published` properties
6. SwiftUI re-renders view automatically

## Key Technologies

| Technology       | Purpose                               |
| ---------------- | ------------------------------------- |
| SwiftUI          | UI framework (pure SwiftUI, no UIKit) |
| Apollo iOS 1.0+  | GraphQL client with code generation   |
| AVFoundation     | Audio playback for podcasts           |
| CachedAsyncImage | Efficient image loading with caching  |

## GraphQL Integration

### Query Definitions

Queries are defined in `.graphql` files under `HighForThis/graphql/operations/`.

### Code Generation

Apollo generates Swift types into the `HighForThisAPI` package:

- Query classes (e.g., `ShowsQuery`, `ArtistQuery`)
- Fragment types for reusable data shapes
- Schema types for all GraphQL types

### Data Fetching Pattern

```swift
// ApolloClient.swift
func getData<Query: GraphQLQuery>(
    _ query: Query,
    cachePolicy: CachePolicy = .returnCacheDataElseFetch,
    completion: @escaping ((Query.Data) -> ())
)
```

## ViewModels

| ViewModel              | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `ShowListModel`        | Fetches and groups shows by date          |
| `VideoListModel`       | Manages video list with cursor pagination |
| `ArtistModel`          | Fetches artist profile data               |
| `VenueModel`           | Fetches venue profile data                |
| `AudioPlayerViewModel` | Manages audio playback state              |

## App Structure

### Tab Navigation

The app uses a `TabView` with 5 tabs:

1. **Shows** - Recommended upcoming concerts
2. **Podcast** - Audio episodes
3. **Videos** - YouTube videos
4. **Posts** - Blog posts
5. **Show History** - Attended concerts

### Navigation

- `NavigationView` wraps each tab
- `NavigationLink` for drill-down navigation
- Deep linking to Artist/Venue/Show details

## Platform Support

The app supports both iOS and macOS via conditional compilation:

```swift
#if os(iOS)
// iOS-specific code
#endif

#if os(macOS)
// macOS-specific code
#endif
```

## Configuration

Environment variables are loaded from build settings:

- `GRAPHQL_ENDPOINT` - API endpoint URL
- `STATIC_ASSETS_HOST` - CDN for images

## Caching Strategy

- **Network**: Apollo in-memory normalized cache
- **Policy**: Cache-first (`returnCacheDataElseFetch`)
- **Refresh**: Pull-to-refresh uses `fetchIgnoringCacheData`
- **Images**: `CachedAsyncImage` handles image caching

## Known Limitations / Future Improvements

- [ ] Error handling is minimal (console logging only)
- [ ] No offline support beyond cache
- [ ] No search functionality
- [ ] No user authentication
- [ ] Limited accessibility features

---

_Last updated: December 2024_
