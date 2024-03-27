import Foundation
import Apollo
import HighForThisAPI

let cachePolicy: CachePolicy = .returnCacheDataElseFetch

typealias ArtistData = HighForThisAPI.ArtistQuery.Data
typealias ArtistShowNode = ArtistData.Shows.Edge.Node
typealias PodcastListNode = HighForThisAPI.PodcastsQuery.Data.Podcasts.Edge.Node
typealias PodcastData = HighForThisAPI.PodcastQuery.Data.Podcast
typealias PostData = HighForThisAPI.PostQuery.Data.Post
typealias PostListNode = HighForThisAPI.PostsQuery.Data.Posts.Edge.Node
typealias ShowListNode = HighForThisAPI.ShowsQuery.Data.Shows.Edge.Node
typealias ShowData = HighForThisAPI.ShowQuery.Data.Show
typealias VenueData = HighForThisAPI.VenueQuery.Data
typealias VideoData = HighForThisAPI.VideoQuery.Data.Video
typealias VideosData = HighForThisAPI.VideosQuery.Data.Videos
typealias VideoListNode = HighForThisAPI.VideosQuery.Data.Videos.Edge.Node

func getData<Query: GraphQLQuery>(_ query: Query, cachePolicy: CachePolicy = cachePolicy, completion: @escaping ((Query.Data) -> ())) {
    print("\(Query.operationName) is being fetched.")
    Network.shared.apollo.fetch(query: query, cachePolicy: cachePolicy) { result in
        switch result {
        case .success(let graphQLResult):
            completion(graphQLResult.data!);
        case .failure(let error):
            print("Query failed: \(error)")
        }
    }
}

func getArtist(slug: String, completion: @escaping ((ArtistData) -> ())) {
    let query = HighForThisAPI.ArtistQuery(slug: slug)
    getData(query) { data in
        completion(data)
    }
}

func getVenue(slug: String, completion: @escaping ((VenueData) -> ())) {
    let query = HighForThisAPI.VenueQuery(slug: slug)
    getData(query) { data in
        completion(data)
    }
}

func getShow(id: ObjID, completion: @escaping ((ShowData) -> ())) {
    let query = HighForThisAPI.ShowQuery(id: id)
    getData(query) { data in
        completion(data.show!)
    }
}

func getShowList(completion: @escaping (([ShowListNode]) -> ())) {
    let query = HighForThisAPI.ShowsQuery()
    getData(query) { data in
        var nodes = [ShowListNode]()
        for edge in data.shows!.edges {
            nodes.append(edge.node)
        }
        
        completion(nodes);
    }
}

func getPodcast(id: ObjID, completion: @escaping ((PodcastData) -> ())) {
    let query = HighForThisAPI.PodcastQuery(id: id)
    getData(query) { data in
        completion(data.podcast!)
    }
}

func getPodcasts(completion: @escaping (([PodcastListNode]) -> ())) {
    let query = HighForThisAPI.PodcastsQuery()
    getData(query) { data in
        var nodes = [PodcastListNode]()
        for edge in data.podcasts!.edges {
            nodes.append(edge.node)
        }
        
        completion(nodes);
    }
}

func getPost(slug: String, completion: @escaping ((PostData) -> ())) {
    let query = HighForThisAPI.PostQuery(slug: slug)
    getData(query) { data in
        completion(data.post!)
    }
}

func getPosts(completion: @escaping (([PostListNode]) -> ())) {
    let query = HighForThisAPI.PostsQuery()
    getData(query) { data in
        var nodes = [PostListNode]()
        for edge in data.posts!.edges {
            nodes.append(edge.node)
        }
        
        completion(nodes);
    }
}

func getVideo(slug: String, completion: @escaping ((VideoData) -> ())) {
    let query = HighForThisAPI.VideoQuery(slug: slug)
    getData(query) { data in
        completion(data.video!)
    }
}

func getVideos(after: GraphQLNullable<String>, first: GraphQLNullable<Int>, year: GraphQLNullable<Int>, completion: @escaping ((VideosData) -> ())) {
    let query = HighForThisAPI.VideosQuery(after: after, first: first, year: year)
    getData(query) { data in
        completion(data.videos!);
    }
}
