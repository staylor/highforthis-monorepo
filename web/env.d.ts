/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare interface AppData {
  [key: string]: any;
}

declare interface RouteHandle {
  layout?: string;
}
