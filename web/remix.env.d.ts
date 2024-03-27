/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

declare interface AppData {
  [key: string]: any;
}

declare interface RouteHandle {
  layout?: string;
}
