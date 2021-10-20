var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
import "@glidejs/glide";
import "vanilla-lazyload";
import "@use-gesture/vanilla";
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue$1 = [];
function writable$1(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue$1.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue$1.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue$1.length; i += 2) {
            subscriber_queue$1[i][0](subscriber_queue$1[i + 1]);
          }
          subscriber_queue$1.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
const escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable$1($session);
    const props = {
      stores: {
        page: writable$1(null),
        navigating: writable$1(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k in props)
    if (!keys.has(k) && k[0] !== "$")
      rest[k] = props[k];
  return rest;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
const boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, classes_to_add) {
  const attributes = Object.assign({}, ...args);
  if (classes_to_add) {
    if (attributes.class == null) {
      attributes.class = classes_to_add;
    } else {
      attributes.class += " " + classes_to_add;
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function escape_attribute_value(value) {
  return typeof value === "string" ? escape(value) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "";
const css$n = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$n);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base = "";
let assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
const template = ({ head, body }) => '<!DOCTYPE html>\r\n<html lang="en">\r\n	<head>\r\n		<meta charset="utf-8" />\r\n		<link rel="icon" href="/logo.inline.svg" />\r\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\r\n		' + head + '\r\n	</head>\r\n	<body>\r\n		<div id="svelte">' + body + "</div>\r\n	</body>\r\n</html>\r\n";
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-106b2f2b.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-106b2f2b.js", assets + "/_app/chunks/vendor-04bdbe9d.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
const empty = () => ({});
const manifest = {
  assets: [{ "file": "logo.inline.svg", "size": 37735, "type": "image/svg+xml" }, { "file": "_headers.txt", "size": 35, "type": "text/plain" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
const metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-b5830e83.js", "css": [], "js": ["layout.svelte-b5830e83.js", "chunks/vendor-04bdbe9d.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-455283b3.js", "css": [], "js": ["error.svelte-455283b3.js", "chunks/vendor-04bdbe9d.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-10076640.js", "css": ["assets/pages/index.svelte-6a9a8147.css"], "js": ["pages/index.svelte-10076640.js", "chunks/vendor-04bdbe9d.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
const pageContent = [
  "home",
  "malibu life",
  "discover",
  "renders",
  "floorplans",
  "equestrian",
  "video",
  "behind the scenes",
  "drone footage",
  "credits",
  "contact"
];
const navButtons = [
  "home",
  "malibu life",
  "discover",
  "renders",
  "floorplans",
  "equestrian",
  "video render",
  "behind the scenes",
  "drone footage",
  "credits",
  "contact"
];
const pageLength = pageContent.length;
const textPages = [
  {
    header: "malibu",
    paragraphs: [
      "Stretching for more than 30 miles along the coastline, Malibu has achieved almost mythological status among Californian beach towns. Hollywood stars and top athletes live in oceanfront homes here and enjoy front-row seats for surfing and unforgettable sunsets."
    ]
  },
  {
    header: "discover",
    paragraphs: [
      "Maliview Estates. This unique architectural design by Amit Apel Design, Inc. presents a style of its own. The Worldwide architect has received multiple awards and Amit Apel, Inc. was most recently recognized in its hometown as one of the best firms by Home Builder Digest.",
      "The villa will have open space plan with high ceilings with a touch of nature coming indoors. The home includes 4 perfectly placed bedrooms with views to admire the scenery as well as 4.5 bathrooms. All of the interior will be featuring custom interior design by Amit Apel Design, Inc. From an infinity pool you will be enjoying the ocean in the horizon, the view of Santa Monica Mountains, and overwhelming sunrises, and sunsets.",
      "Currently under construction with a completion date early fall. Please note that both exterior and interior paint colors can be changed."
    ]
  },
  {
    header: "renders",
    paragraphs: [
      "Browse for interior and exterior renderse of Maliview Estates"
    ]
  },
  {
    header: "floorplans",
    paragraphs: [
      "Live the dreams in the hills of Malibu when this stunning Tuscany modern architectural home and equestrian property is completed. Comprising a spacious four acres, this estate compound will have a matching architectural style horse barn with stalls. There is a separate entrance to the barn with plenty of additional parking for a horse trailer and RV parking. There are spectacular views of the Santa Monica Mountains with horse trails throughout leading to stunning countryside and ocean views."
    ]
  },
  {
    header: "equestrian",
    paragraphs: [
      "This equestrian property will present a barn with stalls on a lower portion of a four-acre space with its own separate driveway and plenty of room for the horses, other equestrians, or your trailer. You will have access to trails directly from the property and a creek of your own. You can call this paradise your home!",
      "As much as it feels remote, you will be only 15 minutes away from PCH and less than 20 minutes away from Westlake Village. Great school district with plenty of activities. Come by to see this beautifully planned home in the making for yourself."
    ]
  },
  {
    header: "video render",
    paragraphs: [
      "Take a dive into Maliview with our 3D rendering. To get a feeling of the completed project and vision, please click on the video to the right."
    ]
  },
  {
    header: "",
    paragraphs: [""]
  },
  {
    header: "drone footage",
    paragraphs: ["Take a view from above of the lot and build progress"]
  }
];
const creditsContent = [
  {
    header: "stout design build (landscape architect)",
    paragraphs: [
      "https://www.stoutdesignbuild.com/ Tom@stoutdesignbuild.com ",
      "License # B, C-27, C-53 980007",
      "Office 310.876.1018",
      "12405 Venice Blvd. #352 ",
      "LA CA 90066"
    ]
  },
  {
    header: "SCOTT JAMES OF DOUGLAS ELLIMAN (REAL ESTATE)",
    paragraphs: [
      "scottjamesluxuryestates.com / Scott.James@elliman.com",
      "DRE 01911554",
      "Direct: 626.327.1836",
      "Office: 626.204.5252",
      "Mobile: 626.327.1836",
      "70 S Lake Ave, Suite 1020",
      "Pasadena, CA 91101"
    ]
  },
  {
    header: "SHANE - TIERRA SITE WORKS INC (CONCRETE FOUNDATION)",
    paragraphs: [
      "tierrasiteworks@gmail.com",
      "Cell: (818) 921-5150",
      "Office: (818) 616-4204",
      "7263 Woodley Ave, Van Nuys, CA 91406"
    ]
  },
  {
    header: "ELAD - POWER BY SPARK, INC (ELECTRICIAN)",
    paragraphs: [
      "invoice@powerbyspark.com",
      "Phone: 818-277-0994",
      "19528 Ventura Blvd Suite 386",
      "Tarzana, CA 91356"
    ]
  },
  {
    header: "ALEX/RUBEN - PRONTO PLUMBING (PLUMBER)",
    paragraphs: ["alexsimental@gmail.com", "Phone: 805-249-0050"]
  },
  {
    header: "BENITO - SANCHEZ IRON WORKS INC (STRUCTURAL STEEL)",
    paragraphs: ["sanchezwelding@yahoo.com", "Phone: (310) 630-4835"]
  }
];
const navToLink = navButtons.map((item) => {
  return item.replace(/\s/g, "-");
});
const highResBts = {
  "phase 1": [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880377/galleryHighRes/2021.05.29_roof_2_cm4ouk.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880380/galleryHighRes/Amit_and_Russel_asulsg.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880379/galleryHighRes/Bike_d1id7e.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880380/galleryHighRes/Framing_hqxw7y.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880377/galleryHighRes/Humming_Bird_vwjffp.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880377/galleryHighRes/circle_window_with_pendant_light_mbvjwj.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880378/galleryHighRes/dining_room_discussion_wxmdwj.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880379/galleryHighRes/electrical_2_xv2vdj.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880378/galleryHighRes/electrical_discussion_qpavea.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880379/galleryHighRes/framing_discussion_tmw90t.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880377/galleryHighRes/kitchen_discussion_2_mzb1yv.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880378/galleryHighRes/kitchen_discussion_3_jniqgh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880378/galleryHighRes/kitchen_discussion_ipeyz4.jpg"
  ],
  "phase 2": [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1626_novdvp.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238972/galleryHighRes/phase2/IMG_1625_t8knfm.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1624_obexun.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1623_jbpido.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1622_q3bvg8.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1621_pxsdvz.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238972/galleryHighRes/phase2/IMG_1620_mjico3.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238972/galleryHighRes/phase2/IMG_1619_qkkekq.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1618_cnoqgy.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1617_qywvjz.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1616_mkvjeq.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238971/galleryHighRes/phase2/IMG_1615_kchof9.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1614_yihg5d.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1613_fqh97t.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1612_m0lmnj.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1610_cbzpb3.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1609_hjzdsr.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1608_yeg4bm.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238969/galleryHighRes/phase2/IMG_1607_z9ee6p.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1606_x4urwr.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1605_kuydmf.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238969/galleryHighRes/phase2/IMG_1604_wsktod.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1602_uvtyxc.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634238970/galleryHighRes/phase2/IMG_1601_aiisk3.jpg"
  ]
};
const images$1 = [
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left0_b4pmin.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left1_crfnqm.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left2_iqpbia.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left3_gt2t63.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left4_ydqnt0.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left5_l5nmc9.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left6_jfidwp.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/left7_niljn0.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/left8_riipzm.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/left9_flfula.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/left10_zcg5ur.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/left11_gikilv.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/left12_zgracn.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/left13_gbr1bv.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/right17_f2ptch.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804586/renders/right18_ppnbem.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804584/renders/right19_wiwuqi.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804584/renders/right20_w4p4nb.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804584/renders/right21_wxcvmj.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804584/renders/right22_rwiubr.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804584/renders/right23_vd7hzi.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804584/renders/right24_nansvx.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/right25_ha8v1v.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/right26_zilp0g.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/right27_bq1phw.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/right28_pyuk66.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/right29_of0d0d.jpg",
  "https://res.cloudinary.com/dt4xntymn/image/upload/v1630804585/renders/right30_oaincf.jpg"
];
const currentPageStore = () => {
  const state = {
    page: 0,
    action: null
  };
  const { subscribe: subscribe2, set, update } = writable(state);
  const methods = {
    setPage(val) {
      update((state2) => {
        if (val === 1 && state2.page === (images$1.length - 2) / 2) {
          state2.page = 0;
          return state2;
        }
        if (val === -1 && state2.page >= 1 || val === 1 && state2.page < (images$1.length - 2) / 2) {
          state2.page = state2.page + val;
        }
        return state2;
      });
    }
  };
  return {
    subscribe: subscribe2,
    set,
    update,
    ...methods
  };
};
const currentPage = currentPageStore();
let scrollContainers = [];
const modal = writable({
  visibility: false,
  content: null,
  type: null
});
const pagePositionsStore = () => {
  const state = {
    page: null,
    left: 0,
    shouldScroll: true,
    inital: false,
    right: -1e3
  };
  const { subscribe: subscribe2, set, update } = writable(state);
  const methods = {
    toggleScroll(e) {
      update((state2) => {
        state2.shouldScroll = false;
        setTimeout(() => {
          state2.shouldScroll = true;
        }, 1100);
        return state2;
      });
    },
    disableScroll() {
      update((state2) => {
        state2.shouldScroll = false;
      });
    },
    enable() {
      update((state2) => {
        state2.shouldScroll = true;
      });
    },
    scrollCheck(e) {
      if (scrollContainers.includes(e.target.parentElement.parentElement.parentElement)) {
        return new Promise((res, rej) => {
          scrollContainers.forEach((ele) => {
            ele.onscroll = () => {
              res(false);
            };
          });
          setTimeout(() => {
            res(state.shouldScroll);
          }, 100);
        });
      } else {
        return Promise.resolve(state.shouldScroll);
      }
    },
    scrollEve(e) {
      this.scrollCheck(e).then((val) => {
        if (val) {
          if (e.deltaY > 0 && state.page < pageLength - 1) {
            state.left = state.left - 100;
            state.right = state.right + 100;
            state.page += 1;
          } else if (e.deltaY < 0 && state.page > 0) {
            state.left = state.left + 100;
            state.right = state.right - 100;
            state.page -= 1;
          }
          this.toggleScroll(e);
        }
      });
    },
    handleResize(left, right) {
      update((state2) => {
        state2.left = left;
        state2.right = right;
        return state2;
      });
    }
  };
  return {
    subscribe: subscribe2,
    set,
    update,
    ...methods
  };
};
const pagePositions = pagePositionsStore();
var Modal_svelte_svelte_type_style_lang = "";
const css$m = {
  code: ".video-container.svelte-1uwzqqj .video-modal.svelte-1uwzqqj{position:absolute;top:0;bottom:0;left:0;right:0;height:100%;width:100%}img.svelte-1uwzqqj.svelte-1uwzqqj{width:100%;object-fit:cover;height:100%}",
  map: `{"version":3,"file":"Modal.svelte","sources":["Modal.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { modal } from \\"../../stores\\";\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"bu-modal {$modal.visibility ? 'bu-is-active' : ''}\\">\\r\\n  <div\\r\\n    on:click={() => {\\r\\n      $modal.content = null;\\r\\n\\r\\n      $modal.visibility = false;\\r\\n    }}\\r\\n    class=\\"bu-modal-background\\"\\r\\n  />\\r\\n  <div class=\\"bu-modal-content\\">\\r\\n    <div class=\\"bu-image bu-is-4by3\\">\\r\\n      {#if $modal.type === \\"video\\"}\\r\\n        <div class=\\"video-container\\">\\r\\n          <iframe\\r\\n            height=\\"100%\\"\\r\\n            class=\\"video-modal\\"\\r\\n            width=\\"100%\\"\\r\\n            src={$modal.content}\\r\\n            title=\\"YouTube video player\\"\\r\\n            frameBorder=\\"0\\"\\r\\n            allow=\\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\\"\\r\\n            allowFullScreen\\r\\n          />\\r\\n        </div>\\r\\n      {:else}\\r\\n        <img src={$modal.content} alt=\\"\\" />\\r\\n      {/if}\\r\\n    </div>\\r\\n  </div>\\r\\n  <button\\r\\n    on:click={() => {\\r\\n      $modal.content = null;\\r\\n\\r\\n      $modal.visibility = false;\\r\\n    }}\\r\\n    class=\\"bu-modal-close bu-is-large\\"\\r\\n    aria-label=\\"close\\"\\r\\n  />\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.video-container .video-modal {\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  height: 100%;\\n  width: 100%;\\n}\\n\\nimg {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AA4CmB,+BAAgB,CAAC,YAAY,eAAC,CAAC,AAChD,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,AACb,CAAC,AAED,GAAG,8BAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $modal, $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => $modal = value);
  $$result.css.add(css$m);
  $$unsubscribe_modal();
  return `<div class="${"bu-modal " + escape($modal.visibility ? "bu-is-active" : "")}"><div class="${"bu-modal-background"}"></div>
  <div class="${"bu-modal-content"}"><div class="${"bu-image bu-is-4by3"}">${$modal.type === "video" ? `<div class="${"video-container svelte-1uwzqqj"}"><iframe height="${"100%"}" class="${"video-modal svelte-1uwzqqj"}" width="${"100%"}"${add_attribute("src", $modal.content, 0)} title="${"YouTube video player"}" frameborder="${"0"}" allow="${"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}" allowfullscreen></iframe></div>` : `<img${add_attribute("src", $modal.content, 0)} alt="${""}" class="${"svelte-1uwzqqj"}">`}</div></div>
  <button class="${"bu-modal-close bu-is-large"}" aria-label="${"close"}"></button>
</div>`;
});
var Hamburger_svelte_svelte_type_style_lang = "";
const css$l = {
  code: '.burger-label.svelte-1ld8t1b.svelte-1ld8t1b{block-size:18px;display:flex;justify-content:center;cursor:pointer;inline-size:18px;font-size:14px;line-height:21px;align-items:center}.burger-label.svelte-1ld8t1b .main-trigger-icon-container.svelte-1ld8t1b{position:relative;display:block;block-size:18px;inline-size:100%}.burger-label.svelte-1ld8t1b .main-trigger-icon-container .main-trigger-icon.svelte-1ld8t1b{background-color:white;inline-size:100%;position:absolute;display:block;transition:all 300ms ease-in-out;block-size:calc(20px / 10);top:calc(36% + 2px)}.burger-label.svelte-1ld8t1b .main-trigger-icon-container .main-trigger-icon.svelte-1ld8t1b:before{transition:all 300ms ease-in-out;block-size:calc(20px / 10);background-color:white;content:"";top:-5px;display:block;position:absolute;inline-size:100%}.burger-label.svelte-1ld8t1b .main-trigger-icon-container .main-trigger-icon.svelte-1ld8t1b:after{transition:all 300ms ease-in-out;block-size:calc(20px / 10);background-color:white;content:"";top:5px;display:block;position:absolute;inline-size:100%}.burger-input.svelte-1ld8t1b.svelte-1ld8t1b{opacity:1;display:none}.burger-input.svelte-1ld8t1b:checked~.burger-label.svelte-1ld8t1b{z-index:4}.burger-input:checked~.burger-label.svelte-1ld8t1b .main-trigger-icon.svelte-1ld8t1b{transition:all 300ms ease-in-out;background-color:transparent}.burger-input:checked~.burger-label.svelte-1ld8t1b .main-trigger-icon.svelte-1ld8t1b:before{top:0;z-index:4;background-color:black;transform:rotate(45deg);transition:all 300ms ease-in-out}.burger-input:checked~.burger-label.svelte-1ld8t1b .main-trigger-icon.svelte-1ld8t1b:after{top:0;z-index:4;background-color:black;transform:rotate(-45deg);transition:all 300ms ease-in-out}.burger-input.svelte-1ld8t1b:checked~.side-menu-container.svelte-1ld8t1b{background-color:white;height:100vh;bottom:0;top:0;display:flex;flex-direction:column;transition:all 400ms ease-in-out;z-index:3;left:0;position:absolute}.burger-input:checked~.side-menu-container.svelte-1ld8t1b .side-menu-item-container.svelte-1ld8t1b{padding:40px 8px;overflow-y:scroll;height:100%;margin-top:1.5rem}.burger-input:checked~.side-menu-container.svelte-1ld8t1b .side-menu-item-container.svelte-1ld8t1b::before{content:"";height:100%;width:100%;display:block;opacity:30%;background-size:200px;z-index:1;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;background-image:url("https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_Black_z0yd9b.png");background-repeat:no-repeat;background-position:center center}.burger-input:checked~.side-menu-container.svelte-1ld8t1b .side-menu-item-container.svelte-1ld8t1b::-webkit-scrollbar{display:none}.burger-input:checked~.side-menu-container.svelte-1ld8t1b .side-menu-item-container li.svelte-1ld8t1b:nth-child(-n+11){font-size:23px;font-weight:600;display:flex;text-transform:uppercase;align-items:center;z-index:2;position:relative;color:black;cursor:pointer;padding:20px 110px 20px 20px;border-bottom:1px solid #d0d1d2}.burger-input.svelte-1ld8t1b:checked~.header-mask.svelte-1ld8t1b{position:fixed;block-size:100vh;top:0;left:0;z-index:2;bottom:0;inline-size:100%;background-color:rgba(0, 0, 0, 0.5)}.side-menu-container.svelte-1ld8t1b.svelte-1ld8t1b{position:relative;background-color:white;height:100vh;bottom:0;top:0;display:flex;flex-direction:column;transition:all 400ms ease-in-out;z-index:3;left:-600px;position:absolute}.side-menu-container.svelte-1ld8t1b .side-menu-item-container.svelte-1ld8t1b{padding:40px 8px;overflow-y:scroll;height:100%;margin-top:1.5rem}.side-menu-container.svelte-1ld8t1b .side-menu-item-container.svelte-1ld8t1b::before{content:"";height:100%;width:100%;display:block;opacity:30%;background-size:200px;z-index:1;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;background-image:url("https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_Black_z0yd9b.png");background-repeat:no-repeat;background-position:center center}.side-menu-container.svelte-1ld8t1b .side-menu-item-container.svelte-1ld8t1b::-webkit-scrollbar{display:none}.side-menu-container.svelte-1ld8t1b .side-menu-item-container li.svelte-1ld8t1b:nth-child(-n+11){font-size:23px;font-weight:600;display:flex;text-transform:uppercase;align-items:center;z-index:2;position:relative;color:black;cursor:pointer;padding:20px 110px 20px 20px;border-bottom:1px solid #d0d1d2}.sidebar-logo-container.svelte-1ld8t1b.svelte-1ld8t1b{max-width:266px;margin:auto;padding:30px;z-index:2;position:relative}.sidebar-logo-container.svelte-1ld8t1b img.svelte-1ld8t1b{width:100%;object-fit:cover}',
  map: '{"version":3,"file":"Hamburger.svelte","sources":["Hamburger.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { navButtons, navToLink } from \\"../../pageContent\\";\\r\\n  import { pagePositions } from \\"../../stores\\";\\r\\n\\r\\n  let mainInput;\\r\\n  function triggerScroll(i) {\\r\\n    $pagePositions.inital = true;\\r\\n    $pagePositions.left = i * -100;\\r\\n    $pagePositions.right = 100 * (i - 10);\\r\\n    $pagePositions.page = i;\\r\\n    mainInput.checked = false;\\r\\n  }\\r\\n<\/script>\\r\\n\\r\\n<div>\\r\\n  <input\\r\\n    bind:this={mainInput}\\r\\n    type=\\"checkbox\\"\\r\\n    id=\\"burger-trigger\\"\\r\\n    class=\\"burger-input\\"\\r\\n  />\\r\\n  <label for=\\"burger-trigger\\" class=\\"burger-label\\">\\r\\n    <span class=\\"main-trigger-icon-container\\">\\r\\n      <i class=\\"main-trigger-icon\\" />\\r\\n    </span>\\r\\n  </label>\\r\\n  <div class=\\"side-menu-container\\">\\r\\n    <ul name=\\"list-container\\" class=\\"side-menu-item-container\\">\\r\\n      {#each navButtons as label, i}\\r\\n        <li\\r\\n          on:click={() => {\\r\\n            triggerScroll(i);\\r\\n            window.location.href = \\"#\\" + navToLink[i];\\r\\n          }}\\r\\n        >\\r\\n          {label}\\r\\n        </li>\\r\\n      {/each}\\r\\n    </ul>\\r\\n    <div class=\\"sidebar-logo-container\\">\\r\\n      <a\\r\\n        on:click={(e) => {\\r\\n          e.preventDefault();\\r\\n          window.open(\\"https://www.apeldesign.com/\\");\\r\\n        }}\\r\\n        href=\\"https://www.apeldesign.com/\\"\\r\\n      >\\r\\n        <img\\r\\n          src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_Black_z0yd9b.png\\"\\r\\n          alt=\\"\\"\\r\\n        />\\r\\n      </a>\\r\\n    </div>\\r\\n  </div>\\r\\n\\r\\n  <div\\r\\n    on:click={() => {\\r\\n      mainInput.checked = false;\\r\\n    }}\\r\\n    data-id=\\"header-mask\\"\\r\\n    class=\\"header-mask\\"\\r\\n  />\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.burger-label {\\n  block-size: 18px;\\n  display: flex;\\n  justify-content: center;\\n  cursor: pointer;\\n  inline-size: 18px;\\n  font-size: 14px;\\n  line-height: 21px;\\n  align-items: center;\\n}\\n.burger-label .main-trigger-icon-container {\\n  position: relative;\\n  display: block;\\n  block-size: 18px;\\n  inline-size: 100%;\\n}\\n.burger-label .main-trigger-icon-container .main-trigger-icon {\\n  background-color: white;\\n  inline-size: 100%;\\n  position: absolute;\\n  display: block;\\n  transition: all 300ms ease-in-out;\\n  block-size: calc(20px / 10);\\n  top: calc(36% + 2px);\\n}\\n.burger-label .main-trigger-icon-container .main-trigger-icon:before {\\n  transition: all 300ms ease-in-out;\\n  block-size: calc(20px / 10);\\n  background-color: white;\\n  content: \\"\\";\\n  top: -5px;\\n  display: block;\\n  position: absolute;\\n  inline-size: 100%;\\n}\\n.burger-label .main-trigger-icon-container .main-trigger-icon:after {\\n  transition: all 300ms ease-in-out;\\n  block-size: calc(20px / 10);\\n  background-color: white;\\n  content: \\"\\";\\n  top: 5px;\\n  display: block;\\n  position: absolute;\\n  inline-size: 100%;\\n}\\n\\n.burger-input {\\n  opacity: 1;\\n  display: none;\\n}\\n.burger-input:checked ~ .burger-label {\\n  z-index: 4;\\n}\\n.burger-input:checked ~ .burger-label .main-trigger-icon {\\n  transition: all 300ms ease-in-out;\\n  background-color: transparent;\\n}\\n.burger-input:checked ~ .burger-label .main-trigger-icon:before {\\n  top: 0;\\n  z-index: 4;\\n  background-color: black;\\n  transform: rotate(45deg);\\n  transition: all 300ms ease-in-out;\\n}\\n.burger-input:checked ~ .burger-label .main-trigger-icon:after {\\n  top: 0;\\n  z-index: 4;\\n  background-color: black;\\n  transform: rotate(-45deg);\\n  transition: all 300ms ease-in-out;\\n}\\n.burger-input:checked ~ .side-menu-container {\\n  background-color: white;\\n  height: 100vh;\\n  bottom: 0;\\n  top: 0;\\n  display: flex;\\n  flex-direction: column;\\n  transition: all 400ms ease-in-out;\\n  z-index: 3;\\n  left: 0;\\n  position: absolute;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container {\\n  padding: 40px 8px;\\n  overflow-y: scroll;\\n  height: 100%;\\n  margin-top: 1.5rem;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container::before {\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  display: block;\\n  opacity: 30%;\\n  background-size: 200px;\\n  z-index: 1;\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n  background-image: url(\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_Black_z0yd9b.png\\");\\n  background-repeat: no-repeat;\\n  background-position: center center;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container::-webkit-scrollbar {\\n  display: none;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container li:nth-child(-n+11) {\\n  font-size: 23px;\\n  font-weight: 600;\\n  display: flex;\\n  text-transform: uppercase;\\n  align-items: center;\\n  z-index: 2;\\n  position: relative;\\n  color: black;\\n  cursor: pointer;\\n  padding: 20px 110px 20px 20px;\\n  border-bottom: 1px solid #d0d1d2;\\n}\\n.burger-input:checked ~ .header-mask {\\n  position: fixed;\\n  block-size: 100vh;\\n  top: 0;\\n  left: 0;\\n  z-index: 2;\\n  bottom: 0;\\n  inline-size: 100%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n}\\n\\n.side-menu-container {\\n  position: relative;\\n  background-color: white;\\n  height: 100vh;\\n  bottom: 0;\\n  top: 0;\\n  display: flex;\\n  flex-direction: column;\\n  transition: all 400ms ease-in-out;\\n  z-index: 3;\\n  left: -600px;\\n  position: absolute;\\n}\\n.side-menu-container .side-menu-item-container {\\n  padding: 40px 8px;\\n  overflow-y: scroll;\\n  height: 100%;\\n  margin-top: 1.5rem;\\n}\\n.side-menu-container .side-menu-item-container::before {\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  display: block;\\n  opacity: 30%;\\n  background-size: 200px;\\n  z-index: 1;\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n  background-image: url(\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_Black_z0yd9b.png\\");\\n  background-repeat: no-repeat;\\n  background-position: center center;\\n}\\n.side-menu-container .side-menu-item-container::-webkit-scrollbar {\\n  display: none;\\n}\\n.side-menu-container .side-menu-item-container li:nth-child(-n+11) {\\n  font-size: 23px;\\n  font-weight: 600;\\n  display: flex;\\n  text-transform: uppercase;\\n  align-items: center;\\n  z-index: 2;\\n  position: relative;\\n  color: black;\\n  cursor: pointer;\\n  padding: 20px 110px 20px 20px;\\n  border-bottom: 1px solid #d0d1d2;\\n}\\n\\n.sidebar-logo-container {\\n  max-width: 266px;\\n  margin: auto;\\n  padding: 30px;\\n  z-index: 2;\\n  position: relative;\\n}\\n.sidebar-logo-container img {\\n  width: 100%;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAgEmB,aAAa,8BAAC,CAAC,AAChC,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,CACjB,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,4BAAa,CAAC,4BAA4B,eAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,4BAAa,CAAC,4BAA4B,CAAC,kBAAkB,eAAC,CAAC,AAC7D,gBAAgB,CAAE,KAAK,CACvB,WAAW,CAAE,IAAI,CACjB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAC3B,GAAG,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,GAAG,CAAC,AACtB,CAAC,AACD,4BAAa,CAAC,4BAA4B,CAAC,iCAAkB,OAAO,AAAC,CAAC,AACpE,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAC3B,gBAAgB,CAAE,KAAK,CACvB,OAAO,CAAE,EAAE,CACX,GAAG,CAAE,IAAI,CACT,OAAO,CAAE,KAAK,CACd,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,4BAAa,CAAC,4BAA4B,CAAC,iCAAkB,MAAM,AAAC,CAAC,AACnE,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAC3B,gBAAgB,CAAE,KAAK,CACvB,OAAO,CAAE,EAAE,CACX,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,KAAK,CACd,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,IAAI,AACf,CAAC,AACD,4BAAa,QAAQ,CAAG,aAAa,eAAC,CAAC,AACrC,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,aAAa,QAAQ,CAAG,4BAAa,CAAC,kBAAkB,eAAC,CAAC,AACxD,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AACD,aAAa,QAAQ,CAAG,4BAAa,CAAC,iCAAkB,OAAO,AAAC,CAAC,AAC/D,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,CAAC,CACV,gBAAgB,CAAE,KAAK,CACvB,SAAS,CAAE,OAAO,KAAK,CAAC,CACxB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,AACnC,CAAC,AACD,aAAa,QAAQ,CAAG,4BAAa,CAAC,iCAAkB,MAAM,AAAC,CAAC,AAC9D,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,CAAC,CACV,gBAAgB,CAAE,KAAK,CACvB,SAAS,CAAE,OAAO,MAAM,CAAC,CACzB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,AACnC,CAAC,AACD,4BAAa,QAAQ,CAAG,oBAAoB,eAAC,CAAC,AAC5C,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,CAAC,CACP,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,yBAAyB,eAAC,CAAC,AACtE,OAAO,CAAE,IAAI,CAAC,GAAG,CACjB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,wCAAyB,QAAQ,AAAC,CAAC,AAC9E,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,GAAG,CACZ,eAAe,CAAE,KAAK,CACtB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,oGAAoG,CAAC,CAC3H,iBAAiB,CAAE,SAAS,CAC5B,mBAAmB,CAAE,MAAM,CAAC,MAAM,AACpC,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,wCAAyB,mBAAmB,AAAC,CAAC,AACzF,OAAO,CAAE,IAAI,AACf,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,yBAAyB,CAAC,iBAAE,WAAW,KAAK,CAAC,AAAC,CAAC,AAC1F,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,CAAC,IAAI,CAC7B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAClC,CAAC,AACD,4BAAa,QAAQ,CAAG,YAAY,eAAC,CAAC,AACpC,QAAQ,CAAE,KAAK,CACf,UAAU,CAAE,KAAK,CACjB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,IAAI,CACjB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AAED,oBAAoB,8BAAC,CAAC,AACpB,QAAQ,CAAE,QAAQ,CAClB,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,MAAM,CACZ,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,mCAAoB,CAAC,yBAAyB,eAAC,CAAC,AAC9C,OAAO,CAAE,IAAI,CAAC,GAAG,CACjB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,mCAAoB,CAAC,wCAAyB,QAAQ,AAAC,CAAC,AACtD,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,GAAG,CACZ,eAAe,CAAE,KAAK,CACtB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,oGAAoG,CAAC,CAC3H,iBAAiB,CAAE,SAAS,CAC5B,mBAAmB,CAAE,MAAM,CAAC,MAAM,AACpC,CAAC,AACD,mCAAoB,CAAC,wCAAyB,mBAAmB,AAAC,CAAC,AACjE,OAAO,CAAE,IAAI,AACf,CAAC,AACD,mCAAoB,CAAC,yBAAyB,CAAC,iBAAE,WAAW,KAAK,CAAC,AAAC,CAAC,AAClE,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,CAAC,IAAI,CAC7B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAClC,CAAC,AAED,uBAAuB,8BAAC,CAAC,AACvB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,sCAAuB,CAAC,GAAG,eAAC,CAAC,AAC3B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACnB,CAAC"}'
};
const Hamburger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_pagePositions;
  $$unsubscribe_pagePositions = subscribe(pagePositions, (value) => value);
  let mainInput;
  $$result.css.add(css$l);
  $$unsubscribe_pagePositions();
  return `<div><input type="${"checkbox"}" id="${"burger-trigger"}" class="${"burger-input svelte-1ld8t1b"}"${add_attribute("this", mainInput, 0)}>
  <label for="${"burger-trigger"}" class="${"burger-label svelte-1ld8t1b"}"><span class="${"main-trigger-icon-container svelte-1ld8t1b"}"><i class="${"main-trigger-icon svelte-1ld8t1b"}"></i></span></label>
  <div class="${"side-menu-container svelte-1ld8t1b"}"><ul name="${"list-container"}" class="${"side-menu-item-container svelte-1ld8t1b"}">${each(navButtons, (label, i) => `<li class="${"svelte-1ld8t1b"}">${escape(label)}
        </li>`)}</ul>
    <div class="${"sidebar-logo-container svelte-1ld8t1b"}"><a href="${"https://www.apeldesign.com/"}"><img src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_Black_z0yd9b.png"}" alt="${""}" class="${"svelte-1ld8t1b"}"></a></div></div>

  <div data-id="${"header-mask"}" class="${"header-mask svelte-1ld8t1b"}"></div>
</div>`;
});
var Navbar_svelte_svelte_type_style_lang = "";
const css$k = {
  code: '.wrapper.svelte-1j3w4u1.svelte-1j3w4u1{width:100vw;position:fixed;z-index:3;pointer-events:none}.container.svelte-1j3w4u1.svelte-1j3w4u1{color:white;display:flex;justify-content:space-between;align-items:center;font-family:"Orator";padding:20px 40px;font-weight:100}.container.svelte-1j3w4u1 .left-container.svelte-1j3w4u1{display:flex;pointer-events:all;align-items:center}.container.svelte-1j3w4u1 .logo-container.svelte-1j3w4u1{max-width:12em;height:66px;pointer-events:all}.container.svelte-1j3w4u1 .logo-container img.svelte-1j3w4u1{width:100%;object-fit:cover}@media(max-width: 650px){.secondary-main-trigger-icon.svelte-1j3w4u1.svelte-1j3w4u1{display:none}.logo.svelte-1j3w4u1.svelte-1j3w4u1{display:none}}.nav-menu-label.svelte-1j3w4u1.svelte-1j3w4u1{display:flex;align-items:center}.nav-menu-label.svelte-1j3w4u1 .secondary-main-trigger-icon.svelte-1j3w4u1{font-size:18px;margin-left:9px;line-height:18px;cursor:pointer;line-height:20px;margin-top:-2px;margin-bottom:-1px;text-transform:uppercase;font-family:Orator;height:fit-content}',
  map: '{"version":3,"file":"Navbar.svelte","sources":["Navbar.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import Hamburger from \\"../Hamburger/Hamburger.svelte\\";\\r\\n<\/script>\\r\\n\\r\\n<nav class=\\"wrapper\\">\\r\\n  <div class=\\"container\\">\\r\\n    <div class=\\"left-container\\">\\r\\n      <Hamburger />\\r\\n      <div>\\r\\n        <label class=\\"nav-menu-label\\" for=\\"burger-trigger\\">\\r\\n          <p class=\\"secondary-main-trigger-icon\\">menu</p>\\r\\n        </label>\\r\\n      </div>\\r\\n    </div>\\r\\n\\r\\n    <div class=\\"logo-container\\">\\r\\n      <a\\r\\n        on:click={(e) => {\\r\\n          e.preventDefault();\\r\\n          window.open(\\"https://www.apeldesign.com/\\");\\r\\n        }}\\r\\n        href=\\"https://www.apeldesign.com/\\"\\r\\n      >\\r\\n        <img\\r\\n          class=\\"logo\\"\\r\\n          src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_White_hkfvc4.png\\"\\r\\n          alt=\\"\\"\\r\\n        />\\r\\n      </a>\\r\\n    </div>\\r\\n  </div>\\r\\n</nav>\\r\\n\\r\\n<style lang=\\"scss\\">.wrapper {\\n  width: 100vw;\\n  position: fixed;\\n  z-index: 3;\\n  pointer-events: none;\\n}\\n\\n.container {\\n  color: white;\\n  display: flex;\\n  justify-content: space-between;\\n  align-items: center;\\n  font-family: \\"Orator\\";\\n  padding: 20px 40px;\\n  font-weight: 100;\\n}\\n.container .left-container {\\n  display: flex;\\n  pointer-events: all;\\n  align-items: center;\\n}\\n.container .logo-container {\\n  max-width: 12em;\\n  height: 66px;\\n  pointer-events: all;\\n}\\n.container .logo-container img {\\n  width: 100%;\\n  object-fit: cover;\\n}\\n\\n@media (max-width: 650px) {\\n  .secondary-main-trigger-icon {\\n    display: none;\\n  }\\n\\n  .logo {\\n    display: none;\\n  }\\n}\\n.nav-menu-label {\\n  display: flex;\\n  align-items: center;\\n}\\n.nav-menu-label .secondary-main-trigger-icon {\\n  font-size: 18px;\\n  margin-left: 9px;\\n  line-height: 18px;\\n  cursor: pointer;\\n  line-height: 20px;\\n  margin-top: -2px;\\n  margin-bottom: -1px;\\n  text-transform: uppercase;\\n  font-family: Orator;\\n  height: fit-content;\\n}</style>\\r\\n"],"names":[],"mappings":"AAiCmB,QAAQ,8BAAC,CAAC,AAC3B,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,CAAC,CACV,cAAc,CAAE,IAAI,AACtB,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,WAAW,CAAE,QAAQ,CACrB,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,yBAAU,CAAC,eAAe,eAAC,CAAC,AAC1B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,yBAAU,CAAC,eAAe,eAAC,CAAC,AAC1B,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,IAAI,CACZ,cAAc,CAAE,GAAG,AACrB,CAAC,AACD,yBAAU,CAAC,eAAe,CAAC,GAAG,eAAC,CAAC,AAC9B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,4BAA4B,8BAAC,CAAC,AAC5B,OAAO,CAAE,IAAI,AACf,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AACD,eAAe,8BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,8BAAe,CAAC,4BAA4B,eAAC,CAAC,AAC5C,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,IAAI,CACjB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,IAAI,CACnB,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,WAAW,AACrB,CAAC"}'
};
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$k);
  return `<nav class="${"wrapper svelte-1j3w4u1"}"><div class="${"container svelte-1j3w4u1"}"><div class="${"left-container svelte-1j3w4u1"}">${validate_component(Hamburger, "Hamburger").$$render($$result, {}, {}, {})}
      <div><label class="${"nav-menu-label svelte-1j3w4u1"}" for="${"burger-trigger"}"><p class="${"secondary-main-trigger-icon svelte-1j3w4u1"}">menu</p></label></div></div>

    <div class="${"logo-container svelte-1j3w4u1"}"><a href="${"https://www.apeldesign.com/"}"><img class="${"logo svelte-1j3w4u1"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656727/misc/By_Apel_Design_White_hkfvc4.png"}" alt="${""}"></a></div></div>
</nav>`;
});
const Facebook = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `<svg${spread([
    { role: "img" },
    { fill: "white" },
    { viewBox: "0 0 24 24" },
    { xmlns: "http://www.w3.org/2000/svg" },
    escape_object($$restProps)
  ])}>${slots.default ? slots.default({}) : ``}<title>Facebook</title><path d="${"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"}"></path></svg>`;
});
const Instagram = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `<svg${spread([
    { role: "img" },
    { fill: "white" },
    { viewBox: "0 0 24 24" },
    { xmlns: "http://www.w3.org/2000/svg" },
    escape_object($$restProps)
  ])}>${slots.default ? slots.default({}) : ``}<title>Instagram</title><path d="${"M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"}"></path></svg>`;
});
const Linkedin = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `<svg${spread([
    { role: "img" },
    { fill: "white" },
    { viewBox: "0 0 24 24" },
    { xmlns: "http://www.w3.org/2000/svg" },
    escape_object($$restProps)
  ])}>${slots.default ? slots.default({}) : ``}<title>LinkedIn</title><path d="${"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"}"></path></svg>`;
});
var Socials_svelte_svelte_type_style_lang = "";
const css$j = {
  code: ".container.svelte-l6eggz{position:fixed;z-index:3;right:40px;bottom:25px;width:15px;height:auto;display:flex;flex-direction:column;gap:18px;opacity:60%;object-fit:cover}",
  map: '{"version":3,"file":"Socials.svelte","sources":["Socials.svelte"],"sourcesContent":["<script>\\r\\n  import Facebook from \\"./Facebook/Facebook.svelte\\";\\r\\n  import Instagram from \\"./Instagram/Instagram.svelte\\";\\r\\n  import Linkedin from \\"./Linkedin/Linkedin.svelte\\";\\r\\n  import Twitter from \\"./Twitter/Twitter.svelte\\";\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"container\\">\\r\\n  <a\\r\\n    on:click={(e) => {\\r\\n      e.preventDefault();\\r\\n      window.open(\\"https://www.facebook.com/apeldesign/\\");\\r\\n    }}\\r\\n    href=\\"https://www.facebook.com/apeldesign/\\"\\r\\n  >\\r\\n    <Facebook />\\r\\n  </a>\\r\\n  <a\\r\\n    on:click={(e) => {\\r\\n      e.preventDefault();\\r\\n      window.open(\\"https://www.instagram.com/apeldesigninc/\\");\\r\\n    }}\\r\\n    href=\\"https://www.instagram.com/apeldesigninc/\\"><Instagram /></a\\r\\n  >\\r\\n  <a\\r\\n    on:click={(e) => {\\r\\n      e.preventDefault();\\r\\n      window.open(\\"https://www.linkedin.com/in/amit-apel-05373727\\");\\r\\n    }}\\r\\n    href=\\"https://www.linkedin.com/in/amit-apel-05373727\\"\\r\\n  >\\r\\n    <Linkedin /></a\\r\\n  >\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  position: fixed;\\n  z-index: 3;\\n  right: 40px;\\n  bottom: 25px;\\n  width: 15px;\\n  height: auto;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 18px;\\n  opacity: 60%;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmCmB,UAAU,cAAC,CAAC,AAC7B,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,CACT,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC"}'
};
const Socials = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$j);
  return `<div class="${"container svelte-l6eggz"}"><a href="${"https://www.facebook.com/apeldesign/"}">${validate_component(Facebook, "Facebook").$$render($$result, {}, {}, {})}</a>
  <a href="${"https://www.instagram.com/apeldesigninc/"}">${validate_component(Instagram, "Instagram").$$render($$result, {}, {}, {})}</a>
  <a href="${"https://www.linkedin.com/in/amit-apel-05373727"}">${validate_component(Linkedin, "Linkedin").$$render($$result, {}, {}, {})}</a>
</div>`;
});
var global = "";
var bulma_prefixed = "";
var Arrow_svelte_svelte_type_style_lang = "";
const css$i = {
  code: ".arrow.svelte-1d2wgtf{fill:white;transform:rotate(180deg)}.rotate.svelte-1d2wgtf{transform:rotate(0deg)}",
  map: `{"version":3,"file":"Arrow.svelte","sources":["Arrow.svelte"],"sourcesContent":["<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\\r\\n<script>\\r\\n\\texport let showMore;\\r\\n\\texport let styleP;\\r\\n\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass=\\"arrow {showMore ? 'rotate' : ''}\\"\\r\\n\\tversion=\\"1.1\\"\\r\\n\\tstyle={styleP}\\r\\n\\tid=\\"Layer_1\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n\\txmlns:xlink=\\"http://www.w3.org/1999/xlink\\"\\r\\n\\tx=\\"0px\\"\\r\\n\\ty=\\"0px\\"\\r\\n\\tviewBox=\\"0 0 330 330\\"\\r\\n\\txml:space=\\"preserve\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\tid=\\"XMLID_224_\\"\\r\\n\\t\\td=\\"M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394\\r\\n\\tl-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393\\r\\n\\tC307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z\\"\\r\\n\\t/>\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n\\t<g />\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">.arrow {\\n  fill: white;\\n  transform: rotate(180deg);\\n}\\n\\n.rotate {\\n  transform: rotate(0deg);\\n}</style>\\r\\n"],"names":[],"mappings":"AA0CmB,MAAM,eAAC,CAAC,AACzB,IAAI,CAAE,KAAK,CACX,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,OAAO,eAAC,CAAC,AACP,SAAS,CAAE,OAAO,IAAI,CAAC,AACzB,CAAC"}`
};
const Arrow = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { showMore } = $$props;
  let { styleP } = $$props;
  if ($$props.showMore === void 0 && $$bindings.showMore && showMore !== void 0)
    $$bindings.showMore(showMore);
  if ($$props.styleP === void 0 && $$bindings.styleP && styleP !== void 0)
    $$bindings.styleP(styleP);
  $$result.css.add(css$i);
  return `


<svg class="${"arrow " + escape(showMore ? "rotate" : "") + " svelte-1d2wgtf"}" version="${"1.1"}"${add_attribute("style", styleP, 0)} id="${"Layer_1"}" xmlns="${"http://www.w3.org/2000/svg"}" xmlns:xlink="${"http://www.w3.org/1999/xlink"}" x="${"0px"}" y="${"0px"}" viewBox="${"0 0 330 330"}" xml:space="${"preserve"}"><path id="${"XMLID_224_"}" d="${"M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394\r\n	l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393\r\n	C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z"}"></path><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>`;
});
var CarouselThumbs_svelte_svelte_type_style_lang = "";
const css$h = {
  code: ".selected.svelte-1o8acu1.svelte-1o8acu1{border:1px solid white}.image-container.svelte-1o8acu1.svelte-1o8acu1{width:25px;height:25px;border-radius:50%;overflow:hidden}.image-container.svelte-1o8acu1 img.svelte-1o8acu1{width:100%;height:100%;object-fit:cover;object-position:center center}.container.svelte-1o8acu1.svelte-1o8acu1{display:flex;margin:-7.5px}.container.svelte-1o8acu1 .image-container.svelte-1o8acu1{margin:7.5px}",
  map: `{"version":3,"file":"CarouselThumbs.svelte","sources":["CarouselThumbs.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { onMount } from \\"svelte\\";\\r\\n\\r\\n  import { lazyLoadInstance } from \\"../../lazy\\";\\r\\n\\r\\n  import { currentPage } from \\"../../stores\\";\\r\\n  import { createEventDispatcher } from \\"svelte\\";\\r\\n  export let page;\\r\\n  const dispatch = createEventDispatcher();\\r\\n  const images = [\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/1_wohazp.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/2_ntogjy.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/3_wv7c2m.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/4_kdlq6e.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/5_dbtnm5.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/6_h0qu9t.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/7_khodvl.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/8_gai2yo.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/9_webihd.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/10_ircdxh.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/11_pe8ndb.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/12_cnbadh.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/13_vn65ka.jpg\\",\\r\\n    \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/14_ndznnt.jpg\\",\\r\\n  ];\\r\\n  let imagesToDisplay = images\\r\\n    .map((img, i) => {\\r\\n      const obj = {\\r\\n        url: img,\\r\\n        page: i < 7 ? \\"left\\" : \\"right\\",\\r\\n        index: i,\\r\\n      };\\r\\n      return obj;\\r\\n    })\\r\\n    .filter((img) => {\\r\\n      return img.page === page;\\r\\n    });\\r\\n\\r\\n  onMount(() => {\\r\\n    lazyLoadInstance();\\r\\n  });\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n  style=\\"padding:{page === 'left'\\r\\n    ? '25px 7.5px 0px 0px'\\r\\n    : '25px 0px 0px 7.5px'};\\r\\n    float:{page === 'left' ? 'right' : 'left'};\\r\\n    \\"\\r\\n  class=\\"container\\"\\r\\n>\\r\\n  {#each imagesToDisplay as img, i}\\r\\n    {#if img}\\r\\n      <div\\r\\n        on:click={() => {\\r\\n          dispatch(\\"carousel-page\\", page === \\"left\\" ? i : i + 7);\\r\\n        }}\\r\\n        class:selected={$currentPage.page === img.index}\\r\\n        class=\\"image-container\\"\\r\\n      >\\r\\n        <img\\r\\n          class=\\"lazy\\"\\r\\n          width=\\"200px\\"\\r\\n          height=\\"200px\\"\\r\\n          data-src={img.url}\\r\\n          alt=\\"\\"\\r\\n        />;\\r\\n      </div>\\r\\n    {:else}\\r\\n      <div style=\\"background-color:black\\" class=\\"image-container\\" />\\r\\n    {/if}\\r\\n  {/each}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.selected {\\n  border: 1px solid white;\\n}\\n\\n.image-container {\\n  width: 25px;\\n  height: 25px;\\n  border-radius: 50%;\\n  overflow: hidden;\\n}\\n.image-container img {\\n  width: 100%;\\n  height: 100%;\\n  object-fit: cover;\\n  object-position: center center;\\n}\\n\\n.container {\\n  display: flex;\\n  margin: -7.5px;\\n}\\n.container .image-container {\\n  margin: 7.5px;\\n}</style>\\r\\n"],"names":[],"mappings":"AA0EmB,SAAS,8BAAC,CAAC,AAC5B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AACzB,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,+BAAgB,CAAC,GAAG,eAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,eAAe,CAAE,MAAM,CAAC,MAAM,AAChC,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,MAAM,AAChB,CAAC,AACD,yBAAU,CAAC,gBAAgB,eAAC,CAAC,AAC3B,MAAM,CAAE,KAAK,AACf,CAAC"}`
};
const CarouselThumbs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentPage, $$unsubscribe_currentPage;
  $$unsubscribe_currentPage = subscribe(currentPage, (value) => $currentPage = value);
  let { page } = $$props;
  createEventDispatcher();
  const images2 = [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/1_wohazp.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/2_ntogjy.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/3_wv7c2m.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/4_kdlq6e.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/5_dbtnm5.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/6_h0qu9t.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/7_khodvl.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/8_gai2yo.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/9_webihd.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/10_ircdxh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/11_pe8ndb.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/12_cnbadh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/13_vn65ka.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/14_ndznnt.jpg"
  ];
  let imagesToDisplay = images2.map((img, i) => {
    const obj = {
      url: img,
      page: i < 7 ? "left" : "right",
      index: i
    };
    return obj;
  }).filter((img) => {
    return img.page === page;
  });
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$h);
  $$unsubscribe_currentPage();
  return `<div style="${"padding:" + escape(page === "left" ? "25px 7.5px 0px 0px" : "25px 0px 0px 7.5px") + "; float:" + escape(page === "left" ? "right" : "left") + ";"}" class="${"container svelte-1o8acu1"}">${each(imagesToDisplay, (img, i) => `${img ? `<div class="${[
    "image-container svelte-1o8acu1",
    $currentPage.page === img.index ? "selected" : ""
  ].join(" ").trim()}"><img class="${"lazy svelte-1o8acu1"}" width="${"200px"}" height="${"200px"}"${add_attribute("data-src", img.url, 0)} alt="${""}">;
      </div>` : `<div style="${"background-color:black"}" class="${"image-container svelte-1o8acu1"}"></div>`}`)}
</div>`;
});
var CarouselRenders_svelte_svelte_type_style_lang = "";
const css$g = {
  code: ".indicator.svelte-1g7h3l7.svelte-1g7h3l7{top:5px;z-index:4;font-weight:600;text-align:center;letter-spacing:0.2em;right:5px;position:absolute;padding:5px 15px;border-radius:14px;background-color:black;color:white;display:flex;justify-content:center}.indicator.svelte-1g7h3l7 p.svelte-1g7h3l7{margin-right:-0.2em}.title-container.svelte-1g7h3l7.svelte-1g7h3l7{text-align:right;color:white}.title-container.svelte-1g7h3l7 h1.svelte-1g7h3l7{font-size:3em;text-transform:uppercase;font-family:Orator;color:white}.title-left.svelte-1g7h3l7.svelte-1g7h3l7{padding:20px 0 20px 20px}.title-right.svelte-1g7h3l7.svelte-1g7h3l7{text-align:left;padding:20px 20px 20px 0px}.content-container.svelte-1g7h3l7.svelte-1g7h3l7{display:flex;height:100vh;overflow:hidden;flex-direction:column;align-items:flex-end;justify-content:center}.content-container-left.svelte-1g7h3l7.svelte-1g7h3l7{padding:10px 0 10px 30px}.content-container-right.svelte-1g7h3l7.svelte-1g7h3l7{padding:10px 30px 10px 0px;align-items:flex-start}.carousel-content-container.svelte-1g7h3l7.svelte-1g7h3l7{max-width:38vw;width:100%;height:100%;align-items:flex-end;display:flex;flex-direction:column;justify-content:center}.carousel-content-container-right.svelte-1g7h3l7.svelte-1g7h3l7{align-items:flex-start}.slide-image-container.svelte-1g7h3l7.svelte-1g7h3l7{position:relative;width:100%;height:100%}.slide-image-container.svelte-1g7h3l7 img.svelte-1g7h3l7{position:absolute;height:100%;width:100%}.glide__track.svelte-1g7h3l7.svelte-1g7h3l7{height:100%}.page-arrow-container.svelte-1g7h3l7.svelte-1g7h3l7{width:30px;height:30px;position:absolute;left:10px;bottom:0;top:50%;border-radius:50%;background-color:rgba(0, 0, 0, 0.5);border:none;overflow:hidden}.page-arrow-container.svelte-1g7h3l7 .page-arrow-relative.svelte-1g7h3l7{position:absolute;top:0;left:0;bottom:0;padding:5px;margin:auto}.page-arrow-container-right.svelte-1g7h3l7.svelte-1g7h3l7{right:10px;left:auto}.glide__slides.svelte-1g7h3l7.svelte-1g7h3l7{height:100%}.carousel-container.svelte-1g7h3l7.svelte-1g7h3l7{width:100%;height:70vh;display:flex;position:relative}",
  map: '{"version":3,"file":"CarouselRenders.svelte","sources":["CarouselRenders.svelte"],"sourcesContent":["<script>\\r\\n  import Glide from \\"@glidejs/glide\\";\\r\\n  import { onMount } from \\"svelte\\";\\r\\n  import { currentPage } from \\"../../stores\\";\\r\\n  import Arrow from \\"../Card/Arrow.svelte\\";\\r\\n  import CarouselThumbs from \\"../CarouselThumbs/CarouselThumbs.svelte\\";\\r\\n  import { images } from \\"../image\\";\\r\\n  export let page;\\r\\n  let carousel;\\r\\n  let glide;\\r\\n\\r\\n  onMount(() => {\\r\\n    glide = new Glide(carousel, {\\r\\n      dragThreshold: false,\\r\\n    });\\r\\n    glide.mount();\\r\\n  });\\r\\n\\r\\n  $: {\\r\\n    if (glide) {\\r\\n      glide.go(`=${$currentPage.page}`);\\r\\n    }\\r\\n  }\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n  <div class=\\"content-container content-container-{page}\\">\\r\\n    <div class=\\"carousel-content-container carousel-content-container-{page}\\">\\r\\n      <div class=\\"title-container title-{page}\\">\\r\\n        <h1>{page === \\"left\\" ? \\"ren\\" : \\"ders\\"}</h1>\\r\\n        <p>\\r\\n          {page === \\"left\\"\\r\\n            ? \\"Browse below for interior and ext\\"\\r\\n            : \\"erior renders of Maliview Estates.\\"}\\r\\n        </p>\\r\\n      </div>\\r\\n      <div class=\\"carousel-container\\">\\r\\n        {#if glide && page === \\"right\\"}\\r\\n          <div class=\\"indicator {page}\\">\\r\\n            {#if glide}\\r\\n              <p>\\r\\n                {$currentPage.page + 1}/{images.length / 2}\\r\\n              </p>\\r\\n            {/if}\\r\\n          </div>\\r\\n        {/if}\\r\\n        <div\\r\\n          bind:this={carousel}\\r\\n          data-glide-dir={`${$currentPage.page}`}\\r\\n          class=\\"glide \\"\\r\\n        >\\r\\n          <div class=\\"glide__track\\" data-glide-el=\\"track\\">\\r\\n            <ul class=\\"glide__slides\\">\\r\\n              {#each images.slice(page === \\"left\\" ? 0 : 14, page === \\"left\\" ? 14 : 28) as img, i}\\r\\n                <li class=\\"glide__slide\\">\\r\\n                  <div class=\\"slide-image-container\\">\\r\\n                    <img\\r\\n                      loading=\\"lazy\\"\\r\\n                      class=\\"carousel-image lazy\\"\\r\\n                      src={img}\\r\\n                      alt=\\"\\"\\r\\n                    />\\r\\n                  </div>\\r\\n                </li>\\r\\n              {/each}\\r\\n            </ul>\\r\\n          </div>\\r\\n        </div>\\r\\n        <button\\r\\n          on:click={() => {\\r\\n            currentPage.setPage(page === \\"left\\" ? -1 : 1);\\r\\n          }}\\r\\n          class=\\"page-arrow-container page-arrow-container-{page}\\"\\r\\n        >\\r\\n          <div class=\\"page-arrow-relative page-arrow-relative\\">\\r\\n            <Arrow\\r\\n              styleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate({page ===\\r\\n              \'left\'\\r\\n                ? \'-90deg\'\\r\\n                : \'90deg\'}); height:100%; \\"\\r\\n            />\\r\\n          </div>\\r\\n        </button>\\r\\n      </div>\\r\\n\\r\\n      <CarouselThumbs\\r\\n        on:carousel-page={(e) => {\\r\\n          const page = e.detail;\\r\\n          currentPage.update((s) => {\\r\\n            s.page = page;\\r\\n            return s;\\r\\n          });\\r\\n        }}\\r\\n        {page}\\r\\n      />\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.indicator {\\n  top: 5px;\\n  z-index: 4;\\n  font-weight: 600;\\n  text-align: center;\\n  letter-spacing: 0.2em;\\n  right: 5px;\\n  position: absolute;\\n  padding: 5px 15px;\\n  border-radius: 14px;\\n  background-color: black;\\n  color: white;\\n  display: flex;\\n  justify-content: center;\\n}\\n.indicator p {\\n  margin-right: -0.2em;\\n}\\n\\n.title-container {\\n  text-align: right;\\n  color: white;\\n}\\n.title-container h1 {\\n  font-size: 3em;\\n  text-transform: uppercase;\\n  font-family: Orator;\\n  color: white;\\n}\\n\\n.title-left {\\n  padding: 20px 0 20px 20px;\\n}\\n\\n.title-right {\\n  text-align: left;\\n  padding: 20px 20px 20px 0px;\\n}\\n\\n.content-container {\\n  display: flex;\\n  height: 100vh;\\n  overflow: hidden;\\n  flex-direction: column;\\n  align-items: flex-end;\\n  justify-content: center;\\n}\\n\\n.content-container-left {\\n  padding: 10px 0 10px 30px;\\n}\\n\\n.content-container-right {\\n  padding: 10px 30px 10px 0px;\\n  align-items: flex-start;\\n}\\n\\n.carousel-content-container {\\n  max-width: 38vw;\\n  width: 100%;\\n  height: 100%;\\n  align-items: flex-end;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n}\\n\\n.carousel-content-container-right {\\n  align-items: flex-start;\\n}\\n\\n.slide-image-container {\\n  position: relative;\\n  width: 100%;\\n  height: 100%;\\n}\\n.slide-image-container img {\\n  position: absolute;\\n  height: 100%;\\n  width: 100%;\\n}\\n\\n.glide__track {\\n  height: 100%;\\n}\\n\\n.page-arrow-container {\\n  width: 30px;\\n  height: 30px;\\n  position: absolute;\\n  left: 10px;\\n  bottom: 0;\\n  top: 50%;\\n  border-radius: 50%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: none;\\n  overflow: hidden;\\n}\\n.page-arrow-container .page-arrow-relative {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  bottom: 0;\\n  padding: 5px;\\n  margin: auto;\\n}\\n\\n.page-arrow-container-right {\\n  right: 10px;\\n  left: auto;\\n}\\n\\n.glide__slides {\\n  height: 100%;\\n}\\n\\n.carousel-container {\\n  width: 100%;\\n  height: 70vh;\\n  display: flex;\\n  position: relative;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmGmB,UAAU,8BAAC,CAAC,AAC7B,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,KAAK,CACrB,KAAK,CAAE,GAAG,CACV,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,yBAAU,CAAC,CAAC,eAAC,CAAC,AACZ,YAAY,CAAE,MAAM,AACtB,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,KAAK,AACd,CAAC,AACD,+BAAgB,CAAC,EAAE,eAAC,CAAC,AACnB,SAAS,CAAE,GAAG,CACd,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,OAAO,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,AAC3B,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,GAAG,AAC7B,CAAC,AAED,kBAAkB,8BAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,CACb,QAAQ,CAAE,MAAM,CAChB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,QAAQ,CACrB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,uBAAuB,8BAAC,CAAC,AACvB,OAAO,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,AAC3B,CAAC,AAED,wBAAwB,8BAAC,CAAC,AACxB,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,GAAG,CAC3B,WAAW,CAAE,UAAU,AACzB,CAAC,AAED,2BAA2B,8BAAC,CAAC,AAC3B,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,QAAQ,CACrB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,iCAAiC,8BAAC,CAAC,AACjC,WAAW,CAAE,UAAU,AACzB,CAAC,AAED,sBAAsB,8BAAC,CAAC,AACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,qCAAsB,CAAC,GAAG,eAAC,CAAC,AAC1B,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,AACb,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,MAAM,CAAE,IAAI,AACd,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,IAAI,CACV,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,GAAG,CACR,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,oCAAqB,CAAC,oBAAoB,eAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AAED,2BAA2B,8BAAC,CAAC,AAC3B,KAAK,CAAE,IAAI,CACX,IAAI,CAAE,IAAI,AACZ,CAAC,AAED,cAAc,8BAAC,CAAC,AACd,MAAM,CAAE,IAAI,AACd,CAAC,AAED,mBAAmB,8BAAC,CAAC,AACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,AACpB,CAAC"}'
};
const CarouselRenders = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentPage, $$unsubscribe_currentPage;
  $$unsubscribe_currentPage = subscribe(currentPage, (value) => $currentPage = value);
  let { page } = $$props;
  let carousel;
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$g);
  $$unsubscribe_currentPage();
  return `<div class="${"page"}"><div class="${"content-container content-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"carousel-content-container carousel-content-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"title-container title-" + escape(page) + " svelte-1g7h3l7"}"><h1 class="${"svelte-1g7h3l7"}">${escape(page === "left" ? "ren" : "ders")}</h1>
        <p class="${"svelte-1g7h3l7"}">${escape(page === "left" ? "Browse below for interior and ext" : "erior renders of Maliview Estates.")}</p></div>
      <div class="${"carousel-container svelte-1g7h3l7"}">${``}
        <div${add_attribute("data-glide-dir", `${$currentPage.page}`, 0)} class="${"glide "}"${add_attribute("this", carousel, 0)}><div class="${"glide__track svelte-1g7h3l7"}" data-glide-el="${"track"}"><ul class="${"glide__slides svelte-1g7h3l7"}">${each(images$1.slice(page === "left" ? 0 : 14, page === "left" ? 14 : 28), (img, i) => `<li class="${"glide__slide"}"><div class="${"slide-image-container svelte-1g7h3l7"}"><img loading="${"lazy"}" class="${"carousel-image lazy svelte-1g7h3l7"}"${add_attribute("src", img, 0)} alt="${""}"></div>
                </li>`)}</ul></div></div>
        <button class="${"page-arrow-container page-arrow-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"page-arrow-relative page-arrow-relative svelte-1g7h3l7"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(" + (page === "left" ? "-90deg" : "90deg") + "); height:100%; "
  }, {}, {})}</div></button></div>

      ${validate_component(CarouselThumbs, "CarouselThumbs").$$render($$result, { page }, {}, {})}</div></div>
</div>`;
});
var ContactUs_svelte_svelte_type_style_lang = "";
const css$f = {
  code: ".success-message.svelte-15wztcz.svelte-15wztcz{color:white}.bu-button.svelte-15wztcz.svelte-15wztcz{background-color:#a4632e}.form-container.svelte-15wztcz.svelte-15wztcz{width:100%;max-width:500px}.form-container.svelte-15wztcz .bu-field.svelte-15wztcz{margin:15px}.form-container.svelte-15wztcz .bu-field .svelte-15wztcz::placeholder{color:black;font-size:0.8em;opacity:0.5}.container.svelte-15wztcz.svelte-15wztcz{width:100%;height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column}h5.svelte-15wztcz.svelte-15wztcz{text-transform:uppercase;color:white;font-family:Orator}",
  map: `{"version":3,"file":"ContactUs.svelte","sources":["ContactUs.svelte"],"sourcesContent":["<script>\\r\\n  let form;\\r\\n  let submitted = false;\\r\\n  const handleSubmit = (e) => {\\r\\n    e.preventDefault();\\r\\n\\r\\n    let formData = new FormData(form);\\r\\n    fetch(\\"/\\", {\\r\\n      method: \\"POST\\",\\r\\n      headers: { \\"Content-Type\\": \\"application/x-www-form-urlencoded\\" },\\r\\n      body: new URLSearchParams(formData).toString(),\\r\\n    })\\r\\n      .then(() => {\\r\\n        submitted = true;\\r\\n      })\\r\\n      .catch((error) => alert(error));\\r\\n  };\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"container\\">\\r\\n  <h5 class=\\"bu-is-size-1\\">contact</h5>\\r\\n  {#if !submitted}<form\\r\\n      bind:this={form}\\r\\n      name=\\"emailForm\\"\\r\\n      data-netlify=\\"true\\"\\r\\n      class=\\"form-container\\"\\r\\n    >\\r\\n      <input type=\\"hidden\\" name=\\"form-name\\" value=\\"emailForm\\" />\\r\\n\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"name-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"text\\"\\r\\n            name=\\"name\\"\\r\\n            placeholder=\\"Name\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"email-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"email\\"\\r\\n            name=\\"email\\"\\r\\n            placeholder=\\"Email\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"country-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"text\\"\\r\\n            name=\\"country\\"\\r\\n            placeholder=\\"Country\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"phone-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"phone\\"\\r\\n            name=\\"phone\\"\\r\\n            placeholder=\\"Phone\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <textarea\\r\\n            id=\\"message-input\\"\\r\\n            class=\\"bu-textarea\\"\\r\\n            type=\\"text\\"\\r\\n            name=\\"message\\"\\r\\n            placeholder=\\"Message\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            on:click={handleSubmit}\\r\\n            type=\\"submit\\"\\r\\n            class=\\"bu-button bu-is-link bu-is-fullwidth\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n    </form>\\r\\n  {:else}\\r\\n    <p class=\\"success-message\\">Thanks! We'll get back to you shortly.</p>\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.success-message {\\n  color: white;\\n}\\n\\n.bu-button {\\n  background-color: #a4632e;\\n}\\n\\n.form-container {\\n  width: 100%;\\n  max-width: 500px;\\n}\\n.form-container .bu-field {\\n  margin: 15px;\\n}\\n.form-container .bu-field ::placeholder {\\n  /* Chrome, Firefox, Opera, Safari 10.1+ */\\n  color: black;\\n  font-size: 0.8em;\\n  opacity: 0.5;\\n  /* Firefox */\\n}\\n\\n.container {\\n  width: 100%;\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n  flex-direction: column;\\n}\\n\\nh5 {\\n  text-transform: uppercase;\\n  color: white;\\n  font-family: Orator;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmGmB,gBAAgB,8BAAC,CAAC,AACnC,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,8BAAe,CAAC,SAAS,eAAC,CAAC,AACzB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,8BAAe,CAAC,SAAS,gBAAC,aAAa,AAAC,CAAC,AAEvC,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,GAAG,AAEd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,cAAc,CAAE,MAAM,AACxB,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,cAAc,CAAE,SAAS,CACzB,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,MAAM,AACrB,CAAC"}`
};
const ContactUs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let form;
  $$result.css.add(css$f);
  return `<div class="${"container svelte-15wztcz"}"><h5 class="${"bu-is-size-1 svelte-15wztcz"}">contact</h5>
  ${`<form name="${"emailForm"}" data-netlify="${"true"}" class="${"form-container svelte-15wztcz"}"${add_attribute("this", form, 0)}><input type="${"hidden"}" name="${"form-name"}" value="${"emailForm"}" class="${"svelte-15wztcz"}">

      <div class="${"bu-field svelte-15wztcz"}"><div class="${"bu-control svelte-15wztcz"}"><input id="${"name-input"}" class="${"bu-input svelte-15wztcz"}" type="${"text"}" name="${"name"}" placeholder="${"Name"}"></div></div>
      <div class="${"bu-field svelte-15wztcz"}"><div class="${"bu-control svelte-15wztcz"}"><input id="${"email-input"}" class="${"bu-input svelte-15wztcz"}" type="${"email"}" name="${"email"}" placeholder="${"Email"}"></div></div>
      <div class="${"bu-field svelte-15wztcz"}"><div class="${"bu-control svelte-15wztcz"}"><input id="${"country-input"}" class="${"bu-input svelte-15wztcz"}" type="${"text"}" name="${"country"}" placeholder="${"Country"}"></div></div>
      <div class="${"bu-field svelte-15wztcz"}"><div class="${"bu-control svelte-15wztcz"}"><input id="${"phone-input"}" class="${"bu-input svelte-15wztcz"}" type="${"phone"}" name="${"phone"}" placeholder="${"Phone"}"></div></div>
      <div class="${"bu-field svelte-15wztcz"}"><div class="${"bu-control svelte-15wztcz"}"><textarea id="${"message-input"}" class="${"bu-textarea svelte-15wztcz"}" type="${"text"}" name="${"message"}" placeholder="${"Message"}"></textarea></div></div>
      <div class="${"bu-field svelte-15wztcz"}"><div class="${"bu-control svelte-15wztcz"}"><input type="${"submit"}" class="${"bu-button bu-is-link bu-is-fullwidth svelte-15wztcz"}"></div></div></form>`}
</div>`;
});
var Credits_svelte_svelte_type_style_lang = "";
const css$e = {
  code: '.container.svelte-y4i8f3.svelte-y4i8f3{width:50vw;height:100vh;display:flex;align-items:center;gap:2rem;color:white;font-family:Orator;overflow:hidden}.sub-container.svelte-y4i8f3.svelte-y4i8f3{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center}.title-container.svelte-y4i8f3.svelte-y4i8f3{width:100%;height:15%;margin-bottom:20px;display:flex;position:relative;font-size:3em}.svelte-y4i8f3.svelte-y4i8f3::-webkit-scrollbar{width:20px}.svelte-y4i8f3.svelte-y4i8f3::-webkit-scrollbar-track{background-color:transparent}.svelte-y4i8f3.svelte-y4i8f3::-webkit-scrollbar-thumb{background-color:#d6dee1;border-radius:20px;border:6px solid transparent;background-clip:content-box}.content-container.svelte-y4i8f3.svelte-y4i8f3{display:flex;overflow-y:auto;justify-content:center;align-items:center;width:fit-content;padding:10px;height:60%}.content-container.svelte-y4i8f3 .credits-container-sub.svelte-y4i8f3{height:100%}.content-container.svelte-y4i8f3 .credits-container.svelte-y4i8f3{font-size:1.3em;opacity:0;text-align:center;margin-bottom:1rem}.content-container.svelte-y4i8f3 .credits-container h5.svelte-y4i8f3{font-size:1em;margin-bottom:20px}@media(max-width: 1040px){.content-container.svelte-y4i8f3 .credits-container h5.svelte-y4i8f3{margin-bottom:10px;font-size:0.7em}}.content-container.svelte-y4i8f3 .credits-container p.svelte-y4i8f3{font-family:"Roboto", sans-serif;font-size:0.8em}@media(max-width: 1270px){.content-container.svelte-y4i8f3 .credits-container p.svelte-y4i8f3{font-size:0.6em}}',
  map: `{"version":3,"file":"Credits.svelte","sources":["Credits.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\r\\n\\timport { creditsContent } from '../../pageContent';\\r\\n\\timport { pagePositions, scrollContainers } from '../../stores';\\r\\n\\r\\n\\texport let page;\\r\\n\\tlet scrollContainer;\\r\\n\\tconst disableWheel = (e) => {\\r\\n\\t\\te.stopImmediatePropagation();\\r\\n\\t};\\r\\n\\tonMount(() => {\\r\\n\\t\\tscrollContainers.push(scrollContainer);\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n\\t<div\\r\\n\\t\\tclass=\\"container\\"\\r\\n\\t\\tstyle=\\"\\r\\n        justify-content: {page === 'left' ? 'flex-end' : 'flex-start'}\\r\\n      \\"\\r\\n\\t>\\r\\n\\t\\t<div style=\\"align-items:{page === 'left' ? 'flex-end' : 'flex-start'}\\" class=\\"sub-container\\">\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\tclass=\\"title-container\\"\\r\\n\\t\\t\\t\\tstyle=\\"\\r\\n        justify-content: {page === 'left' ? 'flex-end' : 'flex-start'}\\r\\n      \\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t{#if page === 'left'}<div class=\\"title-text-container\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>Developmen</h5>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t{:else}<div class=\\"title-text-container\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>t Credits</h5>\\r\\n\\t\\t\\t\\t\\t</div>{/if}\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\tbind:this={scrollContainer}\\r\\n\\t\\t\\t\\ton:scroll={(e) => {\\r\\n\\t\\t\\t\\t\\twindow.addEventListener('wheel', disableWheel);\\r\\n\\t\\t\\t\\t\\twindow.removeEventListener('wheel', disableWheel);\\r\\n\\t\\t\\t\\t}}\\r\\n\\t\\t\\t\\tclass=\\"content-container\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t{#if page === 'left'}\\r\\n\\t\\t\\t\\t\\t<div class=\\"credits-container-sub\\">\\r\\n\\t\\t\\t\\t\\t\\t{#each creditsContent.slice(0, 2) as credit}\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"credits-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<h5 class=\\"header\\">{credit.header}</h5>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{#each credit.paragraphs as p}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<p>{p}</p>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t{:else}<div class=\\"credits-container-sub\\">\\r\\n\\t\\t\\t\\t\\t\\t{#each creditsContent.slice(2, 6) as credit}\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"credits-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<h5 class=\\"header\\">{credit.header}</h5>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{#each credit.paragraphs as p}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<p>{p}</p>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t</div>{/if}\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  width: 50vw;\\n  height: 100vh;\\n  display: flex;\\n  align-items: center;\\n  gap: 2rem;\\n  color: white;\\n  font-family: Orator;\\n  overflow: hidden;\\n}\\n\\n.sub-container {\\n  width: 100%;\\n  height: 100%;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n}\\n\\n.title-container {\\n  width: 100%;\\n  height: 15%;\\n  margin-bottom: 20px;\\n  display: flex;\\n  position: relative;\\n  font-size: 3em;\\n}\\n.title-container img {\\n  object-fit: contain;\\n  width: 100%;\\n}\\n\\n::-webkit-scrollbar {\\n  width: 20px;\\n}\\n\\n::-webkit-scrollbar-track {\\n  background-color: transparent;\\n}\\n\\n::-webkit-scrollbar-thumb {\\n  background-color: #d6dee1;\\n  border-radius: 20px;\\n  border: 6px solid transparent;\\n  background-clip: content-box;\\n}\\n\\n.content-container {\\n  display: flex;\\n  overflow-y: auto;\\n  justify-content: center;\\n  align-items: center;\\n  width: fit-content;\\n  padding: 10px;\\n  height: 60%;\\n}\\n.content-container .credits-container-sub {\\n  height: 100%;\\n}\\n.content-container .credits-container {\\n  font-size: 1.3em;\\n  opacity: 0;\\n  text-align: center;\\n  margin-bottom: 1rem;\\n}\\n.content-container .credits-container h5 {\\n  font-size: 1em;\\n  margin-bottom: 20px;\\n}\\n@media (max-width: 1040px) {\\n  .content-container .credits-container h5 {\\n    margin-bottom: 10px;\\n    font-size: 0.7em;\\n  }\\n}\\n.content-container .credits-container p {\\n  font-family: \\"Roboto\\", sans-serif;\\n  font-size: 0.8em;\\n}\\n@media (max-width: 1270px) {\\n  .content-container .credits-container p {\\n    font-size: 0.6em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAuEmB,UAAU,4BAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,gBAAgB,4BAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,GAAG,AAChB,CAAC,4BAMD,mBAAmB,AAAC,CAAC,AACnB,KAAK,CAAE,IAAI,AACb,CAAC,4BAED,yBAAyB,AAAC,CAAC,AACzB,gBAAgB,CAAE,WAAW,AAC/B,CAAC,4BAED,yBAAyB,AAAC,CAAC,AACzB,gBAAgB,CAAE,OAAO,CACzB,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAC7B,eAAe,CAAE,WAAW,AAC9B,CAAC,AAED,kBAAkB,4BAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,CAChB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,WAAW,CAClB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,GAAG,AACb,CAAC,AACD,gCAAkB,CAAC,sBAAsB,cAAC,CAAC,AACzC,MAAM,CAAE,IAAI,AACd,CAAC,AACD,gCAAkB,CAAC,kBAAkB,cAAC,CAAC,AACrC,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,MAAM,CAClB,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,gCAAkB,CAAC,kBAAkB,CAAC,EAAE,cAAC,CAAC,AACxC,SAAS,CAAE,GAAG,CACd,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,gCAAkB,CAAC,kBAAkB,CAAC,EAAE,cAAC,CAAC,AACxC,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC,AACD,gCAAkB,CAAC,kBAAkB,CAAC,CAAC,cAAC,CAAC,AACvC,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,gCAAkB,CAAC,kBAAkB,CAAC,CAAC,cAAC,CAAC,AACvC,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC"}`
};
const Credits = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { page } = $$props;
  let scrollContainer;
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$e);
  return `<div class="${"page svelte-y4i8f3"}"><div class="${"container svelte-y4i8f3"}" style="${"justify-content: " + escape(page === "left" ? "flex-end" : "flex-start") + ""}"><div style="${"align-items:" + escape(page === "left" ? "flex-end" : "flex-start")}" class="${"sub-container svelte-y4i8f3"}"><div class="${"title-container svelte-y4i8f3"}" style="${"justify-content: " + escape(page === "left" ? "flex-end" : "flex-start") + ""}">${page === "left" ? `<div class="${"title-text-container svelte-y4i8f3"}"><h5 class="${"svelte-y4i8f3"}">Developmen</h5></div>` : `<div class="${"title-text-container svelte-y4i8f3"}"><h5 class="${"svelte-y4i8f3"}">t Credits</h5></div>`}</div>
			<div class="${"content-container svelte-y4i8f3"}"${add_attribute("this", scrollContainer, 0)}>${page === "left" ? `<div class="${"credits-container-sub svelte-y4i8f3"}">${each(creditsContent.slice(0, 2), (credit) => `<div class="${"credits-container svelte-y4i8f3"}"><h5 class="${"header svelte-y4i8f3"}">${escape(credit.header)}</h5>
								${each(credit.paragraphs, (p) => `<p class="${"svelte-y4i8f3"}">${escape(p)}</p>`)}
							</div>`)}</div>` : `<div class="${"credits-container-sub svelte-y4i8f3"}">${each(creditsContent.slice(2, 6), (credit) => `<div class="${"credits-container svelte-y4i8f3"}"><h5 class="${"header svelte-y4i8f3"}">${escape(credit.header)}</h5>
								${each(credit.paragraphs, (p) => `<p class="${"svelte-y4i8f3"}">${escape(p)}</p>`)}
							</div>`)}</div>`}</div></div></div>
</div>`;
});
const galleryImg = writable({
  currPhase: "phase 1",
  index: 0
});
var GalleryPreview_svelte_svelte_type_style_lang = "";
const css$d = {
  code: ".image-container.svelte-cfqce8.svelte-cfqce8{height:100%;padding-right:5px}.image-container.svelte-cfqce8 img.svelte-cfqce8{height:100%;object-fit:cover;width:100%}",
  map: '{"version":3,"file":"GalleryPreview.svelte","sources":["GalleryPreview.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { highResBts } from \\"../../pageContent\\";\\r\\n  import { galleryImg } from \\"./store\\";\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n  <div class=\\"image-container\\">\\r\\n    <img\\r\\n      loading=\\"lazy\\"\\r\\n      src={highResBts[$galleryImg.currPhase][$galleryImg.index]}\\r\\n      alt=\\"\\"\\r\\n    />\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.image-container {\\n  height: 100%;\\n  padding-right: 5px;\\n}\\n.image-container img {\\n  height: 100%;\\n  object-fit: cover;\\n  width: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AAemB,gBAAgB,4BAAC,CAAC,AACnC,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,8BAAgB,CAAC,GAAG,cAAC,CAAC,AACpB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,IAAI,AACb,CAAC"}'
};
const GalleryPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  $$result.css.add(css$d);
  $$unsubscribe_galleryImg();
  return `<div class="${"page"}"><div class="${"image-container svelte-cfqce8"}"><img loading="${"lazy"}"${add_attribute("src", highResBts[$galleryImg.currPhase][$galleryImg.index], 0)} alt="${""}" class="${"svelte-cfqce8"}"></div>
</div>`;
});
var ImagePage_svelte_svelte_type_style_lang = "";
const css$c = {
  code: '.blur.svelte-1aqh5gk.svelte-1aqh5gk{left:0;right:0;z-index:0;position:relative}.blur.svelte-1aqh5gk.svelte-1aqh5gk::before{pointer-events:none;position:absolute;content:"";height:100%;display:block;left:0;right:0;top:0;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)){.blur.svelte-1aqh5gk.svelte-1aqh5gk::before{background:rgba(0, 0, 0, 0.5)}}.image-container.svelte-1aqh5gk.svelte-1aqh5gk{height:100%}.image-container.svelte-1aqh5gk .main-image.svelte-1aqh5gk{width:100%;object-fit:cover;height:100%}.play-button.svelte-1aqh5gk.svelte-1aqh5gk{position:absolute;width:160px;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:auto;z-index:5;object-fit:cover}',
  map: `{"version":3,"file":"ImagePage.svelte","sources":["ImagePage.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { modal } from \\"../../stores\\";\\r\\n  import { afterUpdate, beforeUpdate, onMount } from \\"svelte\\";\\r\\n  import { lazy } from \\"../../lazy.js\\";\\r\\n  export let index;\\r\\n  const images = [\\r\\n    {\\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg1_lcs2gw.jpg\\",\\r\\n    },\\r\\n    {\\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg2_oyi2w7.jpg\\",\\r\\n    },\\r\\n\\r\\n    {\\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg\\",\\r\\n    },\\r\\n    {\\r\\n      videoUrl: \\"https://www.youtube.com/embed/nTS10ZQM5Ms\\",\\r\\n      type: \\"video\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg4_ma0d9j.jpg\\",\\r\\n    },\\r\\n    {\\r\\n      videoUrl: \\"https://www.youtube.com/embed/l7h2P07cSbc\\",\\r\\n      type: \\"video\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790322/misc/bgPhotos/drone_s8lkqw.png\\",\\r\\n    },\\r\\n    {\\r\\n \\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631751013/ContactUs/54d3f4_28add3e68eb94ebc8675416c21360ddf_mv2_n5evlp.jpg\\",\\r\\n    },\\r\\n  ];\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n  on:click={() => {\\r\\n    if (images[index].type === \\"video\\") {\\r\\n      $modal.visibility = true;\\r\\n      $modal.content = images[index].videoUrl;\\r\\n      $modal.type = \\"video\\";\\r\\n    }\\r\\n  }}\\r\\n  class=\\"page\\"\\r\\n>\\r\\n  <div class=\\"image-container {images[index].type === 'video' ? 'blur' : ''} \\">\\r\\n    {#if images[index].type === \\"video\\"}\\r\\n      <img\\r\\n        alt=\\"\\"\\r\\n        src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/playButton_rbgj1t.png\\"\\r\\n        class=\\"play-button\\"\\r\\n      />\\r\\n    {/if}\\r\\n\\r\\n    <img data-src={images[index].url} alt=\\"\\" class=\\"main-image lazy\\" />\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.blur {\\n  left: 0;\\n  right: 0;\\n  z-index: 0;\\n  position: relative;\\n}\\n.blur::before {\\n  pointer-events: none;\\n  position: absolute;\\n  content: \\"\\";\\n  height: 100%;\\n  display: block;\\n  left: 0;\\n  right: 0;\\n  top: 0;\\n  -webkit-backdrop-filter: blur(5px);\\n  backdrop-filter: blur(5px);\\n}\\n@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {\\n  .blur::before {\\n    background: rgba(0, 0, 0, 0.5);\\n  }\\n}\\n\\n.image-container {\\n  height: 100%;\\n}\\n.image-container .main-image {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n}\\n\\n.play-button {\\n  position: absolute;\\n  width: 160px;\\n  position: absolute;\\n  top: 50%;\\n  /* position the top  edge of the element at the middle of the parent */\\n  left: 50%;\\n  /* position the left edge of the element at the middle of the parent */\\n  transform: translate(-50%, -50%);\\n  height: auto;\\n  z-index: 5;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkEmB,KAAK,8BAAC,CAAC,AACxB,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,mCAAK,QAAQ,AAAC,CAAC,AACb,cAAc,CAAE,IAAI,CACpB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,KAAK,CACd,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,GAAG,CAAE,CAAC,CACN,uBAAuB,CAAE,KAAK,GAAG,CAAC,CAClC,eAAe,CAAE,KAAK,GAAG,CAAC,AAC5B,CAAC,AACD,UAAU,GAAG,CAAC,CAAC,CAAC,yBAAyB,IAAI,CAAC,CAAC,EAAE,CAAC,CAAC,iBAAiB,IAAI,CAAC,CAAC,AAAC,CAAC,AAC1E,mCAAK,QAAQ,AAAC,CAAC,AACb,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AAChC,CAAC,AACH,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,+BAAgB,CAAC,WAAW,eAAC,CAAC,AAC5B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CAER,IAAI,CAAE,GAAG,CAET,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,KAAK,AACnB,CAAC"}`
};
const ImagePage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { index: index2 } = $$props;
  const images2 = [
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg1_lcs2gw.jpg"
    },
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg2_oyi2w7.jpg"
    },
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg"
    },
    {
      videoUrl: "https://www.youtube.com/embed/nTS10ZQM5Ms",
      type: "video",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg4_ma0d9j.jpg"
    },
    {
      videoUrl: "https://www.youtube.com/embed/l7h2P07cSbc",
      type: "video",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790322/misc/bgPhotos/drone_s8lkqw.png"
    },
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1631751013/ContactUs/54d3f4_28add3e68eb94ebc8675416c21360ddf_mv2_n5evlp.jpg"
    }
  ];
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  $$result.css.add(css$c);
  $$unsubscribe_modal();
  return `<div class="${"page"}"><div class="${"image-container " + escape(images2[index2].type === "video" ? "blur" : "") + " svelte-1aqh5gk"}">${images2[index2].type === "video" ? `<img alt="${""}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/playButton_rbgj1t.png"}" class="${"play-button svelte-1aqh5gk"}">` : ``}

    <img${add_attribute("data-src", images2[index2].url, 0)} alt="${""}" class="${"main-image lazy svelte-1aqh5gk"}"></div>
</div>`;
});
var TextPage_svelte_svelte_type_style_lang = "";
const css$b = {
  code: ".container.svelte-1wjvxy1.svelte-1wjvxy1{margin:auto;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;height:100%}@media(max-width: 1400px){.container.svelte-1wjvxy1.svelte-1wjvxy1{padding:30px;max-width:100%}.container.svelte-1wjvxy1 .text-content.svelte-1wjvxy1{width:100%;max-width:100%}}.container.svelte-1wjvxy1 .header.svelte-1wjvxy1{text-transform:uppercase;color:white}@media(max-width: 650px){.container.svelte-1wjvxy1.svelte-1wjvxy1{width:100%;height:100%;display:none}}@media(max-width: 950px){.container.svelte-1wjvxy1 .text-content.svelte-1wjvxy1{padding-top:67px}}.text-content.svelte-1wjvxy1.svelte-1wjvxy1{max-width:50%;display:flex;flex-direction:column;width:100%;overflow:hidden}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1{height:100%;overflow:auto}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar{width:20px}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar-track{background-color:transparent}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar-thumb{background-color:#d6dee1;border-radius:20px;border:6px solid transparent;background-clip:content-box}",
  map: '{"version":3,"file":"TextPage.svelte","sources":["TextPage.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { onMount } from \\"svelte\\";\\r\\n\\r\\n  import { textPages } from \\"../../pageContent\\";\\r\\n  import { scrollContainers } from \\"../../stores\\";\\r\\n\\r\\n  export let index;\\r\\n  export let bgColor;\\r\\n  let scrollContainer;\\r\\n  const disableWheel = (e) => {\\r\\n    e.stopImmediatePropagation();\\r\\n  };\\r\\n  onMount(() => {\\r\\n    scrollContainers.push(scrollContainer);\\r\\n  });\\r\\n<\/script>\\r\\n\\r\\n<div style=\\"background-color: {bgColor};\\" class=\\"page container\\">\\r\\n  <div class=\\"text-content\\">\\r\\n    <div class=\\"bu-content bu-is-large\\">\\r\\n      <h3 class=\\"header bu-content-header \\">\\r\\n        {textPages[index].header}\\r\\n      </h3>\\r\\n    </div>\\r\\n    <div bind:this={scrollContainer} class=\\"bu-content text-container\\">\\r\\n      <div class=\\"scroll-container-text\\">\\r\\n        <div class=\\"text-p-container\\">\\r\\n          {#each textPages[index].paragraphs as text, i}\\r\\n            <p key={i} class=\\"$1\\">\\r\\n              {text}\\r\\n            </p>\\r\\n          {/each}\\r\\n        </div>\\r\\n      </div>\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  margin: auto;\\n  overflow: hidden;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n  align-items: center;\\n  color: white;\\n  height: 100%;\\n}\\n@media (max-width: 1400px) {\\n  .container {\\n    padding: 30px;\\n    max-width: 100%;\\n  }\\n  .container .text-content {\\n    width: 100%;\\n    max-width: 100%;\\n  }\\n}\\n.container .header {\\n  text-transform: uppercase;\\n  color: white;\\n}\\n@media (max-width: 650px) {\\n  .container {\\n    width: 100%;\\n    height: 100%;\\n    display: none;\\n  }\\n}\\n@media (max-width: 950px) {\\n  .container .text-content {\\n    padding-top: 67px;\\n  }\\n}\\n\\n.text-content {\\n  max-width: 50%;\\n  display: flex;\\n  flex-direction: column;\\n  width: 100%;\\n  overflow: hidden;\\n}\\n.text-content .text-container {\\n  height: 100%;\\n  overflow: auto;\\n}\\n.text-content .text-container::-webkit-scrollbar {\\n  width: 20px;\\n}\\n.text-content .text-container::-webkit-scrollbar-track {\\n  background-color: transparent;\\n}\\n.text-content .text-container::-webkit-scrollbar-thumb {\\n  background-color: #d6dee1;\\n  border-radius: 20px;\\n  border: 6px solid transparent;\\n  background-clip: content-box;\\n}</style>\\r\\n"],"names":[],"mappings":"AAsCmB,UAAU,8BAAC,CAAC,AAC7B,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,yBAAU,CAAC,OAAO,eAAC,CAAC,AAClB,cAAc,CAAE,SAAS,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,WAAW,CAAE,IAAI,AACnB,CAAC,AACH,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,SAAS,CAAE,GAAG,CACd,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,4BAAa,CAAC,eAAe,eAAC,CAAC,AAC7B,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,IAAI,AAChB,CAAC,AACD,4BAAa,CAAC,8BAAe,mBAAmB,AAAC,CAAC,AAChD,KAAK,CAAE,IAAI,AACb,CAAC,AACD,4BAAa,CAAC,8BAAe,yBAAyB,AAAC,CAAC,AACtD,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AACD,4BAAa,CAAC,8BAAe,yBAAyB,AAAC,CAAC,AACtD,gBAAgB,CAAE,OAAO,CACzB,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAC7B,eAAe,CAAE,WAAW,AAC9B,CAAC"}'
};
const TextPage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { index: index2 } = $$props;
  let { bgColor } = $$props;
  let scrollContainer;
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.bgColor === void 0 && $$bindings.bgColor && bgColor !== void 0)
    $$bindings.bgColor(bgColor);
  $$result.css.add(css$b);
  return `<div style="${"background-color: " + escape(bgColor) + ";"}" class="${"page container svelte-1wjvxy1"}"><div class="${"text-content svelte-1wjvxy1"}"><div class="${"bu-content bu-is-large"}"><h3 class="${"header bu-content-header  svelte-1wjvxy1"}">${escape(textPages[index2].header)}</h3></div>
    <div class="${"bu-content text-container svelte-1wjvxy1"}"${add_attribute("this", scrollContainer, 0)}><div class="${"scroll-container-text"}"><div class="${"text-p-container"}">${each(textPages[index2].paragraphs, (text, i) => `<p${add_attribute("key", i, 0)} class="${"$1"}">${escape(text)}
            </p>`)}</div></div></div></div>
</div>`;
});
var LeftContainer_svelte_svelte_type_style_lang = "";
const css$a = {
  code: ".bg-image-container.svelte-x4nibx.svelte-x4nibx{width:100%;height:100%;position:absolute;z-index:1}.bg-image-container.svelte-x4nibx .bg-image.svelte-x4nibx{width:100%;height:100%}.container.svelte-x4nibx.svelte-x4nibx{position:relative;align-items:center;transition:all 1s ease-out;height:100vh;max-width:50vw;width:100%}.container.svelte-x4nibx .logo-wrapper.svelte-x4nibx{width:50vw;height:100vh;display:flex;align-items:center;justify-content:flex-end;z-index:2;position:relative}.container.svelte-x4nibx .logo-wrapper .logo-container.svelte-x4nibx{max-width:33%}.container.svelte-x4nibx .logo-wrapper .logo-container .image-logo.svelte-x4nibx{object-fit:contain;width:100%}@media(max-width: 650px){.container.svelte-x4nibx .logo-wrapper.svelte-x4nibx{width:100%;max-width:100%;justify-content:center}.container.svelte-x4nibx .logo-wrapper .logo-container.svelte-x4nibx{max-width:40%}.container.svelte-x4nibx .logo-wrapper .logo-container .image-logo.svelte-x4nibx{width:100%}}@media(max-width: 650px){.container.svelte-x4nibx.svelte-x4nibx{max-width:100%}}@media(max-width: 650px){.image-logo.svelte-x4nibx.svelte-x4nibx{display:none}.container.svelte-x4nibx.svelte-x4nibx{width:100vw}.container.svelte-x4nibx.svelte-x4nibx{transform:translateY(0) !important;justify-content:center}}",
  map: '{"version":3,"file":"LeftContainer.svelte","sources":["LeftContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import CarouselRenders from \\"../CarouselRenders/CarouselRenders.svelte\\";\\r\\n  import ContactUs from \\"../ContactUs/ContactUs.svelte\\";\\r\\n  import Credits from \\"../Credits/Credits.svelte\\";\\r\\n  import GalleryPreview from \\"../GalleryPreview/GalleryPreview.svelte\\";\\r\\n  import ImagePage from \\"../ImagePage/ImagePage.svelte\\";\\r\\n  import TextPage from \\"../TextPage/TextPage.svelte\\";\\r\\n\\r\\n  export let leftPage;\\r\\n  export let carouselPage;\\r\\n<\/script>\\r\\n\\r\\n<div bind:this={leftPage} class=\\"container\\">\\r\\n  <div class=\\"bg-image-container\\">\\r\\n    <img\\r\\n      class=\\"bg-image\\"\\r\\n      src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631649512/homebg/HorseLeft_eilqmu.jpg\\"\\r\\n      alt=\\"\\"\\r\\n    />\\r\\n  </div>\\r\\n  <div id=\\"home\\" class=\\"logo-wrapper\\">\\r\\n    <div class=\\"logo-container\\">\\r\\n      <img\\r\\n        class=\\"image-logo\\"\\r\\n        src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/Maliview_Left_Logo_amrxlk.png\\"\\r\\n        alt=\\"\\"\\r\\n      />\\r\\n    </div>\\r\\n  </div>\\r\\n\\r\\n  <ImagePage name=\\"malibu\\" index={0} />\\r\\n  <TextPage name=\\"discover\\" bgColor=\\"#a4632e\\" index={1} />\\r\\n  <CarouselRenders name=\\"renders\\" {carouselPage} page=\\"left\\" />\\r\\n\\r\\n  <TextPage name=\\"floorplans\\" bgColor=\\"#a4632e\\" index={3} />\\r\\n  <ImagePage name=\\"equestrian\\" index={2} />\\r\\n  <TextPage name=\\"video render\\" bgColor=\\"#a4632e\\" index={5} />\\r\\n  <GalleryPreview name=\\"behind the scenes\\" />\\r\\n\\r\\n  <TextPage index={7} name=\\"drone footage\\" />\\r\\n  <Credits page=\\"left\\" />\\r\\n  <div class=\\"page\\">\\r\\n    <ContactUs />\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.bg-image-container {\\n  width: 100%;\\n  height: 100%;\\n  position: absolute;\\n  z-index: 1;\\n}\\n.bg-image-container .bg-image {\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.container {\\n  position: relative;\\n  align-items: center;\\n  transition: all 1s ease-out;\\n  height: 100vh;\\n  max-width: 50vw;\\n  width: 100%;\\n}\\n.container .logo-wrapper {\\n  width: 50vw;\\n  height: 100vh;\\n  display: flex;\\n  align-items: center;\\n  justify-content: flex-end;\\n  z-index: 2;\\n  position: relative;\\n}\\n.container .logo-wrapper .logo-container {\\n  max-width: 33%;\\n}\\n.container .logo-wrapper .logo-container .image-logo {\\n  object-fit: contain;\\n  width: 100%;\\n}\\n@media (max-width: 650px) {\\n  .container .logo-wrapper {\\n    width: 100%;\\n    max-width: 100%;\\n    justify-content: center;\\n  }\\n  .container .logo-wrapper .logo-container {\\n    max-width: 40%;\\n  }\\n  .container .logo-wrapper .logo-container .image-logo {\\n    width: 100%;\\n  }\\n}\\n@media (max-width: 650px) {\\n  .container {\\n    max-width: 100%;\\n  }\\n}\\n\\n@media (max-width: 650px) {\\n  .image-logo {\\n    display: none;\\n  }\\n\\n  .container {\\n    width: 100vw;\\n  }\\n\\n  .container {\\n    transform: translateY(0) !important;\\n    justify-content: center;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AA8CmB,mBAAmB,4BAAC,CAAC,AACtC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,iCAAmB,CAAC,SAAS,cAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,GAAG,CAAC,EAAE,CAAC,QAAQ,CAC3B,MAAM,CAAE,KAAK,CACb,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,AACb,CAAC,AACD,wBAAU,CAAC,aAAa,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,QAAQ,CACzB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,cAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,cAAC,CAAC,AACpD,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,wBAAU,CAAC,aAAa,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,cAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,cAAC,CAAC,AACpD,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,4BAAC,CAAC,AACV,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,WAAW,4BAAC,CAAC,AACX,OAAO,CAAE,IAAI,AACf,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,SAAS,CAAE,WAAW,CAAC,CAAC,CAAC,UAAU,CACnC,eAAe,CAAE,MAAM,AACzB,CAAC,AACH,CAAC"}'
};
const LeftContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { leftPage } = $$props;
  let { carouselPage } = $$props;
  if ($$props.leftPage === void 0 && $$bindings.leftPage && leftPage !== void 0)
    $$bindings.leftPage(leftPage);
  if ($$props.carouselPage === void 0 && $$bindings.carouselPage && carouselPage !== void 0)
    $$bindings.carouselPage(carouselPage);
  $$result.css.add(css$a);
  return `<div class="${"container svelte-x4nibx"}"${add_attribute("this", leftPage, 0)}><div class="${"bg-image-container svelte-x4nibx"}"><img class="${"bg-image svelte-x4nibx"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631649512/homebg/HorseLeft_eilqmu.jpg"}" alt="${""}"></div>
  <div id="${"home"}" class="${"logo-wrapper svelte-x4nibx"}"><div class="${"logo-container svelte-x4nibx"}"><img class="${"image-logo svelte-x4nibx"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/Maliview_Left_Logo_amrxlk.png"}" alt="${""}"></div></div>

  ${validate_component(ImagePage, "ImagePage").$$render($$result, { name: "malibu", index: 0 }, {}, {})}
  ${validate_component(TextPage, "TextPage").$$render($$result, {
    name: "discover",
    bgColor: "#a4632e",
    index: 1
  }, {}, {})}
  ${validate_component(CarouselRenders, "CarouselRenders").$$render($$result, {
    name: "renders",
    carouselPage,
    page: "left"
  }, {}, {})}

  ${validate_component(TextPage, "TextPage").$$render($$result, {
    name: "floorplans",
    bgColor: "#a4632e",
    index: 3
  }, {}, {})}
  ${validate_component(ImagePage, "ImagePage").$$render($$result, { name: "equestrian", index: 2 }, {}, {})}
  ${validate_component(TextPage, "TextPage").$$render($$result, {
    name: "video render",
    bgColor: "#a4632e",
    index: 5
  }, {}, {})}
  ${validate_component(GalleryPreview, "GalleryPreview").$$render($$result, { name: "behind the scenes" }, {}, {})}

  ${validate_component(TextPage, "TextPage").$$render($$result, { index: 7, name: "drone footage" }, {}, {})}
  ${validate_component(Credits, "Credits").$$render($$result, { page: "left" }, {}, {})}
  <div class="${"page"}">${validate_component(ContactUs, "ContactUs").$$render($$result, {}, {}, {})}</div>
</div>`;
});
var CarouselFull_svelte_svelte_type_style_lang = "";
const css$9 = {
  code: ".page.svelte-ecj6uw.svelte-ecj6uw{position:relative}.left.svelte-ecj6uw.svelte-ecj6uw{right:5px}.right.svelte-ecj6uw.svelte-ecj6uw{left:5px}.indicator.svelte-ecj6uw.svelte-ecj6uw{top:5px;z-index:4;font-weight:600;text-align:center;letter-spacing:0.2em;position:absolute;padding:5px 15px;border-radius:14px;background-color:black;color:white;display:flex;justify-content:center}.indicator.svelte-ecj6uw p.svelte-ecj6uw{margin-right:-0.2em}.glide__arrow--right.svelte-ecj6uw.svelte-ecj6uw{right:20px;transform:rotate(180deg)}.glide__arrow--left.svelte-ecj6uw.svelte-ecj6uw{left:20px}.page-arrow-container.svelte-ecj6uw.svelte-ecj6uw{width:30px;height:30px;position:absolute;bottom:0;top:50%;border-radius:50%;background-color:rgba(0, 0, 0, 0.5);border:none;overflow:hidden}.page-arrow-container.svelte-ecj6uw .page-arrow-relative.svelte-ecj6uw{position:absolute;top:0;left:0;bottom:0;right:0;padding:5px;margin:auto}.glide__slides.svelte-ecj6uw.svelte-ecj6uw{height:100%;display:flex;justify-content:center}.glide__slide.svelte-ecj6uw.svelte-ecj6uw{display:flex;justify-content:center}.glide__arrows.svelte-ecj6uw.svelte-ecj6uw{position:absolute;left:0;margin:auto;top:0;bottom:0;right:0;width:100%}.glide.svelte-ecj6uw.svelte-ecj6uw{height:100%}.glide.svelte-ecj6uw .glide__track.svelte-ecj6uw{height:100%}.glide.svelte-ecj6uw .glide__track .image-container.svelte-ecj6uw{width:100%}.glide.svelte-ecj6uw .glide__track .image-container img.svelte-ecj6uw{width:100%;object-fit:cover;height:100%;object-position:center center}",
  map: '{"version":3,"file":"CarouselFull.svelte","sources":["CarouselFull.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import Glide from \\"@glidejs/glide\\";\\r\\n  import { onMount } from \\"svelte\\";\\r\\n  import Arrow from \\"../Card/Arrow.svelte\\";\\r\\n\\r\\n  let glider;\\r\\n  export let name;\\r\\n  export let page;\\r\\n  export let orient;\\r\\n  const images = {\\r\\n    floorplans: [\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1633199065/FloorPlans/33340_Mullholland_Hwy_SITE_PLAN_gbvv7f.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1633199064/FloorPlans/33340_Mullholland_Hwy_1ST_FLOOR_BLACK_20211001_qrb856.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1633199063/FloorPlans/33340_Mullholland_Hwy_2ND_FLOOR_20211001_cmgvbq.jpg\\",\\r\\n    ],\\r\\n    discover: [\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656387/discoverCarousel/9_uzo4x8.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656387/discoverCarousel/8_hfpqwt.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/7_hsa2ug.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656388/discoverCarousel/6_irwxo2.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656384/discoverCarousel/5_uxqh1e.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/4_gbfofj.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/3_dhtxik.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/2_glhk3x.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/1_dcchec.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656385/discoverCarousel/12_ymbo5d.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656385/discoverCarousel/11_jrxcsr.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631656386/discoverCarousel/10_cvnxds.jpg\\",\\r\\n    ],\\r\\n  };\\r\\n\\r\\n  const halfCarousel = {};\\r\\n  let glide;\\r\\n  let glideIndex = 0;\\r\\n  onMount(() => {\\r\\n    glide = new Glide(glider);\\r\\n    glide.mount();\\r\\n    glide.on(\\"run\\", function () {\\r\\n      glideIndex = glide.index;\\r\\n    });\\r\\n  });\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n  <div class=\\"indicator {page}\\">\\r\\n    {#if glide}\\r\\n      <p>\\r\\n        {glideIndex + 1}/{orient === \\"half\\"\\r\\n          ? halfCarousel[name].length\\r\\n          : images[name].length}\\r\\n      </p>\\r\\n    {/if}\\r\\n  </div>\\r\\n  <div bind:this={glider} class=\\"glide\\">\\r\\n    <div class=\\"glide__track\\" data-glide-el=\\"track\\">\\r\\n      <ul class=\\"glide__slides\\">\\r\\n        {#each images[name] as img, i}\\r\\n          <li class=\\"glide__slide\\">\\r\\n            <div class=\\"image-container\\">\\r\\n              <img loading=\\"lazy\\" class=\\"carousel-image\\" src={img} alt=\\"\\" />\\r\\n            </div>\\r\\n          </li>\\r\\n        {/each}\\r\\n      </ul>\\r\\n    </div>\\r\\n    <div class=\\"glide__arrows\\" data-glide-el=\\"controls\\">\\r\\n      <button\\r\\n        class=\\"glide__arrow page-arrow-container glide__arrow--left\\"\\r\\n        data-glide-dir=\\"<\\"\\r\\n      >\\r\\n        <div class=\\"page-arrow-relative\\">\\r\\n          <Arrow\\r\\n            styleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n          />\\r\\n        </div></button\\r\\n      >\\r\\n      <button\\r\\n        class=\\"glide__arrow  page-arrow-container glide__arrow--right\\"\\r\\n        data-glide-dir=\\">\\"\\r\\n      >\\r\\n        <div class=\\"page-arrow-relative\\">\\r\\n          <Arrow\\r\\n            styleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n          />\\r\\n        </div>\\r\\n      </button>\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.page {\\n  position: relative;\\n}\\n\\n.left {\\n  right: 5px;\\n}\\n\\n.right {\\n  left: 5px;\\n}\\n\\n.indicator {\\n  top: 5px;\\n  z-index: 4;\\n  font-weight: 600;\\n  text-align: center;\\n  letter-spacing: 0.2em;\\n  position: absolute;\\n  padding: 5px 15px;\\n  border-radius: 14px;\\n  background-color: black;\\n  color: white;\\n  display: flex;\\n  justify-content: center;\\n}\\n.indicator p {\\n  margin-right: -0.2em;\\n}\\n\\n.glide__arrow--right {\\n  right: 20px;\\n  transform: rotate(180deg);\\n}\\n\\n.glide__arrow--left {\\n  left: 20px;\\n}\\n\\n.page-arrow-container {\\n  width: 30px;\\n  height: 30px;\\n  position: absolute;\\n  bottom: 0;\\n  top: 50%;\\n  border-radius: 50%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: none;\\n  overflow: hidden;\\n}\\n.page-arrow-container .page-arrow-relative {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  bottom: 0;\\n  right: 0;\\n  padding: 5px;\\n  margin: auto;\\n}\\n\\n.glide__slides {\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n}\\n\\n.glide__slide {\\n  display: flex;\\n  justify-content: center;\\n}\\n\\n.glide__arrows {\\n  position: absolute;\\n  left: 0;\\n  margin: auto;\\n  top: 0;\\n  bottom: 0;\\n  right: 0;\\n  width: 100%;\\n}\\n\\n.glide {\\n  height: 100%;\\n}\\n.glide .glide__track {\\n  height: 100%;\\n}\\n.glide .glide__track .image-container {\\n  width: 100%;\\n}\\n.glide .glide__track .image-container img {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n  object-position: center center;\\n}</style>\\r\\n"],"names":[],"mappings":"AA0FmB,KAAK,4BAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,AACpB,CAAC,AAED,KAAK,4BAAC,CAAC,AACL,KAAK,CAAE,GAAG,AACZ,CAAC,AAED,MAAM,4BAAC,CAAC,AACN,IAAI,CAAE,GAAG,AACX,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,KAAK,CACrB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,wBAAU,CAAC,CAAC,cAAC,CAAC,AACZ,YAAY,CAAE,MAAM,AACtB,CAAC,AAED,oBAAoB,4BAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,mBAAmB,4BAAC,CAAC,AACnB,IAAI,CAAE,IAAI,AACZ,CAAC,AAED,qBAAqB,4BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,GAAG,CACR,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,mCAAqB,CAAC,oBAAoB,cAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,KAAK,CAAE,IAAI,AACb,CAAC,AAED,MAAM,4BAAC,CAAC,AACN,MAAM,CAAE,IAAI,AACd,CAAC,AACD,oBAAM,CAAC,aAAa,cAAC,CAAC,AACpB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,oBAAM,CAAC,aAAa,CAAC,gBAAgB,cAAC,CAAC,AACrC,KAAK,CAAE,IAAI,AACb,CAAC,AACD,oBAAM,CAAC,aAAa,CAAC,gBAAgB,CAAC,GAAG,cAAC,CAAC,AACzC,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,CACZ,eAAe,CAAE,MAAM,CAAC,MAAM,AAChC,CAAC"}'
};
const CarouselFull = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let glider;
  let { name } = $$props;
  let { page } = $$props;
  let { orient } = $$props;
  const images2 = {
    floorplans: [
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199065/FloorPlans/33340_Mullholland_Hwy_SITE_PLAN_gbvv7f.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199064/FloorPlans/33340_Mullholland_Hwy_1ST_FLOOR_BLACK_20211001_qrb856.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199063/FloorPlans/33340_Mullholland_Hwy_2ND_FLOOR_20211001_cmgvbq.jpg"
    ],
    discover: [
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656387/discoverCarousel/9_uzo4x8.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656387/discoverCarousel/8_hfpqwt.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/7_hsa2ug.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656388/discoverCarousel/6_irwxo2.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656384/discoverCarousel/5_uxqh1e.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/4_gbfofj.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/3_dhtxik.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/2_glhk3x.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/1_dcchec.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656385/discoverCarousel/12_ymbo5d.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656385/discoverCarousel/11_jrxcsr.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656386/discoverCarousel/10_cvnxds.jpg"
    ]
  };
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.orient === void 0 && $$bindings.orient && orient !== void 0)
    $$bindings.orient(orient);
  $$result.css.add(css$9);
  return `<div class="${"page svelte-ecj6uw"}"><div class="${"indicator " + escape(page) + " svelte-ecj6uw"}">${``}</div>
  <div class="${"glide svelte-ecj6uw"}"${add_attribute("this", glider, 0)}><div class="${"glide__track svelte-ecj6uw"}" data-glide-el="${"track"}"><ul class="${"glide__slides svelte-ecj6uw"}">${each(images2[name], (img, i) => `<li class="${"glide__slide svelte-ecj6uw"}"><div class="${"image-container svelte-ecj6uw"}"><img loading="${"lazy"}" class="${"carousel-image svelte-ecj6uw"}"${add_attribute("src", img, 0)} alt="${""}"></div>
          </li>`)}</ul></div>
    <div class="${"glide__arrows svelte-ecj6uw"}" data-glide-el="${"controls"}"><button class="${"glide__arrow page-arrow-container glide__arrow--left svelte-ecj6uw"}" data-glide-dir="${"<"}"><div class="${"page-arrow-relative svelte-ecj6uw"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button>
      <button class="${"glide__arrow page-arrow-container glide__arrow--right svelte-ecj6uw"}" data-glide-dir="${">"}"><div class="${"page-arrow-relative svelte-ecj6uw"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button></div></div>
</div>`;
});
const GalleryImage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
const images = {
  "phase 1": [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/2021.05.29_roof_2_ontfwx.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Amit_and_Russel_m0lcjt.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Bike_frqokt.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Framing_d7ovrn.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Humming_Bird_vgziao.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/circle_window_with_pendant_light_fbnnsd.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/dining_room_discussion_wyhfjh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/electrical_2_hzrwdq.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/electrical_discussion_fzgod7.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/framing_discussion_skcuns.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_2_mqzixc.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_3_wwredc.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_ynx88u.jpg"
  ],
  "phase 2": [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1626_sdrius.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237866/gallery/phase2/IMG_1625_yn2ejh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237866/gallery/phase2/IMG_1624_g2xn6l.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237866/gallery/phase2/IMG_1623_tbifiv.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237866/gallery/phase2/IMG_1622_ra7sz7.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237866/gallery/phase2/IMG_1621_psoe2l.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237866/gallery/phase2/IMG_1620_xqtohu.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1619_pldvgg.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1618_muml1g.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1617_ihwyj5.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1616_le0xaj.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1615_ub7k3f.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1614_s4iaio.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1613_bgsjs0.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1612_ngcjyv.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1610_y74fit.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1609_isi8c8.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1608_dzhtzh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237865/gallery/phase2/IMG_1607_xon6l6.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1606_zup44h.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1605_wegcy7.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1604_eiralr.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1602_jmom36.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1634237864/gallery/phase2/IMG_1601_yzjenk.jpg"
  ]
};
var Gallery_svelte_svelte_type_style_lang = "";
const css$8 = {
  code: '.phase-label-container.svelte-5toxjh.svelte-5toxjh{color:white;display:flex;gap:10px;align-items:center;padding:0.5rem;font-family:Orator}.phase-label-container.svelte-5toxjh h5.svelte-5toxjh{width:fit-content;position:relative;cursor:pointer}.phase-label-container.svelte-5toxjh .phase-label.svelte-5toxjh::after{content:"";display:block;width:100%;height:1px;background-color:white}.overlay-image.svelte-5toxjh.svelte-5toxjh{position:relative;border:1px solid white}.overlay-image.svelte-5toxjh.svelte-5toxjh::before{z-index:2;content:"";height:100%;width:100%;position:absolute;display:block;background-color:rgba(0, 0, 0, 0.5)}.phase-1.svelte-5toxjh.svelte-5toxjh{display:grid;height:100%;grid-template-columns:repeat(10, 1fr);grid-template-rows:repeat(20, minmax(calc(100% / 4), 1fr));gap:5px}.phase-1.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(n+2):nth-child(-n+5){grid-column:span 1;grid-row:span 1}.phase-1.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(8){grid-column:span 4;grid-row:span 1}.phase-1.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(12){grid-column:span 4;grid-row:span 1}.phase-1.svelte-5toxjh .grid-image-container.svelte-5toxjh{grid-column:span 3;grid-row:span 1;overflow:hidden;width:100%}.grid-container.svelte-5toxjh img.svelte-5toxjh{object-fit:cover}.grid-container.svelte-5toxjh iframe.svelte-5toxjh{grid-column-end:span 7;height:100%}.overlay-image.svelte-5toxjh.svelte-5toxjh{position:relative}.overlay-image.svelte-5toxjh.svelte-5toxjh::before{z-index:2;content:"";height:100%;width:100%;position:absolute;display:block;background-color:rgba(0, 0, 0, 0.5)}img.svelte-5toxjh.svelte-5toxjh{cursor:pointer;width:100%;height:100%}.phase-2.svelte-5toxjh.svelte-5toxjh{display:grid;height:100%;grid-template-columns:repeat(25, 4%);grid-template-rows:repeat(25, 4%);width:100%;gap:2.8px}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(n+2):nth-child(-n+5){grid-column:span 10;grid-row:span 3}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh{grid-column:span 5;grid-row:span 4;overflow:hidden;width:100%}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(20){grid-column:span 5;grid-row:span 8}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(21){grid-column:span 5;grid-row:span 10}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(22){grid-row:span 12}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(8){grid-column:span 4;grid-row:span 4}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(18){grid-column:span 10;grid-row:span 6}.phase-2.svelte-5toxjh .grid-image-container.svelte-5toxjh:nth-child(10){grid-column:span 6}',
  map: `{"version":3,"file":"Gallery.svelte","sources":["Gallery.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { galleryImg } from \\"../GalleryPreview/store\\";\\r\\n  import GalleryImage from \\"../GalleryImage/GalleryImage.svelte\\";\\r\\n  import { images } from \\"./galleryImages\\";\\r\\n  let selected;\\r\\n\\r\\n  const phases = [\\"phase 1\\", \\"phase 2\\"];\\r\\n\\r\\n  const selectImage = (i) => {\\r\\n    galleryImg.update((s) => {\\r\\n      s.index = i;\\r\\n      return s;\\r\\n    });\\r\\n  };\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n  <div class=\\"phase-label-container\\">\\r\\n    {#each phases as phase}\\r\\n      <h5\\r\\n        on:click={() => {\\r\\n          galleryImg.update((s) => {\\r\\n            s.currPhase = phase;\\r\\n            s.index = 0;\\r\\n            return s;\\r\\n          });\\r\\n        }}\\r\\n        class:phase-label={phase === $galleryImg.currPhase}\\r\\n      >\\r\\n        {phase}\\r\\n      </h5>\\r\\n    {/each}\\r\\n  </div>\\r\\n  <div class=\\"grid-container {$galleryImg.currPhase.replace(' ', '-')}\\">\\r\\n    {#each images[$galleryImg.currPhase] as img, i}\\r\\n      <svelte:component this={GalleryImage}>\\r\\n        <div\\r\\n          class=\\"grid-image-container {$galleryImg.index === i\\r\\n            ? 'overlay-image'\\r\\n            : ''}\\"\\r\\n          index={i}\\r\\n        >\\r\\n          <img\\r\\n            on:click={() => {\\r\\n              selectImage(i);\\r\\n            }}\\r\\n            loading=\\"lazy\\"\\r\\n            src={img}\\r\\n            alt=\\"\\"\\r\\n          />\\r\\n        </div>\\r\\n      </svelte:component>\\r\\n    {/each}\\r\\n    {#if $galleryImg.currPhase === \\"phase 1\\"}\\r\\n      <iframe\\r\\n        class=\\"video-modal\\"\\r\\n        width=\\"100%\\"\\r\\n        src=\\"https://www.youtube.com/embed/nTS10ZQM5Ms\\"\\r\\n        title=\\"YouTube video player\\"\\r\\n        allow=\\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\\"\\r\\n      />\\r\\n    {/if}\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.phase-label-container {\\n  color: white;\\n  display: flex;\\n  gap: 10px;\\n  align-items: center;\\n  padding: 0.5rem;\\n  font-family: Orator;\\n}\\n.phase-label-container h5 {\\n  width: fit-content;\\n  position: relative;\\n  cursor: pointer;\\n}\\n.phase-label-container .phase-label::after {\\n  content: \\"\\";\\n  display: block;\\n  width: 100%;\\n  height: 1px;\\n  background-color: white;\\n}\\n\\n.overlay-image {\\n  position: relative;\\n  border: 1px solid white;\\n}\\n.overlay-image::before {\\n  z-index: 2;\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  position: absolute;\\n  display: block;\\n  background-color: rgba(0, 0, 0, 0.5);\\n}\\n\\n.phase-1 {\\n  display: grid;\\n  height: 100%;\\n  grid-template-columns: repeat(10, 1fr);\\n  grid-template-rows: repeat(20, minmax(calc(100% / 4), 1fr));\\n  gap: 5px;\\n}\\n.phase-1 .grid-image-container:nth-child(n+2):nth-child(-n+5) {\\n  grid-column: span 1;\\n  grid-row: span 1;\\n}\\n.phase-1 .grid-image-container:nth-child(8) {\\n  grid-column: span 4;\\n  grid-row: span 1;\\n}\\n.phase-1 .grid-image-container:nth-child(12) {\\n  grid-column: span 4;\\n  grid-row: span 1;\\n}\\n.phase-1 .grid-image-container {\\n  grid-column: span 3;\\n  grid-row: span 1;\\n  overflow: hidden;\\n  width: 100%;\\n}\\n\\n.grid-container img {\\n  object-fit: cover;\\n}\\n.grid-container iframe {\\n  grid-column-end: span 7;\\n  height: 100%;\\n}\\n\\n.overlay-image {\\n  position: relative;\\n}\\n.overlay-image::before {\\n  z-index: 2;\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  position: absolute;\\n  display: block;\\n  background-color: rgba(0, 0, 0, 0.5);\\n}\\n\\nimg {\\n  cursor: pointer;\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.phase-2 {\\n  display: grid;\\n  height: 100%;\\n  grid-template-columns: repeat(25, 4%);\\n  grid-template-rows: repeat(25, 4%);\\n  width: 100%;\\n  gap: 2.8px;\\n}\\n.phase-2 .grid-image-container:nth-child(n+2):nth-child(-n+5) {\\n  grid-column: span 10;\\n  grid-row: span 3;\\n}\\n.phase-2 .grid-image-container {\\n  grid-column: span 5;\\n  grid-row: span 4;\\n  overflow: hidden;\\n  width: 100%;\\n}\\n.phase-2 .grid-image-container:nth-child(20) {\\n  grid-column: span 5;\\n  grid-row: span 8;\\n}\\n.phase-2 .grid-image-container:nth-child(21) {\\n  grid-column: span 5;\\n  grid-row: span 10;\\n}\\n.phase-2 .grid-image-container:nth-child(22) {\\n  grid-row: span 12;\\n}\\n.phase-2 .grid-image-container:nth-child(8) {\\n  grid-column: span 4;\\n  grid-row: span 4;\\n}\\n.phase-2 .grid-image-container:nth-child(18) {\\n  grid-column: span 10;\\n  grid-row: span 6;\\n}\\n.phase-2 .grid-image-container:nth-child(10) {\\n  grid-column: span 6;\\n}</style>\\r\\n"],"names":[],"mappings":"AAiEmB,sBAAsB,4BAAC,CAAC,AACzC,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,CACT,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,MAAM,CACf,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,oCAAsB,CAAC,EAAE,cAAC,CAAC,AACzB,KAAK,CAAE,WAAW,CAClB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,oCAAsB,CAAC,0BAAY,OAAO,AAAC,CAAC,AAC1C,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AACzB,CAAC,AACD,0CAAc,QAAQ,AAAC,CAAC,AACtB,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AAED,QAAQ,4BAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CACZ,qBAAqB,CAAE,OAAO,EAAE,CAAC,CAAC,GAAG,CAAC,CACtC,kBAAkB,CAAE,OAAO,EAAE,CAAC,CAAC,OAAO,KAAK,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAC3D,GAAG,CAAE,GAAG,AACV,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,GAAG,CAAC,WAAW,IAAI,CAAC,AAAC,CAAC,AAC7D,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,CAAC,CAAC,AAAC,CAAC,AAC3C,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,EAAE,CAAC,AAAC,CAAC,AAC5C,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,qBAAqB,cAAC,CAAC,AAC9B,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,CAChB,QAAQ,CAAE,MAAM,CAChB,KAAK,CAAE,IAAI,AACb,CAAC,AAED,6BAAe,CAAC,GAAG,cAAC,CAAC,AACnB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,6BAAe,CAAC,MAAM,cAAC,CAAC,AACtB,eAAe,CAAE,IAAI,CAAC,CAAC,CACvB,MAAM,CAAE,IAAI,AACd,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,0CAAc,QAAQ,AAAC,CAAC,AACtB,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AAED,GAAG,4BAAC,CAAC,AACH,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,QAAQ,4BAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CACZ,qBAAqB,CAAE,OAAO,EAAE,CAAC,CAAC,EAAE,CAAC,CACrC,kBAAkB,CAAE,OAAO,EAAE,CAAC,CAAC,EAAE,CAAC,CAClC,KAAK,CAAE,IAAI,CACX,GAAG,CAAE,KAAK,AACZ,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,GAAG,CAAC,WAAW,IAAI,CAAC,AAAC,CAAC,AAC7D,WAAW,CAAE,IAAI,CAAC,EAAE,CACpB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,qBAAqB,cAAC,CAAC,AAC9B,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,CAChB,QAAQ,CAAE,MAAM,CAChB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,EAAE,CAAC,AAAC,CAAC,AAC5C,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,EAAE,CAAC,AAAC,CAAC,AAC5C,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,EAAE,AACnB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,EAAE,CAAC,AAAC,CAAC,AAC5C,QAAQ,CAAE,IAAI,CAAC,EAAE,AACnB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,CAAC,CAAC,AAAC,CAAC,AAC3C,WAAW,CAAE,IAAI,CAAC,CAAC,CACnB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,EAAE,CAAC,AAAC,CAAC,AAC5C,WAAW,CAAE,IAAI,CAAC,EAAE,CACpB,QAAQ,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC,AACD,sBAAQ,CAAC,mCAAqB,WAAW,EAAE,CAAC,AAAC,CAAC,AAC5C,WAAW,CAAE,IAAI,CAAC,CAAC,AACrB,CAAC"}`
};
const Gallery = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  const phases = ["phase 1", "phase 2"];
  $$result.css.add(css$8);
  $$unsubscribe_galleryImg();
  return `<div class="${"page"}"><div class="${"phase-label-container svelte-5toxjh"}">${each(phases, (phase) => `<h5 class="${["svelte-5toxjh", phase === $galleryImg.currPhase ? "phase-label" : ""].join(" ").trim()}">${escape(phase)}
      </h5>`)}</div>
  <div class="${"grid-container " + escape($galleryImg.currPhase.replace(" ", "-")) + " svelte-5toxjh"}">${each(images[$galleryImg.currPhase], (img, i) => `${validate_component(GalleryImage || missing_component, "svelte:component").$$render($$result, {}, {}, {
    default: () => `<div class="${"grid-image-container " + escape($galleryImg.index === i ? "overlay-image" : "") + " svelte-5toxjh"}"${add_attribute("index", i, 0)}><img loading="${"lazy"}"${add_attribute("src", img, 0)} alt="${""}" class="${"svelte-5toxjh"}"></div>
      `
  })}`)}
    ${$galleryImg.currPhase === "phase 1" ? `<iframe class="${"video-modal svelte-5toxjh"}" width="${"100%"}" src="${"https://www.youtube.com/embed/nTS10ZQM5Ms"}" title="${"YouTube video player"}" allow="${"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}"></iframe>` : ``}</div>
</div>`;
});
var RightContainer_svelte_svelte_type_style_lang = "";
const css$7 = {
  code: ".bg-image-container.svelte-1ppt77p.svelte-1ppt77p{width:100%;height:100%;position:absolute;z-index:1;margin:auto}.bg-image-container.svelte-1ppt77p .bg-image.svelte-1ppt77p{width:100%;height:100%}.container.svelte-1ppt77p.svelte-1ppt77p{position:relative;align-items:center;transform:translateY(-1000vh);transition:all 1s ease-out;height:100vh;max-width:50vw;width:100%}.container.svelte-1ppt77p .logo-wrapper.svelte-1ppt77p{width:50vw;height:100vh;display:flex;align-items:center;justify-content:flex-start;z-index:2;position:relative}.container.svelte-1ppt77p .logo-wrapper .logo-container.svelte-1ppt77p{max-width:33%}.container.svelte-1ppt77p .logo-wrapper .logo-container .image-logo.svelte-1ppt77p{object-fit:contain;width:100%}@media(max-width: 650px){.container.svelte-1ppt77p .logo-wrapper.svelte-1ppt77p{width:100%;max-width:100%;justify-content:center}.container.svelte-1ppt77p .logo-wrapper .logo-container.svelte-1ppt77p{max-width:40%}.container.svelte-1ppt77p .logo-wrapper .logo-container .image-logo.svelte-1ppt77p{width:100%}}@media(max-width: 650px){.container.svelte-1ppt77p.svelte-1ppt77p{max-width:100%}}@media(max-width: 650px){.image-logo.svelte-1ppt77p.svelte-1ppt77p{display:none}.container.svelte-1ppt77p.svelte-1ppt77p{width:100vw}.container.svelte-1ppt77p.svelte-1ppt77p{transform:translateY(0) !important;justify-content:center}}",
  map: '{"version":3,"file":"RightContainer.svelte","sources":["RightContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import CarouselFull from \\"../CarouselFull/CarouselFull.svelte\\";\\r\\n  import Credits from \\"../Credits/Credits.svelte\\";\\r\\n  import Gallery from \\"../Gallery/Gallery.svelte\\";\\r\\n  import ImagePage from \\"../ImagePage/ImagePage.svelte\\";\\r\\n  import TextPage from \\"../TextPage/TextPage.svelte\\";\\r\\n  import CarouselRenders from \\"./../CarouselRenders/CarouselRenders.svelte\\";\\r\\n\\r\\n  export let rightPage;\\r\\n  export let carouselPage;\\r\\n<\/script>\\r\\n\\r\\n<div bind:this={rightPage} class=\\"container\\">\\r\\n  <ImagePage index={5} />\\r\\n  <Credits page=\\"right\\" />\\r\\n  <ImagePage index={4} />\\r\\n  <Gallery />\\r\\n  <ImagePage index={3} />\\r\\n\\r\\n  <TextPage index={4} />\\r\\n  <CarouselFull orient=\\"full\\" page=\\"right\\" name=\\"floorplans\\" />\\r\\n  <CarouselRenders {carouselPage} page=\\"right\\" />\\r\\n\\r\\n  <CarouselFull orient=\\"full\\" page=\\"right\\" name=\\"discover\\" index={1} />\\r\\n  <TextPage index={0} />\\r\\n  <div class=\\"bg-image-container\\">\\r\\n    <img\\r\\n      class=\\"bg-image\\"\\r\\n      src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631649616/homebg/HomeRight_jcgxwh.jpg\\"\\r\\n      alt=\\"\\"\\r\\n    />\\r\\n  </div>\\r\\n  <div class=\\"logo-wrapper\\">\\r\\n    <div class=\\"logo-container\\">\\r\\n      <img\\r\\n        class=\\"image-logo\\"\\r\\n        src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/Maliview_Right_Logo_njwkyp.png\\"\\r\\n        alt=\\"\\"\\r\\n      />\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.bg-image-container {\\n  width: 100%;\\n  height: 100%;\\n  position: absolute;\\n  z-index: 1;\\n  margin: auto;\\n}\\n.bg-image-container .bg-image {\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.container {\\n  position: relative;\\n  align-items: center;\\n  transform: translateY(-1000vh);\\n  transition: all 1s ease-out;\\n  height: 100vh;\\n  max-width: 50vw;\\n  width: 100%;\\n}\\n.container .logo-wrapper {\\n  width: 50vw;\\n  height: 100vh;\\n  display: flex;\\n  align-items: center;\\n  justify-content: flex-start;\\n  z-index: 2;\\n  position: relative;\\n}\\n.container .logo-wrapper .logo-container {\\n  max-width: 33%;\\n}\\n.container .logo-wrapper .logo-container .image-logo {\\n  object-fit: contain;\\n  width: 100%;\\n}\\n@media (max-width: 650px) {\\n  .container .logo-wrapper {\\n    width: 100%;\\n    max-width: 100%;\\n    justify-content: center;\\n  }\\n  .container .logo-wrapper .logo-container {\\n    max-width: 40%;\\n  }\\n  .container .logo-wrapper .logo-container .image-logo {\\n    width: 100%;\\n  }\\n}\\n@media (max-width: 650px) {\\n  .container {\\n    max-width: 100%;\\n  }\\n}\\n\\n@media (max-width: 650px) {\\n  .image-logo {\\n    display: none;\\n  }\\n\\n  .container {\\n    width: 100vw;\\n  }\\n\\n  .container {\\n    transform: translateY(0) !important;\\n    justify-content: center;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AA2CmB,mBAAmB,8BAAC,CAAC,AACtC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,IAAI,AACd,CAAC,AACD,kCAAmB,CAAC,SAAS,eAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,WAAW,OAAO,CAAC,CAC9B,UAAU,CAAE,GAAG,CAAC,EAAE,CAAC,QAAQ,CAC3B,MAAM,CAAE,KAAK,CACb,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,AACb,CAAC,AACD,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,UAAU,CAC3B,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,eAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,eAAC,CAAC,AACpD,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,eAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,eAAC,CAAC,AACpD,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,8BAAC,CAAC,AACV,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,WAAW,8BAAC,CAAC,AACX,OAAO,CAAE,IAAI,AACf,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,SAAS,CAAE,WAAW,CAAC,CAAC,CAAC,UAAU,CACnC,eAAe,CAAE,MAAM,AACzB,CAAC,AACH,CAAC"}'
};
const RightContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { rightPage } = $$props;
  let { carouselPage } = $$props;
  if ($$props.rightPage === void 0 && $$bindings.rightPage && rightPage !== void 0)
    $$bindings.rightPage(rightPage);
  if ($$props.carouselPage === void 0 && $$bindings.carouselPage && carouselPage !== void 0)
    $$bindings.carouselPage(carouselPage);
  $$result.css.add(css$7);
  return `<div class="${"container svelte-1ppt77p"}"${add_attribute("this", rightPage, 0)}>${validate_component(ImagePage, "ImagePage").$$render($$result, { index: 5 }, {}, {})}
  ${validate_component(Credits, "Credits").$$render($$result, { page: "right" }, {}, {})}
  ${validate_component(ImagePage, "ImagePage").$$render($$result, { index: 4 }, {}, {})}
  ${validate_component(Gallery, "Gallery").$$render($$result, {}, {}, {})}
  ${validate_component(ImagePage, "ImagePage").$$render($$result, { index: 3 }, {}, {})}

  ${validate_component(TextPage, "TextPage").$$render($$result, { index: 4 }, {}, {})}
  ${validate_component(CarouselFull, "CarouselFull").$$render($$result, {
    orient: "full",
    page: "right",
    name: "floorplans"
  }, {}, {})}
  ${validate_component(CarouselRenders, "CarouselRenders").$$render($$result, { carouselPage, page: "right" }, {}, {})}

  ${validate_component(CarouselFull, "CarouselFull").$$render($$result, {
    orient: "full",
    page: "right",
    name: "discover",
    index: 1
  }, {}, {})}
  ${validate_component(TextPage, "TextPage").$$render($$result, { index: 0 }, {}, {})}
  <div class="${"bg-image-container svelte-1ppt77p"}"><img class="${"bg-image svelte-1ppt77p"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631649616/homebg/HomeRight_jcgxwh.jpg"}" alt="${""}"></div>
  <div class="${"logo-wrapper svelte-1ppt77p"}"><div class="${"logo-container svelte-1ppt77p"}"><img class="${"image-logo svelte-1ppt77p"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/Maliview_Right_Logo_njwkyp.png"}" alt="${""}"></div></div>
</div>`;
});
var ScrollContainer_svelte_svelte_type_style_lang = "";
const css$6 = {
  code: ".page{width:50vw;height:100vh;overflow:hidden}",
  map: '{"version":3,"file":"ScrollContainer.svelte","sources":["ScrollContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { onMount } from \\"svelte\\";\\r\\n  import { pagePositions } from \\"../../stores\\";\\r\\n  import LeftContainer from \\"../LeftContainer/LeftContainer.svelte\\";\\r\\n  import RightContainer from \\"../RightContainer/RightContainer.svelte\\";\\r\\n\\r\\n  let leftPage;\\r\\n  let rightPage;\\r\\n\\r\\n  let leftElement;\\r\\n  let rightElement;\\r\\n\\r\\n  onMount(() => {\\r\\n    leftElement = leftPage.$$.ctx[0];\\r\\n    rightElement = rightPage.$$.ctx[0];\\r\\n  });\\r\\n\\r\\n  const handleScrollAnimation = (e) => {\\r\\n    if (window.innerWidth <= 650) {\\r\\n      return;\\r\\n    }\\r\\n    if ($pagePositions.inital === false) {\\r\\n      $pagePositions.inital = true;\\r\\n    }\\r\\n\\r\\n    pagePositions.scrollEve(e);\\r\\n  };\\r\\n\\r\\n  $: {\\r\\n    if (leftElement && rightElement && $pagePositions.inital) {\\r\\n      leftElement.style.transform = `translateY( ${$pagePositions.left}vh)`;\\r\\n      rightElement.style.transform = `translateY( ${$pagePositions.right}vh)`;\\r\\n    }\\r\\n  }\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"scroll-container\\" on:wheel={handleScrollAnimation}>\\r\\n  <LeftContainer bind:this={leftPage} />\\r\\n\\r\\n  <RightContainer bind:this={rightPage} />\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">:global(.page) {\\n  width: 50vw;\\n  height: 100vh;\\n  overflow: hidden;\\n}</style>\\r\\n"],"names":[],"mappings":"AA0C2B,KAAK,AAAE,CAAC,AACjC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,QAAQ,CAAE,MAAM,AAClB,CAAC"}'
};
const ScrollContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_pagePositions;
  $$unsubscribe_pagePositions = subscribe(pagePositions, (value) => value);
  let leftPage;
  let rightPage;
  $$result.css.add(css$6);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="${"scroll-container"}">${validate_component(LeftContainer, "LeftContainer").$$render($$result, { this: leftPage }, {
      this: ($$value) => {
        leftPage = $$value;
        $$settled = false;
      }
    }, {})}

  ${validate_component(RightContainer, "RightContainer").$$render($$result, { this: rightPage }, {
      this: ($$value) => {
        rightPage = $$value;
        $$settled = false;
      }
    }, {})}
</div>`;
  } while (!$$settled);
  $$unsubscribe_pagePositions();
  return $$rendered;
});
var Card_svelte_svelte_type_style_lang = "";
const css$5 = {
  code: '.main-image.svelte-ns3tmv.svelte-ns3tmv{object-fit:cover}h5.svelte-ns3tmv.svelte-ns3tmv{font-family:Orator}.font-white.svelte-ns3tmv.svelte-ns3tmv{color:white}.square-place-holder.svelte-ns3tmv.svelte-ns3tmv{width:100%;height:100%}.square-place-holder.svelte-ns3tmv img.svelte-ns3tmv{width:100%;height:100%;object-fit:cover}.card-content.svelte-ns3tmv.svelte-ns3tmv{background-color:transparent}.play-button-container.svelte-ns3tmv.svelte-ns3tmv{position:absolute;width:25%;top:50%;left:50%;transform:translate(-50%, -50%);height:auto;z-index:5;object-fit:cover}.content.svelte-ns3tmv.svelte-ns3tmv{max-height:20rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}.card-container.svelte-ns3tmv.svelte-ns3tmv{display:flex;flex-direction:column;background-color:transparent}.card-container.svelte-ns3tmv:nth-child(4) .show-more.svelte-ns3tmv{display:none !important}.blur.svelte-ns3tmv.svelte-ns3tmv{left:0;right:0;z-index:0;position:relative}.blur.svelte-ns3tmv.svelte-ns3tmv::before{pointer-events:none;position:absolute;content:"";height:100%;display:block;left:0;right:0;top:0;z-index:2;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)){.blur.svelte-ns3tmv.svelte-ns3tmv::before{background:rgba(0, 0, 0, 0.5)}}.show-more.svelte-ns3tmv.svelte-ns3tmv{display:block;max-height:100%}',
  map: `{"version":3,"file":"Card.svelte","sources":["Card.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { onDestroy, onMount } from \\"svelte\\";\\r\\n  import { browser } from \\"$app/env\\";\\r\\n\\r\\n  import { navToLink, textPages } from \\"../../pageContent\\";\\r\\n  import { modal } from \\"../../stores\\";\\r\\n  import Arrow from \\"./Arrow.svelte\\";\\r\\n\\r\\n  export let index;\\r\\n  let showMore = false;\\r\\n  let mainText;\\r\\n  let overFlowing;\\r\\n\\r\\n  const images = [\\r\\n    {\\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg1_lcs2gw.jpg\\",\\r\\n    },\\r\\n    {\\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg2_oyi2w7.jpg\\",\\r\\n    },\\r\\n\\r\\n    {\\r\\n      type: \\"carousel\\",\\r\\n    },\\r\\n    {\\r\\n      type: \\"carousel\\",\\r\\n    },\\r\\n    {\\r\\n      type: \\"image\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg\\",\\r\\n    },\\r\\n    {\\r\\n      type: \\"video\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg4_ma0d9j.jpg\\",\\r\\n      videoUrl: \\"https://www.youtube.com/embed/nTS10ZQM5Ms\\",\\r\\n    },\\r\\n    {\\r\\n      type: \\"gallery\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg\\",\\r\\n    },\\r\\n\\r\\n    {\\r\\n      type: \\"video\\",\\r\\n      url:\\r\\n        \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630790322/misc/bgPhotos/drone_s8lkqw.png\\",\\r\\n      videoUrl: \\"https://www.youtube.com/embed/l7h2P07cSbc\\",\\r\\n    },\\r\\n  ];\\r\\n  function checkOverFlow() {\\r\\n    if (mainText.scrollHeight > mainText.clientHeight) {\\r\\n      overFlowing = true;\\r\\n    } else {\\r\\n      overFlowing = false;\\r\\n    }\\r\\n  }\\r\\n  onMount(() => {\\r\\n    if (browser) {\\r\\n      window.addEventListener(\\"resize\\", checkOverFlow);\\r\\n    }\\r\\n\\r\\n    checkOverFlow();\\r\\n  });\\r\\n  onDestroy(() => {\\r\\n    if (browser) {\\r\\n      window.removeEventListener(\\"resize\\", checkOverFlow);\\r\\n    }\\r\\n  });\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"bu-card card-container\\" id={navToLink[index + 1]}>\\r\\n  <div class=\\"bu-card-image\\">\\r\\n    <figure\\r\\n      on:click={() => {\\r\\n        if (images[index].type === \\"video\\") {\\r\\n          $modal.visibility = true;\\r\\n          $modal.content = images[index].videoUrl;\\r\\n          $modal.type = \\"video\\";\\r\\n        }\\r\\n      }}\\r\\n      class=\\"bu-image bu-is-4by3 {images[index].type === 'video' ? 'blur' : ''}\\"\\r\\n    >\\r\\n      {#if images[index].type === \\"video\\"}\\r\\n        <div class=\\"play-button-container\\">\\r\\n          <figure class=\\"bu-image bu-is-square \\">\\r\\n            <img\\r\\n              src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/playButton_rbgj1t.png\\"\\r\\n              alt=\\"\\"\\r\\n            />\\r\\n          </figure>\\r\\n        </div>\\r\\n      {/if}\\r\\n      <img\\r\\n        loading=\\"lazy\\"\\r\\n        class=\\"main-image\\"\\r\\n        src={images[index] && images[index].url}\\r\\n        alt=\\"\\"\\r\\n      />\\r\\n    </figure>\\r\\n  </div>\\r\\n  <div class=\\"card-content bu-card-content\\">\\r\\n    <div class=\\"bu-media\\">\\r\\n      <div class=\\"bu-media-left\\">\\r\\n        <figure class=\\"bu-image bu-is-48x48\\">\\r\\n          <div\\r\\n            class=\\"square-place-holder\\"\\r\\n            style=\\" height: 100%; width:100%;\\"\\r\\n          >\\r\\n            <img\\r\\n              src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631671006/misc/Maliview_cswlog.png\\"\\r\\n              alt=\\"\\"\\r\\n            />\\r\\n          </div>\\r\\n        </figure>\\r\\n      </div>\\r\\n      {#if textPages[index]}\\r\\n        <h5 class=\\"title is-4 font-white\\">\\r\\n          {textPages[index].header}\\r\\n        </h5>\\r\\n      {/if}\\r\\n    </div>\\r\\n    <div\\r\\n      bind:this={mainText}\\r\\n      class=\\"content bu-is-clipped content font-white {showMore\\r\\n        ? 'show-more'\\r\\n        : ''}\\"\\r\\n    >\\r\\n      {#if textPages[index]}\\r\\n        {#each textPages[index].paragraphs as p}\\r\\n          {p}\\r\\n        {/each}\\r\\n      {/if}\\r\\n    </div>\\r\\n    <br />\\r\\n    {#if overFlowing}\\r\\n      <div\\r\\n        on:click={() => {\\r\\n          showMore = !showMore;\\r\\n        }}\\r\\n        class=\\"bu-level bu-is-mobile\\"\\r\\n      >\\r\\n        <div class=\\"bu-level-left\\">\\r\\n          <p class=\\"bu-level-left bu-level-item\\">Read More</p>\\r\\n          <span class=\\"bu-level-left bu-level-item bu-icon bu-is-small\\">\\r\\n            <Arrow styleP=\\"height:16px; width:16px;\\" {showMore} />\\r\\n          </span>\\r\\n        </div>\\r\\n      </div>\\r\\n    {/if}\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.main-image {\\n  object-fit: cover;\\n}\\n\\nh5 {\\n  font-family: Orator;\\n}\\n\\n.font-white {\\n  color: white;\\n}\\n\\n.square-place-holder {\\n  width: 100%;\\n  height: 100%;\\n}\\n.square-place-holder img {\\n  width: 100%;\\n  height: 100%;\\n  object-fit: cover;\\n}\\n\\n.card-content {\\n  background-color: transparent;\\n}\\n\\n.play-button-container {\\n  position: absolute;\\n  width: 25%;\\n  top: 50%;\\n  /* position the top  edge of the element at the middle of the parent */\\n  left: 50%;\\n  /* position the left edge of the element at the middle of the parent */\\n  transform: translate(-50%, -50%);\\n  height: auto;\\n  z-index: 5;\\n  object-fit: cover;\\n}\\n\\n.content {\\n  max-height: 20rem;\\n  overflow: hidden;\\n  display: -webkit-box;\\n  -webkit-line-clamp: 4;\\n  -webkit-box-orient: vertical;\\n}\\n\\n.card-container {\\n  display: flex;\\n  flex-direction: column;\\n  background-color: transparent;\\n}\\n.card-container:nth-child(4) .show-more {\\n  display: none !important;\\n}\\n\\n.blur {\\n  left: 0;\\n  right: 0;\\n  z-index: 0;\\n  position: relative;\\n}\\n.blur::before {\\n  pointer-events: none;\\n  position: absolute;\\n  content: \\"\\";\\n  height: 100%;\\n  display: block;\\n  left: 0;\\n  right: 0;\\n  top: 0;\\n  z-index: 2;\\n  -webkit-backdrop-filter: blur(5px);\\n  backdrop-filter: blur(5px);\\n}\\n@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {\\n  .blur::before {\\n    background: rgba(0, 0, 0, 0.5);\\n  }\\n}\\n\\n.show-more {\\n  display: block;\\n  max-height: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AA8JmB,WAAW,4BAAC,CAAC,AAC9B,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,EAAE,4BAAC,CAAC,AACF,WAAW,CAAE,MAAM,AACrB,CAAC,AAED,WAAW,4BAAC,CAAC,AACX,KAAK,CAAE,KAAK,AACd,CAAC,AAED,oBAAoB,4BAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,kCAAoB,CAAC,GAAG,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,aAAa,4BAAC,CAAC,AACb,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,sBAAsB,4BAAC,CAAC,AACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,GAAG,CACV,GAAG,CAAE,GAAG,CAER,IAAI,CAAE,GAAG,CAET,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,QAAQ,4BAAC,CAAC,AACR,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,WAAW,CACpB,kBAAkB,CAAE,CAAC,CACrB,kBAAkB,CAAE,QAAQ,AAC9B,CAAC,AAED,eAAe,4BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AACD,6BAAe,WAAW,CAAC,CAAC,CAAC,UAAU,cAAC,CAAC,AACvC,OAAO,CAAE,IAAI,CAAC,UAAU,AAC1B,CAAC,AAED,KAAK,4BAAC,CAAC,AACL,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,iCAAK,QAAQ,AAAC,CAAC,AACb,cAAc,CAAE,IAAI,CACpB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,KAAK,CACd,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,CAAC,CACV,uBAAuB,CAAE,KAAK,GAAG,CAAC,CAClC,eAAe,CAAE,KAAK,GAAG,CAAC,AAC5B,CAAC,AACD,UAAU,GAAG,CAAC,CAAC,CAAC,yBAAyB,IAAI,CAAC,CAAC,EAAE,CAAC,CAAC,iBAAiB,IAAI,CAAC,CAAC,AAAC,CAAC,AAC1E,iCAAK,QAAQ,AAAC,CAAC,AACb,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AAChC,CAAC,AACH,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,AAClB,CAAC"}`
};
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { index: index2 } = $$props;
  let mainText;
  const images2 = [
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg1_lcs2gw.jpg"
    },
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg2_oyi2w7.jpg"
    },
    { type: "carousel" },
    { type: "carousel" },
    {
      type: "image",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg"
    },
    {
      type: "video",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg4_ma0d9j.jpg",
      videoUrl: "https://www.youtube.com/embed/nTS10ZQM5Ms"
    },
    {
      type: "gallery",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg"
    },
    {
      type: "video",
      url: "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790322/misc/bgPhotos/drone_s8lkqw.png",
      videoUrl: "https://www.youtube.com/embed/l7h2P07cSbc"
    }
  ];
  onDestroy(() => {
  });
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  $$result.css.add(css$5);
  $$unsubscribe_modal();
  return `<div class="${"bu-card card-container svelte-ns3tmv"}"${add_attribute("id", navToLink[index2 + 1], 0)}><div class="${"bu-card-image"}"><figure class="${"bu-image bu-is-4by3 " + escape(images2[index2].type === "video" ? "blur" : "") + " svelte-ns3tmv"}">${images2[index2].type === "video" ? `<div class="${"play-button-container svelte-ns3tmv"}"><figure class="${"bu-image bu-is-square "}"><img src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/playButton_rbgj1t.png"}" alt="${""}"></figure></div>` : ``}
      <img loading="${"lazy"}" class="${"main-image svelte-ns3tmv"}"${add_attribute("src", images2[index2] && images2[index2].url, 0)} alt="${""}"></figure></div>
  <div class="${"card-content bu-card-content svelte-ns3tmv"}"><div class="${"bu-media"}"><div class="${"bu-media-left"}"><figure class="${"bu-image bu-is-48x48"}"><div class="${"square-place-holder svelte-ns3tmv"}" style="${"height: 100%; width:100%;"}"><img src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631671006/misc/Maliview_cswlog.png"}" alt="${""}" class="${"svelte-ns3tmv"}"></div></figure></div>
      ${textPages[index2] ? `<h5 class="${"title is-4 font-white svelte-ns3tmv"}">${escape(textPages[index2].header)}</h5>` : ``}</div>
    <div class="${"content bu-is-clipped content font-white " + escape("") + " svelte-ns3tmv"}"${add_attribute("this", mainText, 0)}>${textPages[index2] ? `${each(textPages[index2].paragraphs, (p) => `${escape(p)}`)}` : ``}</div>
    <br>
    ${``}</div>
</div>`;
});
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function tick_spring(ctx, last_value, current_value, target_value) {
  if (typeof current_value === "number" || is_date(current_value)) {
    const delta = target_value - current_value;
    const velocity = (current_value - last_value) / (ctx.dt || 1 / 60);
    const spring2 = ctx.opts.stiffness * delta;
    const damper = ctx.opts.damping * velocity;
    const acceleration = (spring2 - damper) * ctx.inv_mass;
    const d = (velocity + acceleration) * ctx.dt;
    if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
      return target_value;
    } else {
      ctx.settled = false;
      return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
    }
  } else if (Array.isArray(current_value)) {
    return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
  } else if (typeof current_value === "object") {
    const next_value = {};
    for (const k in current_value) {
      next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
    }
    return next_value;
  } else {
    throw new Error(`Cannot spring ${typeof current_value} values`);
  }
}
function spring(value, opts = {}) {
  const store = writable(value);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
  let last_time;
  let task;
  let current_token;
  let last_value = value;
  let target_value = value;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let cancel_task = false;
  function set(new_value, opts2 = {}) {
    target_value = new_value;
    const token = current_token = {};
    if (value == null || opts2.hard || spring2.stiffness >= 1 && spring2.damping >= 1) {
      cancel_task = true;
      last_time = now();
      last_value = new_value;
      store.set(value = target_value);
      return Promise.resolve();
    } else if (opts2.soft) {
      const rate = opts2.soft === true ? 0.5 : +opts2.soft;
      inv_mass_recovery_rate = 1 / (rate * 60);
      inv_mass = 0;
    }
    if (!task) {
      last_time = now();
      cancel_task = false;
      task = loop((now2) => {
        if (cancel_task) {
          cancel_task = false;
          task = null;
          return false;
        }
        inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
        const ctx = {
          inv_mass,
          opts: spring2,
          settled: true,
          dt: (now2 - last_time) * 60 / 1e3
        };
        const next_value = tick_spring(ctx, last_value, value, target_value);
        last_time = now2;
        last_value = value;
        store.set(value = next_value);
        if (ctx.settled) {
          task = null;
        }
        return !ctx.settled;
      });
    }
    return new Promise((fulfil) => {
      task.promise.then(() => {
        if (token === current_token)
          fulfil();
      });
    });
  }
  const spring2 = {
    set,
    update: (fn, opts2) => set(fn(target_value, value), opts2),
    subscribe: store.subscribe,
    stiffness,
    damping,
    precision
  };
  return spring2;
}
var PinchZoom_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: ".carousel-img.svelte-1ayejam{width:100%;height:100%;position:absolute;object-fit:cover}",
  map: '{"version":3,"file":"PinchZoom.svelte","sources":["PinchZoom.svelte"],"sourcesContent":["<script>\\r\\n  import { onMount, createEventDispatcher } from \\"svelte\\";\\r\\n  import { PinchGesture } from \\"@use-gesture/vanilla\\";\\r\\n  export let img;\\r\\n  let imageElementScale = 1;\\r\\n\\r\\n  let rangeMaxX = 0;\\r\\n  let rangeMinX = 0;\\r\\n  let testEle;\\r\\n  let testEle2;\\r\\n  let dx = 0;\\r\\n  let dy = 0;\\r\\n  let rangeMaxY = 0;\\r\\n  let rangeMinY = 0;\\r\\n  let imageElement;\\r\\n  let zoomLocation;\\r\\n  let imageElementWidth;\\r\\n  let imageElementHeight;\\r\\n\\r\\n  const minScale = 1;\\r\\n  const maxScale = 4;\\r\\n  const dispatch = createEventDispatcher();\\r\\n\\r\\n  const updateRange = () => {\\r\\n    const rangeX = Math.max(\\r\\n      0,\\r\\n      Math.round(imageElementWidth * imageElementScale) - imageElementWidth\\r\\n    ); // calculates the max value between the scaled image width and the actual image with\\r\\n    const rangeY = Math.max(\\r\\n      0,\\r\\n      Math.round(imageElementHeight * imageElementScale) - imageElementHeight\\r\\n    );\\r\\n\\r\\n    rangeMaxX = Math.round(rangeX);\\r\\n    rangeMinX = Math.round(-rangeMaxX);\\r\\n\\r\\n    rangeMaxY = Math.round(rangeY);\\r\\n    rangeMinY = Math.round(-rangeMaxY);\\r\\n  };\\r\\n  let pos;\\r\\n  const updateImage = (deltaX, deltaY, origin) => {\\r\\n    const imageElementCurrentX =\\r\\n      Math.min(Math.max(rangeMinX, deltaX), rangeMaxX) * 2;\\r\\n    const imageElementCurrentY =\\r\\n      Math.min(Math.max(rangeMinY, deltaY), rangeMaxY) * 2;\\r\\n\\r\\n    const transform = `translate3d(${imageElementCurrentX}px, ${imageElementCurrentY}px, 0) scale(${imageElementScale})`;\\r\\n\\r\\n    imageElement.style.transform = transform;\\r\\n    imageElement.style.transformOrigin = `${origin[0]}px ${origin[1] - pos}px`;\\r\\n    imageElement.style.WebkitTransform = transform;\\r\\n    imageElement.style.zIndex = \\"9999\\";\\r\\n  };\\r\\n\\r\\n  const resetImage = () => {\\r\\n    imageElement.style.transform = \\"\\";\\r\\n    imageElement.style.WebkitTransform = \\"\\";\\r\\n    imageElement.style.zIndex = \\"\\";\\r\\n    imageElement.style.transformOrigin = \\"\\";\\r\\n\\r\\n    rangeMaxX = 0;\\r\\n    rangeMinX = 0;\\r\\n    dy = 0;\\r\\n    dx = 0;\\r\\n    rangeMaxY = 0;\\r\\n    rangeMinY = 0;\\r\\n  };\\r\\n  let timeout;\\r\\n  onMount(() => {\\r\\n    imageElementWidth = imageElement.offsetWidth;\\r\\n    imageElementHeight = imageElement.offsetHeight;\\r\\n\\r\\n    new PinchGesture(\\r\\n      imageElement,\\r\\n      ({\\r\\n        // [d,a] absolute distance and angle of the two pointers\\r\\n        origin, // coordinates of the center between the two touch event\\r\\n\\r\\n        pinching,\\r\\n\\r\\n        cancel,\\r\\n        first,\\r\\n        last,\\r\\n        movement,\\r\\n      }) => {\\r\\n        if (timeout) {\\r\\n          clearTimeout(timeout);\\r\\n        }\\r\\n        if (first) {\\r\\n          pos = imageElement.getBoundingClientRect().top;\\r\\n          dispatch(\\"pinch\\", true);\\r\\n\\r\\n          zoomLocation = origin;\\r\\n        } else if (last) {\\r\\n          timeout = setTimeout(() => {\\r\\n            dispatch(\\"pinch\\", false);\\r\\n          }, 200);\\r\\n        }\\r\\n\\r\\n        dx = movement[0];\\r\\n        dy = movement[1];\\r\\n\\r\\n        imageElementScale = Math.min(Math.max(minScale, movement[0]), maxScale);\\r\\n\\r\\n        updateRange();\\r\\n        updateImage(dx, dy, zoomLocation);\\r\\n\\r\\n        if (!pinching) {\\r\\n          resetImage();\\r\\n          cancel();\\r\\n        }\\r\\n      },\\r\\n      {\\r\\n        pointer: {\\r\\n          touch: true,\\r\\n        },\\r\\n      }\\r\\n    );\\r\\n  });\\r\\n<\/script>\\r\\n\\r\\n<img\\r\\n  bind:this={imageElement}\\r\\n  class=\\"carousel-img\\"\\r\\n  loading=\\"lazy\\"\\r\\n  src={img}\\r\\n  draggable=\\"false\\"\\r\\n  alt=\\"\\"\\r\\n/>\\r\\n\\r\\n<style lang=\\"scss\\">.b-dot {\\n  position: absolute;\\n  width: 20px;\\n  height: 20px;\\n  z-index: 123123123123;\\n  border-radius: 50%;\\n  top: 0;\\n  background-color: blue;\\n}\\n\\n.red-dot {\\n  position: absolute;\\n  width: 20px;\\n  height: 20px;\\n  z-index: 123123123123;\\n  border-radius: 50%;\\n  top: 0;\\n  background-color: red;\\n}\\n\\n.carousel-img {\\n  width: 100%;\\n  height: 100%;\\n  position: absolute;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAsJA,aAAa,eAAC,CAAC,AACb,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,KAAK,AACnB,CAAC"}'
};
const PinchZoom = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { img } = $$props;
  let imageElement;
  createEventDispatcher();
  if ($$props.img === void 0 && $$bindings.img && img !== void 0)
    $$bindings.img(img);
  $$result.css.add(css$4);
  return `<img class="${"carousel-img svelte-1ayejam"}" loading="${"lazy"}"${add_attribute("src", img, 0)} draggable="${"false"}" alt="${""}"${add_attribute("this", imageElement, 0)}>`;
});
var CardCarousel_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: ".page-arrow-container.svelte-15wnr6z.svelte-15wnr6z{width:30px;height:30px;position:absolute;border-radius:50%;background-color:rgba(0, 0, 0, 0.5);border:none;overflow:hidden}.page-arrow-container.svelte-15wnr6z .page-arrow-relative.svelte-15wnr6z{position:absolute;top:0;left:0;bottom:0;right:0;padding:5px;margin:auto}.indicator.svelte-15wnr6z.svelte-15wnr6z{z-index:3;font-weight:600;text-align:center;letter-spacing:0.2em;bottom:5px;left:5px;position:absolute;padding:5px 15px;border-radius:14px;background-color:black;color:white;display:flex;justify-content:center}.indicator.svelte-15wnr6z p.svelte-15wnr6z{margin-right:-0.2em}.square-place-holder.svelte-15wnr6z.svelte-15wnr6z{width:100%;height:100%}.square-place-holder.svelte-15wnr6z img.svelte-15wnr6z{width:100%;height:100%;object-fit:cover}h5.svelte-15wnr6z.svelte-15wnr6z{font-family:Orator}.font-white.svelte-15wnr6z.svelte-15wnr6z{color:white}.card-content.svelte-15wnr6z.svelte-15wnr6z{background-color:transparent}.content.svelte-15wnr6z.svelte-15wnr6z{max-height:20rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}.card-container.svelte-15wnr6z.svelte-15wnr6z{display:flex;flex-direction:column;background-color:transparent}.carousel-container.svelte-15wnr6z .glide-image-container.svelte-15wnr6z{display:flex;padding-bottom:100%;height:0;position:relative;justify-content:center}.page-arrow-container.svelte-15wnr6z.svelte-15wnr6z{width:30px;border-radius:50%;position:absolute;border:none;overflow:hidden;height:30px;bottom:0}.arrow-left.svelte-15wnr6z.svelte-15wnr6z{right:40px;bottom:5px}.show-more.svelte-15wnr6z.svelte-15wnr6z{display:block;max-height:100%}.arrow-right.svelte-15wnr6z.svelte-15wnr6z{transform:rotate(180deg);right:5px;bottom:5px}",
  map: `{"version":3,"file":"CardCarousel.svelte","sources":["CardCarousel.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { browser } from \\"$app/env\\";\\r\\n  import Glide from \\"@glidejs/glide\\";\\r\\n  import { onDestroy, onMount } from \\"svelte\\";\\r\\n  import { navToLink, textPages } from \\"../../pageContent\\";\\r\\n  import { DragGesture } from \\"@use-gesture/vanilla\\";\\r\\n  import { spring } from \\"svelte/motion\\";\\r\\n\\r\\n  import Arrow from \\"../Card/Arrow.svelte\\";\\r\\n  import PinchZoom from \\"../PinchZoom.svelte\\";\\r\\n  export let index;\\r\\n  export let page;\\r\\n  let carousel;\\r\\n  let glide;\\r\\n  let showMore = false;\\r\\n  let slider;\\r\\n  let overFlowing;\\r\\n  let mainText;\\r\\n  let shouldDrag = true;\\r\\n  let glideContainer;\\r\\n  let currInd = 0;\\r\\n\\r\\n  let carouselWidth;\\r\\n  let sliderThresh = 80;\\r\\n\\r\\n  const images = {\\r\\n    renders: [\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887731/rendersHighRes/33340_MULHOLLAND_INT_IMG_12A_00-min_ciecgp.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887728/rendersHighRes/33340_MULHOLLAND_INT_IMG_14A-min_a51cfk.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_16A_00-min_qgp2ne.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_24A-min_hsnpta.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_26A-min_d1dxwf.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_26B-min_jthbj4.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887728/rendersHighRes/33340_MULHOLLAND_INT_IMG_30A-min_yvenyq.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_31A-min_mo1cj5.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887728/rendersHighRes/33340_MULHOLLAND_INT_IMG_34A-min_z5fw2h.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887730/rendersHighRes/33340_MULHOLLAND_INT_IMG_34B-min_ggb1xk.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887730/rendersHighRes/33340_MULHOLLAND_INT_IMG_34C-min_y3bogv.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887730/rendersHighRes/33340_MULHOLLAND_INT_IMG_3A_00-min_b0yvdi.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630887731/rendersHighRes/33340_MULHOLLAND_INT_IMG_4A-min_ihzxkw.jpg\\",\\r\\n    ],\\r\\n    floorplans: [\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1633199065/FloorPlans/33340_Mullholland_Hwy_SITE_PLAN_gbvv7f.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1633199064/FloorPlans/33340_Mullholland_Hwy_1ST_FLOOR_BLACK_20211001_qrb856.jpg\\",\\r\\n      \\"https://res.cloudinary.com/dt4xntymn/image/upload/v1633199063/FloorPlans/33340_Mullholland_Hwy_2ND_FLOOR_20211001_cmgvbq.jpg\\",\\r\\n    ],\\r\\n  };\\r\\n\\r\\n  const xVal = spring(0, { stiffness: 0.1, damping: 0.89 });\\r\\n\\r\\n  onMount(() => {\\r\\n    carouselWidth = carousel.offsetWidth * images[page.title].length;\\r\\n    new DragGesture(\\r\\n      slider,\\r\\n      ({ direction, movement, down }) => {\\r\\n        if (shouldDrag) {\\r\\n          xVal.set((carousel.offsetWidth + 10) * currInd * -1 + movement[0]);\\r\\n\\r\\n          if (!down) {\\r\\n            if (\\r\\n              Math.abs(movement[0]) > sliderThresh &&\\r\\n              currInd === images[page.title].length - 1 &&\\r\\n              movement[0] < 0\\r\\n            ) {\\r\\n              xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\r\\n              return;\\r\\n            }\\r\\n            if (\\r\\n              Math.abs(movement[0]) > sliderThresh &&\\r\\n              currInd === 0 &&\\r\\n              movement[0] > 0\\r\\n            ) {\\r\\n              xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\r\\n              return;\\r\\n            }\\r\\n            if (Math.abs(movement[0]) > sliderThresh) {\\r\\n              if (movement[0] < -1) {\\r\\n                currInd += 1;\\r\\n              } else {\\r\\n                currInd -= 1;\\r\\n              }\\r\\n\\r\\n              xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n            } else {\\r\\n              xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n            }\\r\\n          }\\r\\n        }\\r\\n      },\\r\\n      {\\r\\n        pointer: {\\r\\n          touch: true,\\r\\n        },\\r\\n      }\\r\\n    );\\r\\n    glide = new Glide(carousel, {\\r\\n      swipeThreshold: false,\\r\\n      dragThreshold: false,\\r\\n    });\\r\\n    glide.mount({\\r\\n      Resize: function (Glide, Components, Events) {\\r\\n        return {};\\r\\n      },\\r\\n    });\\r\\n    if (browser) {\\r\\n      window.addEventListener(\\"resize\\", resize);\\r\\n    }\\r\\n\\r\\n    resize();\\r\\n    xVal.subscribe((v) => {\\r\\n      slider.style.transform = \`translate(\${v}px,0px)\`;\\r\\n    });\\r\\n  });\\r\\n  function resize() {\\r\\n    carouselWidth = carousel.offsetWidth;\\r\\n    slider.style.width =\\r\\n      carousel.offsetWidth * (images[page.title].length + 1) * 5 + \\"px\\";\\r\\n    carousel.style.width = xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n    if (mainText.scrollHeight > mainText.clientHeight) {\\r\\n      overFlowing = true;\\r\\n    } else {\\r\\n      overFlowing = false;\\r\\n    }\\r\\n  }\\r\\n\\r\\n  onDestroy(() => {\\r\\n    if (browser) {\\r\\n      window.removeEventListener(\\"resize\\", resize);\\r\\n    }\\r\\n  });\\r\\n\\r\\n  $: {\\r\\n    if (glide) {\\r\\n      if (!shouldDrag) {\\r\\n        glide.disable();\\r\\n      } else {\\r\\n        glide.enable();\\r\\n      }\\r\\n    }\\r\\n  }\\r\\n  const handleCarousel = (val) => {\\r\\n    if (currInd === 0 && val === -1) {\\r\\n      return;\\r\\n    } else if (currInd === images[page.title].length - 1 && val === 1) {\\r\\n      return;\\r\\n    } else {\\r\\n      currInd += val;\\r\\n      xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n    }\\r\\n  };\\r\\n<\/script>\\r\\n\\r\\n<div id={navToLink[index + 2]} class=\\"bu-card card-container\\">\\r\\n  <div class=\\"carousel-container\\">\\r\\n    <div bind:this={carousel} class=\\"glide\\">\\r\\n      <div class=\\"indicator\\">\\r\\n        {#if glide}\\r\\n          <p>\\r\\n            {currInd + 1}/{images[page.title].length}\\r\\n          </p>\\r\\n        {/if}\\r\\n      </div>\\r\\n      <div class=\\"glide__track\\" data-glide-el=\\"track\\">\\r\\n        <ul bind:this={slider} class=\\"glide__slides\\">\\r\\n          {#each images[page.title] as img, i}\\r\\n            <li\\r\\n              style=\\"width:{glideContainer ? carouselWidth : ''}px\\"\\r\\n              bind:this={glideContainer}\\r\\n              class=\\"glide__slide\\"\\r\\n            >\\r\\n              <div class=\\"glide-image-container\\">\\r\\n                <PinchZoom\\r\\n                  on:pinch={(e) => {\\r\\n                    shouldDrag = !e.detail;\\r\\n                  }}\\r\\n                  {img}\\r\\n                />\\r\\n              </div>\\r\\n            </li>\\r\\n          {/each}\\r\\n        </ul>\\r\\n      </div>\\r\\n      <div class=\\"glide__arrows\\" data-glide-el=\\"controls\\">\\r\\n        <button\\r\\n          class=\\"glide__arrow page-arrow-container glide__arrow--left arrow-left\\"\\r\\n          on:click={() => {\\r\\n            handleCarousel(-1);\\r\\n          }}\\r\\n        >\\r\\n          <div class=\\"page-arrow-relative\\">\\r\\n            <Arrow\\r\\n              styleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n            />\\r\\n          </div></button\\r\\n        >\\r\\n        <button\\r\\n          on:click={() => {\\r\\n            handleCarousel(1);\\r\\n          }}\\r\\n          class=\\"glide__arrow  page-arrow-container glide__arrow--right arrow-right\\"\\r\\n        >\\r\\n          <div class=\\"page-arrow-relative\\">\\r\\n            <Arrow\\r\\n              styleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n            />\\r\\n          </div>\\r\\n        </button>\\r\\n      </div>\\r\\n    </div>\\r\\n  </div>\\r\\n  <div class=\\"card-content bu-card-content\\">\\r\\n    <div class=\\"bu-media\\">\\r\\n      <div class=\\"bu-media-left\\">\\r\\n        <figure class=\\"bu-image bu-is-48x48\\">\\r\\n          <div class=\\"square-place-holder\\" style=\\" height: 100%; width:100%;\\">\\r\\n            <img\\r\\n              src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631671006/misc/Maliview_cswlog.png\\"\\r\\n              alt=\\"\\"\\r\\n            />\\r\\n          </div>\\r\\n        </figure>\\r\\n      </div>\\r\\n      {#if textPages[index]}\\r\\n        <h5 class=\\"title is-4 font-white\\">\\r\\n          {textPages[index].header}\\r\\n        </h5>\\r\\n      {/if}\\r\\n    </div>\\r\\n    <div\\r\\n      bind:this={mainText}\\r\\n      class=\\"content bu-is-clipped content font-white {showMore\\r\\n        ? 'show-more'\\r\\n        : ''}\\"\\r\\n    >\\r\\n      {#if textPages[index]}\\r\\n        {#each textPages[index].paragraphs as p}\\r\\n          <p>{p}</p>\\r\\n        {/each}\\r\\n      {/if}\\r\\n    </div>\\r\\n    <br />\\r\\n    {#if overFlowing}\\r\\n      <div\\r\\n        on:click={() => {\\r\\n          showMore = !showMore;\\r\\n        }}\\r\\n        class=\\"bu-level bu-is-mobile\\"\\r\\n      >\\r\\n        <div class=\\"bu-level-left\\">\\r\\n          <p class=\\"bu-level-left bu-level-item\\">Read More</p>\\r\\n          <span class=\\"bu-level-left bu-level-item bu-icon bu-is-small\\">\\r\\n            <Arrow styleP=\\"height:16px; width:16px;\\" {showMore} />\\r\\n          </span>\\r\\n        </div>\\r\\n      </div>\\r\\n    {/if}\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.page-arrow-container {\\n  width: 30px;\\n  height: 30px;\\n  position: absolute;\\n  border-radius: 50%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: none;\\n  overflow: hidden;\\n}\\n.page-arrow-container .page-arrow-relative {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  bottom: 0;\\n  right: 0;\\n  padding: 5px;\\n  margin: auto;\\n}\\n\\n.indicator {\\n  z-index: 3;\\n  font-weight: 600;\\n  text-align: center;\\n  letter-spacing: 0.2em;\\n  bottom: 5px;\\n  left: 5px;\\n  position: absolute;\\n  padding: 5px 15px;\\n  border-radius: 14px;\\n  background-color: black;\\n  color: white;\\n  display: flex;\\n  justify-content: center;\\n}\\n.indicator p {\\n  margin-right: -0.2em;\\n}\\n\\n.square-place-holder {\\n  width: 100%;\\n  height: 100%;\\n}\\n.square-place-holder img {\\n  width: 100%;\\n  height: 100%;\\n  object-fit: cover;\\n}\\n\\nh5 {\\n  font-family: Orator;\\n}\\n\\n.font-white {\\n  color: white;\\n}\\n\\n.card-content {\\n  background-color: transparent;\\n}\\n\\n.content {\\n  max-height: 20rem;\\n  overflow: hidden;\\n  display: -webkit-box;\\n  -webkit-line-clamp: 4;\\n  -webkit-box-orient: vertical;\\n}\\n\\n.card-container {\\n  display: flex;\\n  flex-direction: column;\\n  background-color: transparent;\\n}\\n\\n.carousel-container .glide-image-container {\\n  display: flex;\\n  padding-bottom: 100%;\\n  height: 0;\\n  position: relative;\\n  justify-content: center;\\n}\\n\\n.page-arrow-container {\\n  width: 30px;\\n  border-radius: 50%;\\n  position: absolute;\\n  border: none;\\n  overflow: hidden;\\n  height: 30px;\\n  bottom: 0;\\n}\\n\\n.arrow-left {\\n  right: 40px;\\n  bottom: 5px;\\n}\\n\\n.show-more {\\n  display: block;\\n  max-height: 100%;\\n}\\n\\n.arrow-right {\\n  transform: rotate(180deg);\\n  right: 5px;\\n  bottom: 5px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAqQmB,qBAAqB,8BAAC,CAAC,AACxC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,oCAAqB,CAAC,oBAAoB,eAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,KAAK,CACrB,MAAM,CAAE,GAAG,CACX,IAAI,CAAE,GAAG,CACT,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,yBAAU,CAAC,CAAC,eAAC,CAAC,AACZ,YAAY,CAAE,MAAM,AACtB,CAAC,AAED,oBAAoB,8BAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,mCAAoB,CAAC,GAAG,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,WAAW,CAAE,MAAM,AACrB,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,KAAK,CAAE,KAAK,AACd,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,QAAQ,8BAAC,CAAC,AACR,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,WAAW,CACpB,kBAAkB,CAAE,CAAC,CACrB,kBAAkB,CAAE,QAAQ,AAC9B,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,kCAAmB,CAAC,sBAAsB,eAAC,CAAC,AAC1C,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,IAAI,CACpB,MAAM,CAAE,CAAC,CACT,QAAQ,CAAE,QAAQ,CAClB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,CAChB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,CAAC,AACX,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,AACb,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,SAAS,CAAE,OAAO,MAAM,CAAC,CACzB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
const CardCarousel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { index: index2 } = $$props;
  let { page } = $$props;
  let carousel;
  let slider;
  let mainText;
  let glideContainer;
  const images2 = {
    renders: [
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887731/rendersHighRes/33340_MULHOLLAND_INT_IMG_12A_00-min_ciecgp.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887728/rendersHighRes/33340_MULHOLLAND_INT_IMG_14A-min_a51cfk.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_16A_00-min_qgp2ne.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_24A-min_hsnpta.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_26A-min_d1dxwf.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_26B-min_jthbj4.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887728/rendersHighRes/33340_MULHOLLAND_INT_IMG_30A-min_yvenyq.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887729/rendersHighRes/33340_MULHOLLAND_INT_IMG_31A-min_mo1cj5.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887728/rendersHighRes/33340_MULHOLLAND_INT_IMG_34A-min_z5fw2h.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887730/rendersHighRes/33340_MULHOLLAND_INT_IMG_34B-min_ggb1xk.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887730/rendersHighRes/33340_MULHOLLAND_INT_IMG_34C-min_y3bogv.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887730/rendersHighRes/33340_MULHOLLAND_INT_IMG_3A_00-min_b0yvdi.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1630887731/rendersHighRes/33340_MULHOLLAND_INT_IMG_4A-min_ihzxkw.jpg"
    ],
    floorplans: [
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199065/FloorPlans/33340_Mullholland_Hwy_SITE_PLAN_gbvv7f.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199064/FloorPlans/33340_Mullholland_Hwy_1ST_FLOOR_BLACK_20211001_qrb856.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199063/FloorPlans/33340_Mullholland_Hwy_2ND_FLOOR_20211001_cmgvbq.jpg"
    ]
  };
  spring(0, { stiffness: 0.1, damping: 0.89 });
  onDestroy(() => {
  });
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$3);
  return `<div${add_attribute("id", navToLink[index2 + 2], 0)} class="${"bu-card card-container svelte-15wnr6z"}"><div class="${"carousel-container svelte-15wnr6z"}"><div class="${"glide"}"${add_attribute("this", carousel, 0)}><div class="${"indicator svelte-15wnr6z"}">${``}</div>
      <div class="${"glide__track"}" data-glide-el="${"track"}"><ul class="${"glide__slides"}"${add_attribute("this", slider, 0)}>${each(images2[page.title], (img, i) => `<li style="${"width:" + escape("") + "px"}" class="${"glide__slide"}"${add_attribute("this", glideContainer, 0)}><div class="${"glide-image-container svelte-15wnr6z"}">${validate_component(PinchZoom, "PinchZoom").$$render($$result, { img }, {}, {})}</div>
            </li>`)}</ul></div>
      <div class="${"glide__arrows"}" data-glide-el="${"controls"}"><button class="${"glide__arrow page-arrow-container glide__arrow--left arrow-left svelte-15wnr6z"}"><div class="${"page-arrow-relative svelte-15wnr6z"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button>
        <button class="${"glide__arrow page-arrow-container glide__arrow--right arrow-right svelte-15wnr6z"}"><div class="${"page-arrow-relative svelte-15wnr6z"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button></div></div></div>
  <div class="${"card-content bu-card-content svelte-15wnr6z"}"><div class="${"bu-media"}"><div class="${"bu-media-left"}"><figure class="${"bu-image bu-is-48x48"}"><div class="${"square-place-holder svelte-15wnr6z"}" style="${"height: 100%; width:100%;"}"><img src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631671006/misc/Maliview_cswlog.png"}" alt="${""}" class="${"svelte-15wnr6z"}"></div></figure></div>
      ${textPages[index2] ? `<h5 class="${"title is-4 font-white svelte-15wnr6z"}">${escape(textPages[index2].header)}</h5>` : ``}</div>
    <div class="${"content bu-is-clipped content font-white " + escape("") + " svelte-15wnr6z"}"${add_attribute("this", mainText, 0)}>${textPages[index2] ? `${each(textPages[index2].paragraphs, (p) => `<p>${escape(p)}</p>`)}` : ``}</div>
    <br>
    ${``}</div>
</div>`;
});
var CardCredits_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: '.credits-title.svelte-1muos5l.svelte-1muos5l{font-family:Orator;font-size:1.5em}.mobile-container.svelte-1muos5l.svelte-1muos5l{width:100%;padding:20px;text-align:center}.mobile-container.svelte-1muos5l .mobile-header-container.svelte-1muos5l{font-size:1.6em;margin-bottom:1rem}.mobile-container.svelte-1muos5l .mobile-credits-container.svelte-1muos5l{margin-bottom:2rem;opacity:0}.mobile-container.svelte-1muos5l .mobile-credits-container.svelte-1muos5l:not(:last-child)::after{content:"";display:block;width:50px;height:1px;padding:20px;margin:auto;border-bottom:1px solid white}h5.svelte-1muos5l.svelte-1muos5l{font-size:1em;margin-bottom:20px;color:white}@media(max-width: 1040px){h5.svelte-1muos5l.svelte-1muos5l{margin-bottom:10px;font-size:0.7em}}p.svelte-1muos5l.svelte-1muos5l{color:white;font-family:"Roboto", sans-serif;font-size:0.8em}',
  map: '{"version":3,"file":"CardCredits.svelte","sources":["CardCredits.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { creditsContent } from \\"../../pageContent\\";\\r\\n\\r\\n\\r\\n<\/script>\\r\\n\\r\\n<div id=\\"credits\\" class=\\"mobile-container\\">\\r\\n  <div class=\\"mobile-header-container\\">\\r\\n    <h5 class=\\"credits-title\\">development credits</h5>\\r\\n  </div>\\r\\n  {#each creditsContent as credit}\\r\\n    <div class=\\"mobile-credits-container\\">\\r\\n      <h5 class=\\"bu-header\\">{credit.header}</h5>\\r\\n      {#each credit.paragraphs as p}\\r\\n        <p>{p}</p>\\r\\n      {/each}\\r\\n    </div>\\r\\n  {/each}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.credits-title {\\n  font-family: Orator;\\n  font-size: 1.5em;\\n}\\n\\n.mobile-container {\\n  width: 100%;\\n  padding: 20px;\\n  text-align: center;\\n}\\n.mobile-container .mobile-header-container {\\n  font-size: 1.6em;\\n  margin-bottom: 1rem;\\n}\\n.mobile-container .mobile-credits-container {\\n  margin-bottom: 2rem;\\n  opacity: 0;\\n}\\n.mobile-container .mobile-credits-container:not(:last-child)::after {\\n  content: \\"\\";\\n  display: block;\\n  width: 50px;\\n  height: 1px;\\n  padding: 20px;\\n  margin: auto;\\n  border-bottom: 1px solid white;\\n}\\n\\nh5 {\\n  font-size: 1em;\\n  margin-bottom: 20px;\\n  color: white;\\n}\\n@media (max-width: 1040px) {\\n  h5 {\\n    margin-bottom: 10px;\\n    font-size: 0.7em;\\n  }\\n}\\n\\np {\\n  color: white;\\n  font-family: \\"Roboto\\", sans-serif;\\n  font-size: 0.8em;\\n}</style>\\r\\n"],"names":[],"mappings":"AAoBmB,cAAc,8BAAC,CAAC,AACjC,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,KAAK,AAClB,CAAC,AAED,iBAAiB,8BAAC,CAAC,AACjB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,wBAAwB,eAAC,CAAC,AAC1C,SAAS,CAAE,KAAK,CAChB,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,gCAAiB,CAAC,yBAAyB,eAAC,CAAC,AAC3C,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,gCAAiB,CAAC,wCAAyB,KAAK,WAAW,CAAC,OAAO,AAAC,CAAC,AACnE,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AAChC,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,GAAG,CACd,aAAa,CAAE,IAAI,CACnB,KAAK,CAAE,KAAK,AACd,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,EAAE,8BAAC,CAAC,AACF,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC,AAED,CAAC,8BAAC,CAAC,AACD,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,SAAS,CAAE,KAAK,AAClB,CAAC"}'
};
const CardCredits = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<div id="${"credits"}" class="${"mobile-container svelte-1muos5l"}"><div class="${"mobile-header-container svelte-1muos5l"}"><h5 class="${"credits-title svelte-1muos5l"}">development credits</h5></div>
  ${each(creditsContent, (credit) => `<div class="${"mobile-credits-container svelte-1muos5l"}"><h5 class="${"bu-header svelte-1muos5l"}">${escape(credit.header)}</h5>
      ${each(credit.paragraphs, (p) => `<p class="${"svelte-1muos5l"}">${escape(p)}</p>`)}
    </div>`)}
</div>`;
});
var CardGallery_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: '.container.svelte-iyyz4g.svelte-iyyz4g{max-height:500px;overflow:hidden;height:100%;display:flex;justify-content:center;flex-direction:column;align-items:center;padding:20px;gap:20px;margin-bottom:20px}.curr-phase-container.svelte-iyyz4g.svelte-iyyz4g{display:flex;color:white;gap:10px;text-transform:uppercase}.curr-phase-container.svelte-iyyz4g h5.svelte-iyyz4g{cursor:pointer}.curr-phase-container.svelte-iyyz4g .phase-label.svelte-iyyz4g::after{content:"";display:block;width:100%;height:1px;background-color:white}@keyframes svelte-iyyz4g-example{0%{opacity:0}100%{width:100%}}.bu-title.svelte-iyyz4g.svelte-iyyz4g{font-family:Orator;color:white;font-weight:200}.gallery-container.svelte-iyyz4g.svelte-iyyz4g{display:grid;width:100%;gap:6px;overflow-y:auto;grid-template-columns:repeat(4, minmax(50px, 1fr))}.image-container.svelte-iyyz4g.svelte-iyyz4g{position:relative;padding-bottom:100%}.image-container.svelte-iyyz4g img.svelte-iyyz4g{height:100%;object-fit:cover;width:100%;border-radius:4px;animation-fill-mode:forwards;position:absolute}',
  map: '{"version":3,"file":"CardGallery.svelte","sources":["CardGallery.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { highResBts } from \\"../../pageContent\\";\\r\\n  import { modal } from \\"../../stores\\";\\r\\n  import { images } from \\"../Gallery/galleryImages\\";\\r\\n  let currPhase = \\"phase 1\\";\\r\\n  const phases = [\\"phase 1\\", \\"phase 2\\"];\\r\\n<\/script>\\r\\n\\r\\n<div>\\r\\n  <div id=\\"behind-the-scenes\\" class=\\"container\\">\\r\\n    <div><h5 class=\\"bu-title bu-has-text-centered\\">behind the scenes</h5></div>\\r\\n    <div class=\\"curr-phase-container\\">\\r\\n      {#each phases as phase}\\r\\n        <h5\\r\\n          class:phase-label={phase === currPhase}\\r\\n          on:click={() => {\\r\\n            currPhase = phase;\\r\\n          }}\\r\\n        >\\r\\n          {phase}\\r\\n        </h5>\\r\\n      {/each}\\r\\n    </div>\\r\\n    <div class=\\"gallery-container\\">\\r\\n      {#each images[currPhase] as image, i}\\r\\n        <div class=\\"image-container\\">\\r\\n          <img\\r\\n            src={image}\\r\\n            on:click={() => {\\r\\n              $modal.visibility = true;\\r\\n              $modal.content = highResBts[currPhase][i];\\r\\n              $modal.type = \\"image\\";\\r\\n            }}\\r\\n            loading=\\"lazy\\"\\r\\n            alt=\\"\\"\\r\\n          />\\r\\n        </div>{/each}\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  max-height: 500px;\\n  overflow: hidden;\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n  flex-direction: column;\\n  align-items: center;\\n  padding: 20px;\\n  gap: 20px;\\n  margin-bottom: 20px;\\n}\\n\\n.curr-phase-container {\\n  display: flex;\\n  color: white;\\n  gap: 10px;\\n  text-transform: uppercase;\\n}\\n.curr-phase-container h5 {\\n  cursor: pointer;\\n}\\n.curr-phase-container .phase-label::after {\\n  content: \\"\\";\\n  display: block;\\n  width: 100%;\\n  height: 1px;\\n  background-color: white;\\n}\\n\\n@keyframes example {\\n  0% {\\n    opacity: 0;\\n  }\\n  100% {\\n    width: 100%;\\n  }\\n}\\n.bu-title {\\n  font-family: Orator;\\n  color: white;\\n  font-weight: 200;\\n}\\n\\n.gallery-container {\\n  display: grid;\\n  width: 100%;\\n  gap: 6px;\\n  overflow-y: auto;\\n  grid-template-columns: repeat(4, minmax(50px, 1fr));\\n}\\n\\n.image-container {\\n  position: relative;\\n  padding-bottom: 100%;\\n}\\n.image-container img {\\n  height: 100%;\\n  object-fit: cover;\\n  width: 100%;\\n  border-radius: 4px;\\n  animation-fill-mode: forwards;\\n  position: absolute;\\n}</style>\\r\\n"],"names":[],"mappings":"AAyCmB,UAAU,4BAAC,CAAC,AAC7B,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,CACT,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,qBAAqB,4BAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,KAAK,CACZ,GAAG,CAAE,IAAI,CACT,cAAc,CAAE,SAAS,AAC3B,CAAC,AACD,mCAAqB,CAAC,EAAE,cAAC,CAAC,AACxB,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,mCAAqB,CAAC,0BAAY,OAAO,AAAC,CAAC,AACzC,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,WAAW,qBAAQ,CAAC,AAClB,EAAE,AAAC,CAAC,AACF,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,SAAS,4BAAC,CAAC,AACT,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,kBAAkB,4BAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,GAAG,CAAE,GAAG,CACR,UAAU,CAAE,IAAI,CAChB,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,OAAO,IAAI,CAAC,CAAC,GAAG,CAAC,CAAC,AACrD,CAAC,AAED,gBAAgB,4BAAC,CAAC,AAChB,QAAQ,CAAE,QAAQ,CAClB,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,8BAAgB,CAAC,GAAG,cAAC,CAAC,AACpB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,mBAAmB,CAAE,QAAQ,CAC7B,QAAQ,CAAE,QAAQ,AACpB,CAAC"}'
};
const CardGallery = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let currPhase = "phase 1";
  const phases = ["phase 1", "phase 2"];
  $$result.css.add(css$1);
  $$unsubscribe_modal();
  return `<div><div id="${"behind-the-scenes"}" class="${"container svelte-iyyz4g"}"><div><h5 class="${"bu-title bu-has-text-centered svelte-iyyz4g"}">behind the scenes</h5></div>
    <div class="${"curr-phase-container svelte-iyyz4g"}">${each(phases, (phase) => `<h5 class="${["svelte-iyyz4g", phase === currPhase ? "phase-label" : ""].join(" ").trim()}">${escape(phase)}
        </h5>`)}</div>
    <div class="${"gallery-container svelte-iyyz4g"}">${each(images[currPhase], (image, i) => `<div class="${"image-container svelte-iyyz4g"}"><img${add_attribute("src", image, 0)} loading="${"lazy"}" alt="${""}" class="${"svelte-iyyz4g"}">
        </div>`)}</div></div>
</div>`;
});
var CardContainer_svelte_svelte_type_style_lang = "";
const css = {
  code: ".bg-image-container.svelte-1fu2nnh.svelte-1fu2nnh{position:absolute;z-index:1;width:100%;height:100%}.bg-image-container.svelte-1fu2nnh .bg-image.svelte-1fu2nnh{width:100%;object-fit:cover;height:100%}.contact-us-container.svelte-1fu2nnh.svelte-1fu2nnh{width:100%;padding:30px;height:100vh}.card-container.svelte-1fu2nnh.svelte-1fu2nnh{position:relative;background-color:#2c2a2b}.logo-wrapper.svelte-1fu2nnh.svelte-1fu2nnh{z-index:2;position:relative;width:100vw;height:100vh;display:flex;justify-content:center;align-items:center}.logo-wrapper.svelte-1fu2nnh .logo-container.svelte-1fu2nnh{max-width:55%}.logo-wrapper.svelte-1fu2nnh .logo-container .image-logo.svelte-1fu2nnh{object-fit:contain;width:100%}",
  map: '{"version":3,"file":"CardContainer.svelte","sources":["CardContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import Card from \\"../Card/Card.svelte\\";\\r\\n  import CardCarousel from \\"../CardCarousel/CardCarousel.svelte\\";\\r\\n  import CardCredits from \\"../CardCredits/CardCredits.svelte\\";\\r\\n  import CardGallery from \\"../CardGallery/CardGallery.svelte\\";\\r\\n  import ContactUs from \\"../ContactUs/ContactUs.svelte\\";\\r\\n\\r\\n  const cardLayout = [\\r\\n    {\\r\\n      title: \\"malibu life\\",\\r\\n      type: \\"image\\",\\r\\n    },\\r\\n    {\\r\\n      title: \\"discover\\",\\r\\n      type: \\"image\\",\\r\\n    },\\r\\n    {\\r\\n      title: \\"renders\\",\\r\\n      type: \\"carousel\\",\\r\\n    },\\r\\n    {\\r\\n      title: \\"floorplans\\",\\r\\n      type: \\"carousel\\",\\r\\n    },\\r\\n    {\\r\\n      title: \\"equestrian\\",\\r\\n      type: \\"image\\",\\r\\n    },\\r\\n\\r\\n    {\\r\\n      title: \\"video render\\",\\r\\n      type: \\"video\\",\\r\\n    },\\r\\n    {\\r\\n      title: \\"behind the scenes\\",\\r\\n      type: \\"gallery\\",\\r\\n    },\\r\\n    {\\r\\n      title: \\"drone footage\\",\\r\\n      type: \\"video\\",\\r\\n    },\\r\\n  ];\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"card-wrapper\\">\\r\\n  <div class=\\"bg-image-container\\">\\r\\n    <img\\r\\n      class=\\"bg-image\\"\\r\\n      src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1631654002/homebg/Horses_Running_t0wcvh.jpg\\"\\r\\n      alt=\\"\\"\\r\\n    />\\r\\n  </div>\\r\\n  <div id=\\"home\\" class=\\"logo-wrapper\\">\\r\\n    <div class=\\"logo-container\\">\\r\\n      <img\\r\\n        class=\\"image-logo\\"\\r\\n        src=\\"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/homeLogo_yufrin.png\\"\\r\\n        alt=\\"\\"\\r\\n      />\\r\\n    </div>\\r\\n  </div>\\r\\n  <div class=\\"card-container\\">\\r\\n    {#each cardLayout as card, i}\\r\\n      {#if cardLayout[i].type === \\"image\\" || cardLayout[i].type === \\"video\\"}\\r\\n        <Card page={card} index={i} />\\r\\n      {:else if cardLayout[i].type === \\"gallery\\"}\\r\\n        <CardGallery />\\r\\n      {:else}\\r\\n        <CardCarousel page={card} index={i} />\\r\\n      {/if}\\r\\n    {/each}\\r\\n    <CardCredits />\\r\\n    <div id=\\"contact\\" class=\\"contact-us-container\\">\\r\\n      <ContactUs />\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.bg-image-container {\\n  position: absolute;\\n  z-index: 1;\\n  width: 100%;\\n  height: 100%;\\n}\\n.bg-image-container .bg-image {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n}\\n\\n.contact-us-container {\\n  width: 100%;\\n  padding: 30px;\\n  height: 100vh;\\n}\\n\\n.card-container {\\n  position: relative;\\n  background-color: #2c2a2b;\\n}\\n\\n.logo-wrapper {\\n  z-index: 2;\\n  position: relative;\\n  width: 100vw;\\n  height: 100vh;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}\\n.logo-wrapper .logo-container {\\n  max-width: 55%;\\n}\\n.logo-wrapper .logo-container .image-logo {\\n  object-fit: contain;\\n  width: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AA8EmB,mBAAmB,8BAAC,CAAC,AACtC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,kCAAmB,CAAC,SAAS,eAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,AACf,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,QAAQ,CAAE,QAAQ,CAClB,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,4BAAa,CAAC,eAAe,eAAC,CAAC,AAC7B,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,4BAAa,CAAC,eAAe,CAAC,WAAW,eAAC,CAAC,AACzC,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,AACb,CAAC"}'
};
const CardContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const cardLayout = [
    { title: "malibu life", type: "image" },
    { title: "discover", type: "image" },
    { title: "renders", type: "carousel" },
    { title: "floorplans", type: "carousel" },
    { title: "equestrian", type: "image" },
    { title: "video render", type: "video" },
    {
      title: "behind the scenes",
      type: "gallery"
    },
    { title: "drone footage", type: "video" }
  ];
  $$result.css.add(css);
  return `<div class="${"card-wrapper"}"><div class="${"bg-image-container svelte-1fu2nnh"}"><img class="${"bg-image svelte-1fu2nnh"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1631654002/homebg/Horses_Running_t0wcvh.jpg"}" alt="${""}"></div>
  <div id="${"home"}" class="${"logo-wrapper svelte-1fu2nnh"}"><div class="${"logo-container svelte-1fu2nnh"}"><img class="${"image-logo svelte-1fu2nnh"}" src="${"https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/homeLogo_yufrin.png"}" alt="${""}"></div></div>
  <div class="${"card-container svelte-1fu2nnh"}">${each(cardLayout, (card, i) => `${cardLayout[i].type === "image" || cardLayout[i].type === "video" ? `${validate_component(Card, "Card").$$render($$result, { page: card, index: i }, {}, {})}` : `${cardLayout[i].type === "gallery" ? `${validate_component(CardGallery, "CardGallery").$$render($$result, {}, {}, {})}` : `${validate_component(CardCarousel, "CardCarousel").$$render($$result, { page: card, index: i }, {}, {})}`}`}`)}
    ${validate_component(CardCredits, "CardCredits").$$render($$result, {}, {}, {})}
    <div id="${"contact"}" class="${"contact-us-container svelte-1fu2nnh"}">${validate_component(ContactUs, "ContactUs").$$render($$result, {}, {}, {})}</div></div>
</div>`;
});
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  onDestroy(() => {
  });
  return `<div>${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})}

  ${validate_component(ScrollContainer, "ScrollContainer").$$render($$result, {}, {}, {})}

  ${validate_component(CardContainer, "CardContainer").$$render($$result, {}, {}, {})}

  ${validate_component(Modal, "Modal").$$render($$result, {}, {}, {})}
  ${validate_component(Socials, "Socials").$$render($$result, {}, {}, {})}
</div>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
export { init, render };
