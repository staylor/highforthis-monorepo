import { createCookieSessionStorage } from '@remix-run/node';

let storage: any;
if (typeof process !== 'undefined') {
  storage = createCookieSessionStorage({
    cookie: {
      name: process.env.TOKEN_KEY, // use any name you want here
      sameSite: 'lax', // this helps with CSRF
      path: '/', // remember to add this so the cookie will work in all routes
      httpOnly: true, // for security reasons, make this cookie http only
      secrets: [process.env.TOKEN_SECRET || 's3cr3t'], // replace this with an actual secret
      secure: process.env.NODE_ENV === 'production', // enable this in prod only
    },
  });
}

export const sessionStorage = storage;
