import cookie from "cookie";
async function get({ request }) {
  const has_cookies = request.headers.get("cookie");
  if (has_cookies) {
    const cookies = has_cookies;
    const collection = cookie.parse(cookies);
    if (collection.collection) {
      return {
        status: 200
      };
    } else {
      return {
        status: 403
      };
    }
  } else {
    return {
      status: 403
    };
  }
}
async function post({ request }) {
  const new_cookie = cookie.serialize("collection", "maliview", {
    path: "/"
  });
  return {
    headers: {
      "set-cookie": [new_cookie]
    }
  };
}
export { get, post };
