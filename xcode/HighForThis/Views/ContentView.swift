//
//  ContentView.swift
//  HighForThis
//
//  Created by Scott Taylor on 1/31/24.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        AppWrapper {
            TabView {
                ShowList(title: "Recommended Shows")
                    .tabItem {
                        Label("Shows", systemImage: "calendar")
                    }
                PodcastList()
                    .tabItem {
                        Label("Podcast", systemImage: "mic.circle")
                    }
                VideoList()
                    .tabItem {
                        Label("Videos", systemImage: "video")
                    }
                PostList()
                    .tabItem {
                        Label("Posts", systemImage: "note.text")
                    }
            }
        }
    }
}

#Preview {
    ContentView()
}
