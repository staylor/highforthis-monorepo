// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public class ShowsQuery: GraphQLQuery {
  public static let operationName: String = "Shows"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query Shows($attended: Boolean, $first: Int!, $latest: Boolean, $year: Int) { shows(attended: $attended, first: $first, latest: $latest, year: $year) { __typename edges { __typename node { __typename ...ShowList_show } } years } }"#,
      fragments: [ShowList_show.self]
    ))

  public var attended: GraphQLNullable<Bool>
  public var first: Int
  public var latest: GraphQLNullable<Bool>
  public var year: GraphQLNullable<Int>

  public init(
    attended: GraphQLNullable<Bool>,
    first: Int,
    latest: GraphQLNullable<Bool>,
    year: GraphQLNullable<Int>
  ) {
    self.attended = attended
    self.first = first
    self.latest = latest
    self.year = year
  }

  public var __variables: Variables? { [
    "attended": attended,
    "first": first,
    "latest": latest,
    "year": year
  ] }

  public struct Data: HighForThisAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("shows", Shows?.self, arguments: [
        "attended": .variable("attended"),
        "first": .variable("first"),
        "latest": .variable("latest"),
        "year": .variable("year")
      ]),
    ] }

    public var shows: Shows? { __data["shows"] }

    /// Shows
    ///
    /// Parent Type: `ShowConnection`
    public struct Shows: HighForThisAPI.SelectionSet {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ShowConnection }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("edges", [Edge].self),
        .field("years", [Int]?.self),
      ] }

      public var edges: [Edge] { __data["edges"] }
      public var years: [Int]? { __data["years"] }

      /// Shows.Edge
      ///
      /// Parent Type: `ShowEdge`
      public struct Edge: HighForThisAPI.SelectionSet {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.ShowEdge }
        public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("node", Node.self),
        ] }

        public var node: Node { __data["node"] }

        /// Shows.Edge.Node
        ///
        /// Parent Type: `Show`
        public struct Node: HighForThisAPI.SelectionSet {
          public let __data: DataDict
          public init(_dataDict: DataDict) { __data = _dataDict }

          public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.Show }
          public static var __selections: [ApolloAPI.Selection] { [
            .field("__typename", String.self),
            .fragment(ShowList_show.self),
          ] }

          public var artists: [Artist] { __data["artists"] }
          public var date: Double { __data["date"] }
          public var id: HighForThisAPI.ObjID { __data["id"] }
          public var title: String? { __data["title"] }
          public var venue: Venue { __data["venue"] }

          public struct Fragments: FragmentContainer {
            public let __data: DataDict
            public init(_dataDict: DataDict) { __data = _dataDict }

            public var showList_show: ShowList_show { _toFragment() }
          }

          public typealias Artist = ShowList_show.Artist

          public typealias Venue = ShowList_show.Venue
        }
      }
    }
  }
}
