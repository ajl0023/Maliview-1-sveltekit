import { h as hostName } from "./host-b5b4a144.js";
const handle = async ({ event, resolve }) => {
  if (event.request.url.startsWith("http://localhost:3001/api2")) {
    const new_request = new Request(event.request.url.replace("http://localhost:3001/api2", hostName), event.request);
    const response2 = await fetch(new_request);
    return response2;
  }
  const response = await resolve(event, {
    ssr: false
  });
  return response;
};
async function externalFetch(request) {
  const new_url = hostName + request;
  return fetch(new_url);
}
export { externalFetch, handle };
