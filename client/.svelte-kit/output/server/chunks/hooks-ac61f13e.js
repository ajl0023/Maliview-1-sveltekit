import { h as hostName } from "./host-b5b4a144.js";
import "path";
import cookie from "cookie";
import "axios";
const handle = async ({ event, resolve }) => {
  const base = event.url.origin;
  if (event.request.url.startsWith(`${base}/api2`)) {
    const has_cookie = event.request.headers.get("cookie");
    const new_cookie = cookie.serialize("collection", "maliview", {
      path: "/"
    });
    if (!has_cookie || !cookie.parse(has_cookie).collection) {
      event.request.headers.append("cookie", new_cookie);
    }
    const new_request = new Request(event.request.url.replace(`${base}/api2`, hostName), event.request);
    const response2 = await fetch(new_request);
    return response2;
  }
  const response = await resolve(event, {});
  return response;
};
async function externalFetch(request) {
  const new_url = hostName + request;
  return fetch(new_url);
}
export { externalFetch, handle };
