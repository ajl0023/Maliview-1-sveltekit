import { h as hostName } from "./host-ef40cb6e.js";
import "path";
import cookie from "cookie";
import "axios";
const handle = async ({ event, resolve }) => {
  const base = event.url.origin;
  if (event.request.url.startsWith(`${base}/api2`)) {
    {
      event.request.headers.set("host", "test12312312356415616.store");
    }
    const headers = new Headers(event.request.headers);
    event.request.headers.get("cookie");
    const new_cookie = cookie.serialize("collection", "maliview");
    const auth_cookie = cookie.serialize("client_token", "ASDF##@@444SDF@@AXCVAZXGH23323");
    const res_cookies = auth_cookie + "; " + new_cookie;
    headers.set("cookie", res_cookies);
    const serialized_headers = Object.fromEntries(headers.entries());
    const new_request = new Request(event.request.url.replace(`${base}/api2`, hostName), {
      headers: serialized_headers
    });
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
