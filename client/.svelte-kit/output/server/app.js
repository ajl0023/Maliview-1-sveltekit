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
import _ from "lodash";
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
const css$o = {
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
  $$result.css.add(css$o);
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
      file: assets + "/_app/start-61b71385.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-61b71385.js", assets + "/_app/chunks/vendor-0947166e.js"]
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
  assets: [{ "file": "By Apel Design Black.png", "size": 25337, "type": "image/png" }, { "file": "By Apel Design White.png", "size": 25198, "type": "image/png" }, { "file": "homeLogo.png", "size": 179538, "type": "image/png" }, { "file": "horse-left.jpg", "size": 58566, "type": "image/jpeg" }, { "file": "horse-right.jpg", "size": 69905, "type": "image/jpeg" }, { "file": "horses.jpg", "size": 142378, "type": "image/jpeg" }, { "file": "logo.inline.svg", "size": 37735, "type": "image/svg+xml" }, { "file": "main-images/bg-image-page/0244f6ee-9c5a-4a4d-95ca-cc7a3bdc6493left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/0961d418-3392-4db6-998c-395cda4995beleft5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/09a8f336-8bd4-44ba-b765-63313a167c5dbg3.jpg", "size": 147034, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/0b225aa8-b100-4578-95b2-6628a08a7a60left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/0e7be545-60b7-4f83-9fe7-d5194b664666video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/10ef74a7-b04c-4af6-9bc3-104cdcb1336fbg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/12d1d95f-e8f3-4a42-8765-495649baf4b0left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/177b3bd0-4be4-4e52-bd45-dad609d16b5dbg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/1ca5be04-8296-4968-b3fa-cc89d4926420drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/1e244182-a04f-411a-a197-85e7f7230188left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/1f7153a5-e275-4f69-bbfe-0504ee4ef99bleft5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/2383e06d-aca3-4f65-8d11-9de3e6491191mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/28ff8e44-a80f-4d32-a44a-2ea5aafe82fedrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/29e4d963-77a7-4789-8c01-a5a8faa3e293left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/333.jpg", "size": 66931, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/36e2008e-a702-44ac-8f54-2b45785d88c5bg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/3a6a22ac-beff-4661-b7a5-38d74b12971edownload.png", "size": 11326, "type": "image/png" }, { "file": "main-images/bg-image-page/3ea2bae6-4177-4293-b47c-65b06fdc630fbg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/418d6ae8-66e4-4cae-95a4-a1025bd9c0b2video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/45a381f9-1e78-4bac-a771-5a68b1e30d83left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/4655e094-7567-4b95-ad23-4d46f5e580c0bg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bg-image-page/46c596b4-8ecb-44c8-ac3f-6129be8aef54bg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/4eefaf3d-1b47-4f75-98f3-8cefb2c4fa3bleft4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/50618a7c-b34f-4c2f-8127-fc8a43cb0af4left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/5c7ad558-d9c2-4a8c-9690-629064a796aabg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/69842648-ebfa-424f-8ade-e9b75d8b47b6left0.jpg", "size": 63430, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/6c04d872-457c-40c5-b2c0-112aaf210a10mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/70248024-38ff-4878-b1e7-bcc8dcad6fd1mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/7091eeb2-041c-4a67-acbc-5bedda4ea2e8bg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/7092acf9-e2e6-4529-ad0a-b651f9f2ae39bg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/71182f0f-d56f-4e96-b75d-e6b0010a7c69video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/7812e9c3-6c78-4ae3-b612-b6bdcb59a238bg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/7a6fd339-7393-4081-8ca8-0b18d8e72ce8bg4.jpg", "size": 91724, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/7b65b19d-e84a-4b81-b780-98778df8647ebg3.jpg", "size": 147034, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/7ca40104-dc49-4b9d-807f-b29efe94fe9emobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/7d7f41ce-1e0f-427c-a874-09b7800bc8e7bg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/84c1f1ab-907e-4173-9266-c5187ef6370emobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/8586680e-53fa-4ad6-bcf2-2e6817e696f7video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/86d9b0d5-df50-411a-aebc-d3bb2ad69aeavideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/87155c22-6ffb-43bf-8c44-c5a289b363eebg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/90d6c2af-5fa7-4d83-b520-eee139e6c5d8mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/984aa924-2182-4b4a-a750-38c4e861c571bg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/9c231347-434a-41d9-b406-6c4fedbaf039bg4.jpg", "size": 284612, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/9fdb62d3-edb6-4795-96a4-95bda70e9144download.png", "size": 11326, "type": "image/png" }, { "file": "main-images/bg-image-page/a1067ba3-3ef7-4850-a3ee-86b991b22ed1video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/a34881b3-3fda-4222-a022-d366dda47b4amobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/a7365a7d-24d9-4c37-a499-bf186b3cc11bleft5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/a73dae33-c524-4380-9587-d10a43ba538abg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/a7a44cbe-5ada-4323-8bdd-2c001538b46ebg2.jpg", "size": 276507, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/a88aa8c6-7c1e-41e4-844f-32217a327634bg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/b294fed9-c0c2-402d-8d74-a2b6592df962left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/bg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/bg3.jpg", "size": 147034, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/bg4.jpg", "size": 91724, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/c0964314-bc2a-4fab-a789-cb2092e17260video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bg-image-page/c09d0c6b-d10b-415e-86e1-c47d9806f1b8bg3.jpg", "size": 147034, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/c1aeea9f-988e-4673-9ab2-40475b82ed1abg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/d08d4d7e-3cc3-4315-9f3a-b0f4897ec9bfdrone.jpg", "size": 127356, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/d0f7467f-4a2b-48d3-bc87-bff3621c8a86bg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/d18d7dbd-85fd-4fc7-bf78-8d21dbb1bfccbg3.jpg", "size": 147034, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/d97eb635-ee1b-42c2-a9b3-9aa1a3bea8c6bg4.jpg", "size": 91724, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/drone.png", "size": 1250045, "type": "image/png" }, { "file": "main-images/bg-image-page/e2ab06c5-7cff-4005-b43e-825e0b087f5eleft5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/e45501de-a54c-4c80-8c65-b799b8a84f6cleft5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/ed8f2599-22cb-4354-bf8f-f1dfd76e624dbg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/ee87a8ba-3097-4a5c-9898-ecc759d391f5ph0y70v.jpeg", "size": 683968, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/f86567de-861a-4b9c-a78c-e69c16f369ddbg3.jpg", "size": 482144, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/fb082961-a3a1-4eb9-b2b2-31542af0cd09left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/fca648f0-963d-457b-9849-9353b07766d2mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bg-image-page/fdbd2f7c-79f5-48df-987c-ef1265a1eeffbg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/bg-image-page/febda8c3-1448-4773-97fa-63d32ce06169bg2.jpg", "size": 87555, "type": "image/jpeg" }, { "file": "main-images/bts/008a78cd-9632-4efa-a432-879c78b34f4d20.jpg", "size": 511409, "type": "image/jpeg" }, { "file": "main-images/bts/0331ef7b-7d06-4a9f-a19f-fdb3fa8f9fa0video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/0397d0b7-f21a-4132-81c6-0733fd4f9d80drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/041ba7c2-4588-4c9f-bf7e-2e4256497451video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/0498dba2-9f31-4ec9-ae12-8305ff77621107.jpg", "size": 266312, "type": "image/jpeg" }, { "file": "main-images/bts/06b70666-fa91-4477-834e-c84014bfa23506.jpg", "size": 187919, "type": "image/jpeg" }, { "file": "main-images/bts/075ecd9e-e088-44dc-9cb5-126bf960cbc6mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/0777a1ca-5b85-4b3f-b903-e81715345a49electrical 2.jpg", "size": 389034, "type": "image/jpeg" }, { "file": "main-images/bts/08396331-e2f1-45d7-9a5f-55e6ae9beb8105.jpg", "size": 91828, "type": "image/jpeg" }, { "file": "main-images/bts/086208ce-1c2a-4928-b397-db6e61f602c2electrical discussion.jpg", "size": 239813, "type": "image/jpeg" }, { "file": "main-images/bts/0a046bc2-fef0-45cb-9183-e265a33faf660.jpg", "size": 249019, "type": "image/jpeg" }, { "file": "main-images/bts/0a551113-d376-4742-b374-771b9dcb093cvideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/0ccbc412-4c2d-480b-853f-6e3b193fe729014.jpg", "size": 321609, "type": "image/jpeg" }, { "file": "main-images/bts/0d338050-db41-4f83-8b9a-9c7d2a19e47emobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/0f086b2d-7627-44f9-8f18-fa54f7a3f24631.jpg", "size": 184226, "type": "image/jpeg" }, { "file": "main-images/bts/0f5783e9-e717-4887-be43-a1e6d1258f6b011.jpg", "size": 181257, "type": "image/jpeg" }, { "file": "main-images/bts/0fb07ad1-c87b-4894-b2f4-b0bcf142bde1Framing.jpg", "size": 249904, "type": "image/jpeg" }, { "file": "main-images/bts/0fc9cca1-96d8-4d16-88f6-e2290144ebe7012.jpg", "size": 336026, "type": "image/jpeg" }, { "file": "main-images/bts/1108e32a-964a-46b1-94fc-b8f8ab284be9Humming Bird.jpg", "size": 92369, "type": "image/jpeg" }, { "file": "main-images/bts/13078f33-a23d-43ba-8e01-28dbab90c967Framing.jpg", "size": 103676, "type": "image/jpeg" }, { "file": "main-images/bts/1496da1f-0c61-4b30-8939-d3c0a3a2aecakitchen discussion 3.jpg", "size": 159981, "type": "image/jpeg" }, { "file": "main-images/bts/149d6e8b-7b33-427f-8865-cc8e77c616c903.jpg", "size": 213167, "type": "image/jpeg" }, { "file": "main-images/bts/1527694e-9d6f-4a1b-9f76-3650d3c5ec8329.jpg", "size": 340083, "type": "image/jpeg" }, { "file": "main-images/bts/16a9c5b2-f82e-4f6b-bb02-730437ac001avideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/1a450603-3a77-46da-9363-f472f7cd61a0drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/1a4ae0d8-3f59-4546-991d-b2387883b670drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/1bf5ba81-6102-4737-ade1-7d84351daba8circle window with pendant light.jpg", "size": 156813, "type": "image/jpeg" }, { "file": "main-images/bts/1cab4571-1113-46a3-8257-27ef22a686bc21.jpg", "size": 257314, "type": "image/jpeg" }, { "file": "main-images/bts/1d11202f-866b-4118-876c-308155d98d7evideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/1dbcdb2c-616f-4139-ab87-5355bfa78b8cbg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/bts/1dc81d96-6bf7-4813-9df5-f60c412f0f7126.jpg", "size": 221962, "type": "image/jpeg" }, { "file": "main-images/bts/1fd898a0-9cd1-4486-96c7-ef0f7ce98471electrical discussion.jpg", "size": 333177, "type": "image/jpeg" }, { "file": "main-images/bts/2219f69c-a2cd-4402-a6d2-8a2517a0907028.jpg", "size": 296462, "type": "image/jpeg" }, { "file": "main-images/bts/222a2e56-56c9-43fb-b47c-8021fab67ca7bg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bts/22b9144a-9119-4250-ab21-3ef3b9274004drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/23725010-84ea-4214-a49c-210950f82d9e19.jpg", "size": 212172, "type": "image/jpeg" }, { "file": "main-images/bts/23fb5685-55d0-4555-8946-4bc3bdc58e6adrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/247db3b2-f842-4e4b-a74c-d65ab601cfcb16.jpg", "size": 250386, "type": "image/jpeg" }, { "file": "main-images/bts/24b8894b-b3d1-4fe7-a3af-71804ff93f1dmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/250ab179-19c1-4ac0-aeec-54246902cc55Humming Bird.jpg", "size": 92369, "type": "image/jpeg" }, { "file": "main-images/bts/28f3589b-028e-4ed8-973a-8c0353b991fb010.jpg", "size": 94239, "type": "image/jpeg" }, { "file": "main-images/bts/28f43563-ad90-4b4c-ad56-94c5a785404fdrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/294759ef-8662-4fcd-939b-28669bfcbfa7electrical 2.jpg", "size": 279354, "type": "image/jpeg" }, { "file": "main-images/bts/2c14b4d3-069d-476b-82a8-ef9a0db8fb0abg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bts/2c53dbd3-8f0f-4084-b780-9b64a7e7f2b5video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/2d1781ff-ad91-4eb2-9d26-edefcd117774mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/2d62452e-e32c-484a-b6b1-9505741fcf0a012.jpg", "size": 158977, "type": "image/jpeg" }, { "file": "main-images/bts/2ef90833-01da-4f22-8daf-3550c558b7b5video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/30bfdf36-4b0d-4dbf-8ffe-3e1824c10d9edining room discussion.jpg", "size": 272685, "type": "image/jpeg" }, { "file": "main-images/bts/31a75a4d-c61b-4119-a061-d2b6a52073a6video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/3323beb3-8bc8-4235-a6d9-5ebe3e1c57ac20.jpg", "size": 258940, "type": "image/jpeg" }, { "file": "main-images/bts/345066f4-4836-44f3-a445-a1e7cf82ed4bbg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bts/3486ffc9-d170-4d96-a034-98a5b7fc5b4223.jpg", "size": 339912, "type": "image/jpeg" }, { "file": "main-images/bts/34d46337-1c5c-4efe-aa19-3ba1da4a2d8dmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/35fc1546-c993-4dea-8036-583b6763f8af08.jpg", "size": 65960, "type": "image/jpeg" }, { "file": "main-images/bts/3851a159-0c74-4d98-897c-963bd72ef17219.jpg", "size": 212172, "type": "image/jpeg" }, { "file": "main-images/bts/38a8d2c6-56d9-455b-a64e-ef2274f8e036video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/39f50c1a-5794-4d44-8e5d-bf73ae503ceakitchen discussion.jpg", "size": 374519, "type": "image/jpeg" }, { "file": "main-images/bts/3a26b3ec-c342-4bc0-aaf0-f612abae4ef215.jpg", "size": 248874, "type": "image/jpeg" }, { "file": "main-images/bts/3b3e5822-d508-431f-8475-dbe180ddb24cdrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/3c063717-e2f1-4c8c-95e9-e93202e50701kitchen discussion 2.jpg", "size": 376193, "type": "image/jpeg" }, { "file": "main-images/bts/3cd0e50b-dc4f-4fdb-85cf-81f32dee2030video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/3e9707e4-db86-4baf-8272-a95013034b09video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/3f896cf2-f203-4133-89df-c0dd35740f6e27.jpg", "size": 290574, "type": "image/jpeg" }, { "file": "main-images/bts/405a5670-c32f-4b9a-976c-494c720c2d26kitchen discussion 3.jpg", "size": 369600, "type": "image/jpeg" }, { "file": "main-images/bts/40664db2-4084-4e29-bf1e-06b6886278e1drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/42100a7b-752a-450f-8469-a0c37e0820ee29.jpg", "size": 622949, "type": "image/jpeg" }, { "file": "main-images/bts/42d8098f-1a6b-4525-bd22-129e264b2d4722.jpg", "size": 223993, "type": "image/jpeg" }, { "file": "main-images/bts/44b70f49-794d-44a1-8fa4-0f62688846e6video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/474a8333-861f-4071-872b-1b9e7b7a0b39mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/4761042e-3d42-4268-9d1c-0c66c58274b427.jpg", "size": 554639, "type": "image/jpeg" }, { "file": "main-images/bts/49d84c50-f648-4af1-afbd-ba86020a594aframing discussion.jpg", "size": 326263, "type": "image/jpeg" }, { "file": "main-images/bts/4ae64b13-897c-43ea-a63f-e8743688d966video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/4b09e197-1e46-42cd-ba04-25e1f8340e75mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/4b607907-34d6-41e4-84b6-c7255cfc3c1fdrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/4b866131-4bcc-4483-842d-acaee426fd88drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/4d0f725a-43c6-4852-b77c-08041b00d9e8video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/51fde415-94ae-4ac6-872b-fa7743e6976dBike.jpg", "size": 129122, "type": "image/jpeg" }, { "file": "main-images/bts/52e57940-9b2b-407f-b154-33d5ffa7e6a3drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/552aa52d-9b39-4eda-9397-815cded0dbe5mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/55b0c38f-fbdd-4949-86c7-5a8695c4fa93Amit and Russel.jpg", "size": 334682, "type": "image/jpeg" }, { "file": "main-images/bts/55dbeb77-612b-401c-9e15-a4c3d5b86cf5Amit and Russel.jpg", "size": 238806, "type": "image/jpeg" }, { "file": "main-images/bts/55f345d8-d71b-4a0f-a17c-9e85a70d8a5302.jpg", "size": 280349, "type": "image/jpeg" }, { "file": "main-images/bts/560823b6-75a5-46f3-83a8-afa47257890cvideo-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/57bf3169-a8f8-4370-907d-90e0a6ae3827drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/57f4648d-36d3-4977-8fab-b8ca6baab618drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/5d19666e-63ee-49c3-8420-0c0a398514f6010.jpg", "size": 94239, "type": "image/jpeg" }, { "file": "main-images/bts/5d66ce72-4685-4265-a62a-2704979cb12bbg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bts/5eecfe92-fdf6-441e-8afd-94272f140cdbAmit and Russel.jpg", "size": 238806, "type": "image/jpeg" }, { "file": "main-images/bts/5fbf1707-b9f8-4759-9735-1b90c685814222.jpg", "size": 436403, "type": "image/jpeg" }, { "file": "main-images/bts/607355fe-9319-40f9-a0a6-d83cc4c2f54fvideo-render-title-brush.png", "size": 12834, "type": "image/png" }, { "file": "main-images/bts/60db1ca8-810f-43b0-9c9f-91926158792adrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/619e60e7-a083-43e6-81e8-3f61d607ef3919.jpg", "size": 429873, "type": "image/jpeg" }, { "file": "main-images/bts/6486950c-a4f2-4293-98d1-a4211ffb940430.jpg", "size": 427228, "type": "image/jpeg" }, { "file": "main-images/bts/661e37d6-675d-445e-8894-85a06645e65ccircle window with pendant light.jpg", "size": 213902, "type": "image/jpeg" }, { "file": "main-images/bts/664ef76f-3ff2-4b46-b748-8c97e4f15a3fmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/66e796ba-6cbe-41af-a9eb-5f47a0de0252dining room discussion.jpg", "size": 272685, "type": "image/jpeg" }, { "file": "main-images/bts/672d8169-41e7-4297-a721-e9b4d63aada3Framing.jpg", "size": 103676, "type": "image/jpeg" }, { "file": "main-images/bts/68f7f036-8c6f-4fb1-afe0-1b992ad5a90325.jpg", "size": 135039, "type": "image/jpeg" }, { "file": "main-images/bts/69449169-83ca-45c1-bb63-925f1849a543video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/6bcbbb4b-1b25-4220-b30b-8e37348ebdeadrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/6c36a8ef-5b16-407d-880b-6716fa19bae418.jpg", "size": 503347, "type": "image/jpeg" }, { "file": "main-images/bts/6d10cade-c10a-45a4-a890-581a4ff14e3009.jpg", "size": 71208, "type": "image/jpeg" }, { "file": "main-images/bts/6d691f11-e6e4-4d3f-a867-60eca99d4138electrical 2.jpg", "size": 279354, "type": "image/jpeg" }, { "file": "main-images/bts/6e7889e4-bddf-486d-9fb2-66cf45bb0d4317.jpg", "size": 266556, "type": "image/jpeg" }, { "file": "main-images/bts/72256c0a-fe77-49a8-90de-6b4536023b21circle window with pendant light.jpg", "size": 156813, "type": "image/jpeg" }, { "file": "main-images/bts/733a1ee4-a5fe-4a87-a14d-852e6fc531a0electrical discussion.jpg", "size": 239813, "type": "image/jpeg" }, { "file": "main-images/bts/73935c5e-12ad-487b-b9dd-9c6d09aadbecdrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/73f72249-ecbd-4ce0-a54c-f767e6dfd204014.jpg", "size": 608454, "type": "image/jpeg" }, { "file": "main-images/bts/740d1124-c931-404b-b4ec-90ed4cb527b3video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/74175ab1-5a35-4675-b90f-2c3b2399aedd2021.05.29 roof 2.jpg", "size": 128888, "type": "image/jpeg" }, { "file": "main-images/bts/77819245-dd58-493e-acfe-128bdc93260c29.jpg", "size": 340083, "type": "image/jpeg" }, { "file": "main-images/bts/778a7847-b82f-47e7-86af-8ac27be9b8e304.jpg", "size": 337199, "type": "image/jpeg" }, { "file": "main-images/bts/778fd881-1094-4a6f-a76c-32c45fc17384video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/77975fc0-1c04-4b48-8e51-cbc39d030ba608.jpg", "size": 65960, "type": "image/jpeg" }, { "file": "main-images/bts/78ac9976-8126-4616-b3da-0af33f7ff4bemobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/79042932-7f24-4e6b-ba7f-54cf059f483fmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/793db5ac-fd50-4be7-9d28-d9f8fe624cc7kitchen discussion.jpg", "size": 157590, "type": "image/jpeg" }, { "file": "main-images/bts/7a65d0c0-67d4-41a7-badc-fd18fa213d30video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/7adf109e-a0bf-4f4a-9fcf-d2fe86c86759video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/7c6adfda-e12f-4b63-970e-9befe9f9d69507.jpg", "size": 115444, "type": "image/jpeg" }, { "file": "main-images/bts/7d298a2e-7266-4409-bdc3-0f5519efcdd6video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/7ea2394c-4785-4c71-9d66-60b7ac1d79b4drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/814fec86-9678-4743-850c-ab18e0fab2d0framing discussion.jpg", "size": 228865, "type": "image/jpeg" }, { "file": "main-images/bts/81afa429-684f-4a26-97e1-8ba4d0c80b7fkitchen discussion 2.jpg", "size": 274221, "type": "image/jpeg" }, { "file": "main-images/bts/81f96018-7c0e-4c05-b93f-35e3ea6ae596video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/82da8c6a-6388-493d-8af8-8fda36e6b00f26.jpg", "size": 221962, "type": "image/jpeg" }, { "file": "main-images/bts/832ef5f1-b303-49d4-9b26-30ceb3182ee923.jpg", "size": 339912, "type": "image/jpeg" }, { "file": "main-images/bts/836d6bdd-bf84-4992-b501-6f1a487acc6328.jpg", "size": 543798, "type": "image/jpeg" }, { "file": "main-images/bts/83a63dd2-901c-4ffa-b839-e96ef9ce0213mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/843d24d9-60bd-483e-b049-7c727cea643a27.jpg", "size": 290574, "type": "image/jpeg" }, { "file": "main-images/bts/846b183b-d45b-40b4-b16a-428f1f2775d716.jpg", "size": 250386, "type": "image/jpeg" }, { "file": "main-images/bts/8565cebf-f7e2-4d0a-88e9-e9dbf84db6f9electrical 2.jpg", "size": 279354, "type": "image/jpeg" }, { "file": "main-images/bts/859e1164-011c-4ddb-82e5-4e0aeedf918fvideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/85c457de-daa8-44b1-9685-8b62b3879a5703.jpg", "size": 72198, "type": "image/jpeg" }, { "file": "main-images/bts/8627dd22-11b5-48a5-81be-39a4a54c81c3drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/878d4e55-0d91-4c1d-b282-329f0269c3ecBike.jpg", "size": 129122, "type": "image/jpeg" }, { "file": "main-images/bts/888bbd13-bf4a-4da0-b15d-06ede6ca3efd012.jpg", "size": 158977, "type": "image/jpeg" }, { "file": "main-images/bts/8a966d3a-9dab-49d8-97f1-aa11cb3ccc7avideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/8af8ff9c-a568-4cad-a73b-85fdc6a8a90cvideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/8b5ef028-685d-41c9-951c-90b0c0b5cba1mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/8ba261f5-e576-427b-b05e-89b46c009e52013.jpg", "size": 344841, "type": "image/jpeg" }, { "file": "main-images/bts/8c779cda-1236-491b-9faa-ed0ceaec4f64mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/8ddcb21e-aaea-41ca-a61b-e2b7fc6af4a2drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/90f3f5da-e5d0-4e50-bd13-313718f1f823video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/91626aae-ca0f-4bad-9035-f68c9fec3f142021.05.29 roof 2.jpg", "size": 128888, "type": "image/jpeg" }, { "file": "main-images/bts/93425529-902c-45a2-a549-8daedb333ca404.jpg", "size": 151638, "type": "image/jpeg" }, { "file": "main-images/bts/959caf9b-9711-4223-bed6-8352061228bd25.jpg", "size": 135039, "type": "image/jpeg" }, { "file": "main-images/bts/960a3fbf-0c15-44f0-b66d-9c5ee735d8c4mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/98f0efc9-9eef-40be-b091-518d2821fc56drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/99860e98-40ba-4a41-a1f5-5aa967cd259903.jpg", "size": 72198, "type": "image/jpeg" }, { "file": "main-images/bts/99be8952-ed66-439b-b8d6-652a38b3a9abvideo-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/9a66d878-4acb-404a-a5b4-ad48065fb069013.jpg", "size": 663581, "type": "image/jpeg" }, { "file": "main-images/bts/9bbd09f1-56af-4cc3-b7ef-3ddea3b1ebfe18.jpg", "size": 257051, "type": "image/jpeg" }, { "file": "main-images/bts/9c5b1d86-8ac8-4112-8afc-ea12bf74f8d0mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/9c9a4ea4-72a4-434d-adfe-1d8417e124b5mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/9e39799c-ca96-402a-aca1-e53e43d5449f05.jpg", "size": 91828, "type": "image/jpeg" }, { "file": "main-images/bts/9e907083-87e7-4670-98de-8046ee208315mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/9f4caa0b-18ee-4967-8413-1436caf84a3408.jpg", "size": 210975, "type": "image/jpeg" }, { "file": "main-images/bts/9fd3b87e-0ddf-46db-9051-80d5f945770517.jpg", "size": 266556, "type": "image/jpeg" }, { "file": "main-images/bts/a053c277-39bf-4034-a06a-0022e94e579206.jpg", "size": 187919, "type": "image/jpeg" }, { "file": "main-images/bts/a1277789-16ef-4e33-b016-3e28e3950fa1dining room discussion.jpg", "size": 377646, "type": "image/jpeg" }, { "file": "main-images/bts/a13875f2-7c4b-48c0-aabd-6c9d62771d47mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/a49af792-8621-4028-969e-4c64c71506b823.jpg", "size": 690204, "type": "image/jpeg" }, { "file": "main-images/bts/a4e36935-c43e-48e8-a6ce-5554ee680190dining room discussion.jpg", "size": 272685, "type": "image/jpeg" }, { "file": "main-images/bts/a5bc76cb-844e-4778-8e3c-6ab620e6f6d0mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/a714fc93-8173-427d-9b95-70b880cfe6c9bg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bts/a77c185f-2b33-4d50-8d67-7b073bd86f1dvideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/a9fa883b-d183-48ec-88fd-9eca464554ff2021.05.29 roof 2.jpg", "size": 128997, "type": "image/jpeg" }, { "file": "main-images/bts/aae7330a-c6dd-4ead-872b-69582048f15f21.jpg", "size": 257314, "type": "image/jpeg" }, { "file": "main-images/bts/ab484828-a745-4c6b-8d50-b3048305ccd6video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/abc95087-7ed7-4583-b0ec-0d2b49ccbec009.jpg", "size": 71208, "type": "image/jpeg" }, { "file": "main-images/bts/ac6299d8-f9e0-43c4-97f9-d9fead9941damobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/ad0391eb-7a3e-40c4-a33a-430f05503fe7drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/adc3bc3c-fd4b-45b2-bfaf-0d33db769487Humming Bird.jpg", "size": 92369, "type": "image/jpeg" }, { "file": "main-images/bts/ae3ae78c-75b7-4ef2-a223-c952ac623b5921.jpg", "size": 504612, "type": "image/jpeg" }, { "file": "main-images/bts/b023b6a1-7cda-418f-aac8-41e6ed1f1a9c06.jpg", "size": 383047, "type": "image/jpeg" }, { "file": "main-images/bts/b0609a95-933e-4c93-90e8-e156c493eacdkitchen discussion.jpg", "size": 157590, "type": "image/jpeg" }, { "file": "main-images/bts/b1267fcd-7a9b-417f-b322-3cf41fc9c26915.jpg", "size": 248874, "type": "image/jpeg" }, { "file": "main-images/bts/b17425e9-40cd-4a0f-ac54-705d5957c911010.jpg", "size": 254037, "type": "image/jpeg" }, { "file": "main-images/bts/b1830ca5-e506-41a0-a035-e1c2582f3bdacircle window with pendant light.jpg", "size": 156813, "type": "image/jpeg" }, { "file": "main-images/bts/b2ad69de-dbef-4206-a80b-9e58177fddd5framing discussion.jpg", "size": 228865, "type": "image/jpeg" }, { "file": "main-images/bts/b4244725-dfb5-4d25-a37a-2c66bbdebe4bvideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/b4858896-b46a-4f2b-9eab-9823345e2d8005.jpg", "size": 240542, "type": "image/jpeg" }, { "file": "main-images/bts/b572fef9-8aac-489b-bcd6-0340494ee3c531.jpg", "size": 321869, "type": "image/jpeg" }, { "file": "main-images/bts/b75b46ef-493d-4740-a20c-61142e64937ddrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/b7b0d5a7-8871-4952-86f9-e040f636e4d320.jpg", "size": 258940, "type": "image/jpeg" }, { "file": "main-images/bts/b86ed5a4-0054-4bbf-9ddc-a72974903f3eBike.jpg", "size": 129122, "type": "image/jpeg" }, { "file": "main-images/bts/b8b1261e-ed02-4bf7-b421-5cce393d6220mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/bb6e7476-be16-4bdc-8543-c0db3744bb70video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/bcb54844-2dc1-44c2-846b-afaa622fd444video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/bcc2291b-8ca2-449c-b693-8d43458741f6011.jpg", "size": 181257, "type": "image/jpeg" }, { "file": "main-images/bts/bf0ac2fa-507c-4651-819e-e266e2c966cd09.jpg", "size": 287421, "type": "image/jpeg" }, { "file": "main-images/bts/bg1.jpg", "size": 50767, "type": "image/jpeg" }, { "file": "main-images/bts/bg2.jpg", "size": 87555, "type": "image/jpeg" }, { "file": "main-images/bts/bg4.jpg", "size": 91724, "type": "image/jpeg" }, { "file": "main-images/bts/c29e1fd4-2ac5-4996-a65b-b76c58387fb624.jpg", "size": 333654, "type": "image/jpeg" }, { "file": "main-images/bts/c3c05904-ab73-4d03-90e0-f07bc72cebe222.jpg", "size": 223993, "type": "image/jpeg" }, { "file": "main-images/bts/c45af052-5b3a-445c-b88e-2aa365ffb73524.jpg", "size": 333654, "type": "image/jpeg" }, { "file": "main-images/bts/c650d69d-a806-4a32-9320-42ad27edd779mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/c863d123-716c-443c-81d3-102ab2439919Framing.jpg", "size": 103676, "type": "image/jpeg" }, { "file": "main-images/bts/cac4d149-d968-4416-9012-7eb5e3e3945akitchen discussion 2.jpg", "size": 274221, "type": "image/jpeg" }, { "file": "main-images/bts/ceb3a241-70a6-4251-9160-1b8f9f15efcedrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/d3dbc798-899c-49f7-8a69-d4c51b53276228.jpg", "size": 296462, "type": "image/jpeg" }, { "file": "main-images/bts/d488d51c-c838-4d7a-b335-458612e7ef8ddrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/d5086046-560f-45ed-be3f-31fe09e53913drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/d576509a-c7cc-4404-8584-bd4980077842mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/d852f1a1-1a1b-4fac-a5c3-c0e4e649abaf18.jpg", "size": 257051, "type": "image/jpeg" }, { "file": "main-images/bts/da058165-2aee-459f-afd2-5f35c7037c4avideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/dabb2e4d-6d80-4c3d-8dd5-2fa70a647f01mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/db01d88e-2d90-44b8-b827-800646cbf1b5kitchen discussion 3.jpg", "size": 159981, "type": "image/jpeg" }, { "file": "main-images/bts/db86c81a-f952-48b0-9c5e-65817d2862fcbg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/bts/dc8dfa47-5380-4571-be73-d23daef81d8bmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/ddc83a75-fbfd-4672-85c1-793c8eeb5c9302.jpg", "size": 117164, "type": "image/jpeg" }, { "file": "main-images/bts/df0d7505-b463-4dc7-8813-ee686e61030530.jpg", "size": 132348, "type": "image/jpeg" }, { "file": "main-images/bts/drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/e04f14b9-f0c8-4b86-8119-9d252dc92256kitchen discussion 3.jpg", "size": 159981, "type": "image/jpeg" }, { "file": "main-images/bts/e11a6a69-afe5-4791-9abd-93ec09d32bdckitchen discussion 2.jpg", "size": 274221, "type": "image/jpeg" }, { "file": "main-images/bts/e316fdcc-9879-4d86-b06e-39f53417b17cmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/e3e6987a-beb6-44e8-847b-246cbcc6e849video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/e3edd03f-4f9e-49df-b614-fc05a6ccdead011.jpg", "size": 352700, "type": "image/jpeg" }, { "file": "main-images/bts/e49fdfa5-05aa-4d1a-be09-f4f922083e70Amit and Russel.jpg", "size": 238806, "type": "image/jpeg" }, { "file": "main-images/bts/e4e821e2-37f7-4d0b-a772-0df993966a3c16.jpg", "size": 506297, "type": "image/jpeg" }, { "file": "main-images/bts/e5c58025-ebf2-42eb-98f7-bff3438b87e417.jpg", "size": 533714, "type": "image/jpeg" }, { "file": "main-images/bts/e5da1a30-2b8a-4c63-9eca-a9ad5b7db575mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/e64e6d5d-7ff9-4c23-917c-47d921fb1f19Bike.jpg", "size": 328444, "type": "image/jpeg" }, { "file": "main-images/bts/e9b2b855-e296-40f8-af6e-fc83f8cd821a26.jpg", "size": 358092, "type": "image/jpeg" }, { "file": "main-images/bts/ea5ead04-271a-4b52-b31d-ed46ed2241dedrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/eca7d011-c27e-4664-be94-897c64abe092video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/edc6c1dc-1588-451f-90c6-65b4ed4bbc1130.jpg", "size": 132348, "type": "image/jpeg" }, { "file": "main-images/bts/eef60985-89ee-42e7-9d0d-abc15ba1d06815.jpg", "size": 499824, "type": "image/jpeg" }, { "file": "main-images/bts/ef454f02-9b27-43f9-bfb3-bc196a2cd4bcmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/efda7de1-ed8b-4006-b587-b35dfa358c92014.jpg", "size": 321609, "type": "image/jpeg" }, { "file": "main-images/bts/efdefda6-803a-4e64-b1b8-4b9e614a3d78Humming Bird.jpg", "size": 211259, "type": "image/jpeg" }, { "file": "main-images/bts/efedecca-2066-4e14-912d-1310b23c199831.jpg", "size": 184226, "type": "image/jpeg" }, { "file": "main-images/bts/f0580283-c1e8-4a26-9da4-4d0d7b30fd3a2021.05.29 roof 2.jpg", "size": 128888, "type": "image/jpeg" }, { "file": "main-images/bts/f17c30b9-c095-42d1-80a9-7c666d2edaf807.jpg", "size": 115444, "type": "image/jpeg" }, { "file": "main-images/bts/f262fd7a-0483-4631-ae8d-a2cb1150cdc425.jpg", "size": 466256, "type": "image/jpeg" }, { "file": "main-images/bts/f49ff6de-ae10-4eea-b8e5-f6bcfeb19ec4electrical discussion.jpg", "size": 239813, "type": "image/jpeg" }, { "file": "main-images/bts/f6f5b0d1-382d-4bf5-8b0b-25e1a53d50b7drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/bts/f75d944e-bb4f-4287-badf-e2d0ba38061eframing discussion.jpg", "size": 228865, "type": "image/jpeg" }, { "file": "main-images/bts/f79e39be-bc94-448a-bb5d-e583fa1c034amobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/f7d5e147-7edf-49c4-81ea-6282b7cacaf40.jpg", "size": 89705, "type": "image/jpeg" }, { "file": "main-images/bts/f7e2b288-9cd6-4738-a8aa-bd6fb3bb5d9302.jpg", "size": 117164, "type": "image/jpeg" }, { "file": "main-images/bts/f806d00e-0ffc-424a-95ba-d8322a34b094kitchen discussion.jpg", "size": 157590, "type": "image/jpeg" }, { "file": "main-images/bts/f8926d4d-915f-4112-adf6-325e1d25ac6bvideo-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/fa2462f6-b9ae-4213-bcb7-b183cd77b151video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/face303e-a1d8-4c61-b08e-3b5e3497e21cmobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/bts/fba9d843-0357-4825-9a04-9b7f22c7c590video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/fe5912b7-8d20-4c23-afa2-a28b68bcba720.jpg", "size": 89705, "type": "image/jpeg" }, { "file": "main-images/bts/fe5b01fa-b63c-49a6-9ad0-d1eeeb8b19ac24.jpg", "size": 685463, "type": "image/jpeg" }, { "file": "main-images/bts/fef181ba-85b2-482e-8c28-fd4557ed33eevideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/bts/ffbc0d88-e840-46f2-9ca3-2d436993f5bb04.jpg", "size": 151638, "type": "image/jpeg" }, { "file": "main-images/bts/ffbe3cd8-65b3-4f4e-a393-88efb7df87a0013.jpg", "size": 344841, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/01cbb411-b361-438b-a492-ea6deaa1767aleft11.jpg", "size": 47657, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/01e7face-5f0e-4cda-a114-87687a098de014.jpg", "size": 750, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/02d8c5fc-df2c-4212-8b7a-ebb87a7ddc1cright22.jpg", "size": 61933, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/0790e1c2-69c3-4c41-95ba-6c31526280c4mobile-logo.png", "size": 72702, "type": "image/png" }, { "file": "main-images/carousel-renders/0994781f-1d02-4369-ac53-6e2379c0d28dleft5.jpg", "size": 37029, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/0a8b0035-15b0-4187-ad7b-cc827c94c0efleft5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/0aabbfae-b34c-44c2-a0ad-2bea3edec42e16.jpg", "size": 99492, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/0e7f9603-3766-4fec-bad1-b960f3cef5b5right25.jpg", "size": 31574, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/101954ec-19ff-4fa9-9567-619e82fe898eright24.jpg", "size": 21092, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/15e799ac-8de3-4545-9718-47c2d8408f2fright19.jpg", "size": 40576, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/16b4e5ed-4d3e-45d9-9030-f252c9a7404dleft9.jpg", "size": 32160, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/16b754b8-25ef-4748-acbd-1d2736f863c6left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1789f01f-8828-423c-b15d-1c5f756c0431video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/1c51962e-6266-446b-a044-d022bfc094b812.jpg", "size": 10926, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1cb062c7-d508-48d7-83cc-fcb0c4074bc1right28.jpg", "size": 44743, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1ccc29a6-c08e-4e01-aaab-4c274c17144fleft10.jpg", "size": 52385, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1d889bd1-5c5a-4c0a-829e-fefcae8bad5cright23.jpg", "size": 42033, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1e9ab7f5-0d78-40d5-b9f6-59ee072cdc61left15.jpg", "size": 56776, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1f2cefa7-d133-4750-be41-313b4a442f94right18.jpg", "size": 68575, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1f5b3352-aed0-4681-a679-6b02de2a78aaright27.jpg", "size": 57536, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1fb82ef7-fd7d-4e78-a4d4-85feefa50bf014.jpg", "size": 10992, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/1feb2960-3921-4a68-b518-1595d7154222right31.jpg", "size": 80158, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2106187f-6707-4d5d-a188-a182ea8299e6video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/222cc44b-0e01-476a-808b-016f596894758.jpg", "size": 574, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/22cab18f-64a3-497f-a52b-f3d3033d5184left3.jpg", "size": 40776, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/23043e06-2d61-4048-9990-fec476c81334right23.jpg", "size": 30451, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/23b7533f-8e52-4534-88ab-c7ccf90783d37.jpg", "size": 619, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2483eaa2-0708-4230-8d74-72a09b32615aright33.jpg", "size": 72003, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/249dd497-ac27-4929-966a-a38a853aa44bleft14.jpg", "size": 58154, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/257790d3-b25d-4e4e-b5f9-a359afb939b7left14.jpg", "size": 39106, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/292daa45-f965-40fb-8cf2-a2216fef2de9left1.jpg", "size": 57508, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2a633ab7-a05b-44de-b273-e962b504f7b92.jpg", "size": 693, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2c7228d3-0c77-4b58-afde-38eed49941d8left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2d1d8676-51c2-429b-9150-a10b3a36384712.jpg", "size": 731, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2d9d6a94-4e7d-48dd-b7bf-c3fcc3647d9bleft3.jpg", "size": 58764, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2f03a82c-cb57-46e2-b20f-1c29042f036cdrone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/2fab7341-f566-4e7a-a63e-09500dab9b89right24.jpg", "size": 35467, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/302cdd1e-4aaf-4140-a7c3-39c649390d09left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/31afbb50-9f77-432b-847b-0e635300dd1fright18.jpg", "size": 50814, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/3852f69d-8364-48b6-a231-c035745b0ed1left7.jpg", "size": 47039, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/3b43a4a6-91a2-429d-b1ac-2f166149209c4.jpg", "size": 16185, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/3bf1cfb9-f740-47a2-9358-5d55ce1a3db4left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/3d52f7d1-2300-4806-936b-76a723840ef1video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/3f2ddf6a-65a4-4d96-ae22-4fbc717ac445left8.jpg", "size": 40682, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/3fc14546-89ba-46c9-bc7d-5c0f8c04ea318.jpg", "size": 574, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/3fc152b6-08ed-466c-9a47-6bdcae2d2b1f1.jpg", "size": 15818, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/42a67cba-9508-4ad0-8694-ca6dbb282df1bg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/carousel-renders/42e79367-c18f-444c-8524-578a869e951aright26.jpg", "size": 46047, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/4327e0ab-b81f-4d14-9fe7-816b56629cbf13.jpg", "size": 10833, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/43bea5b2-1d5c-4827-b75d-15ad9329733c11.jpg", "size": 12175, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/4f9cb55a-eb30-4c03-bd14-bc614e0efe864.jpg", "size": 746, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/503fc5cc-5fb6-4f03-9c2a-0aea1c5c9733left8.jpg", "size": 25809, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/507c8742-04a4-4f00-80b8-e1f8fc7bd1a4left6.jpg", "size": 38976, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/598a8637-6c72-470f-8968-4134c2afbd956.jpg", "size": 694, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/60ab5f1a-c842-4d21-b0f8-66bf19b0ae5bright30.jpg", "size": 44991, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6178a376-319b-4567-8f46-677dba311b0aright32.jpg", "size": 59135, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/66abbbf8-1e38-40ae-a780-94df068fe138right29.jpg", "size": 43618, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/680b5d2d-febe-49bf-96dc-e15c1f6902ebvideo-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/6b2f7fd0-ad46-485c-8e48-dc88fb81931c5.jpg", "size": 10893, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6c1db9a2-075b-4141-aa8f-36e664b01cbfright20.jpg", "size": 39998, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6cdb1e40-2aec-443f-b347-1ee0cca00172drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6db3eedf-2310-4404-ba8b-3a3a43fb45c1left10.jpg", "size": 34695, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6e2dfc48-eaad-4998-9d7e-daf6ae1671ecleft12.jpg", "size": 46841, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6e36b22c-c10e-4781-b765-49237127f50fleft4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/6f44b7e6-ab53-4d86-a64a-e99c6e3538623.jpg", "size": 711, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/7035ea0f-991c-407b-b16b-4cf08f369e8abg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/carousel-renders/70632074-45d4-4d56-8b24-f224f38448657.jpg", "size": 9978, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/718f853e-7b63-419e-9e29-c418ec7e30afleft12.jpg", "size": 28729, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/71cb6e97-d235-4d8e-990b-27bc6ce7d98fleft11.jpg", "size": 29602, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/736acb48-396c-4e71-bcae-d00351af88832.jpg", "size": 693, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/7406f5de-aa95-410c-8051-15ce4e1ff6856.jpg", "size": 15741, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/75e18430-9021-4ad9-92fa-32b20567d9eb11.jpg", "size": 796, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/76f4e76b-65f7-4ed0-8108-eff4b6de0af910.jpg", "size": 584, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/78c25a45-de66-43cc-81f1-0dc928bf7fa111.jpg", "size": 796, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/795d282a-fb2a-465e-ad3c-94601a710170left16.jpg", "size": 34675, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/7a0d12c2-bac4-4a28-a647-bb02cf445f8e9.jpg", "size": 651, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/7bfd1667-85f7-401c-b3f2-4d8f9d2c12cd10.jpg", "size": 9671, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/7c9df2e9-e5f8-4ea8-ba74-900264e4b526video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/7eb082cf-230a-4848-9775-28419b3514569.jpg", "size": 10717, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/7f65ff9b-9266-4455-9db0-7902c5de6c53video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/8214a923-a9d9-462b-bfd3-bf974e00a190left1.jpg", "size": 39532, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/82a52d11-a635-4c67-a9ee-3044b336def05.jpg", "size": 710, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/83d607da-5835-4d88-a125-7c2426143e26left7.jpg", "size": 33121, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/871bc7b7-edf8-4b3e-86a2-ab3e119a43ceright33.jpg", "size": 95702, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/873a57ee-12e7-4782-a4de-1937e6ebca49left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/8860c826-6a63-4d07-893d-ea2000d6dac315.jpg", "size": 87863, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/8d174a28-50c2-4f15-9199-c9504a40a534left16.jpg", "size": 51433, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/8e2ded66-f490-49a2-8762-4cba6a15fda8right21.jpg", "size": 26337, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/8ed8c3b8-011d-423c-ba96-d1e7d736b3071.jpg", "size": 707, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/8f559d02-d821-4f10-9b34-cea1979b091bleft13.jpg", "size": 30789, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/92d6e5f9-3f25-4099-94a9-70444d716deeleft3.jpg", "size": 58764, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/9616fdbe-24bd-4fad-9a14-1462143a6f76right20.jpg", "size": 59791, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/98e7f009-e097-4f6f-a7d9-d6ef5f8618bd3.jpg", "size": 15254, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/9de461d7-6c96-41db-a3bb-1bfb43fb3474video-render-text-brush.png", "size": 12153, "type": "image/png" }, { "file": "main-images/carousel-renders/a0421934-cf83-4b4c-bd91-511a80184e75right21.jpg", "size": 41395, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/a1a8a0cb-c9b6-42c4-9e6b-2788c6c7af23left0.jpg", "size": 45248, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/a237e991-1830-4ddf-bb32-47c69d62b88dright30.jpg", "size": 29115, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/a4a6826b-6e1c-412b-81fd-eb9b6dddd7e9video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/a52c0f4a-6632-4659-b89c-5a3cba174ccbleft4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/a651f4e3-f05a-481d-ba6a-815396ae35b410.jpg", "size": 584, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/ac64f485-f825-4e16-9571-7e5b172847d9video-render-title-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/ad30b784-b964-4ae8-be2e-956b749d49dbright17.jpg", "size": 54763, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/af6244ae-de3c-406e-a754-5b354789adadright17.jpg", "size": 37528, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/afff29cf-d0ff-4660-aa36-5d867f0218a6right29.jpg", "size": 27699, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/b1234d18-fbc5-4207-b1b2-0a392a785da5left5.jpg", "size": 52272, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/b404c91a-d502-4ecb-81bd-1425a9a44e4312.jpg", "size": 731, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/b9e46367-78ca-4185-8850-c41cdda8bd84right31.jpg", "size": 106151, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/bc15e2b9-54bd-4eb7-88e0-3f9ebeb2079aleft4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/bd6c7812-9147-42c1-b8b1-52a1953007f8left9.jpg", "size": 19238, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c10c49c5-8f3a-4922-8ef4-92085b967379left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c3f67f6c-1c5f-4068-99d0-4844d063de5eright22.jpg", "size": 45037, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c429c0a6-2145-4aa6-8053-9634d40f63c7right27.jpg", "size": 39205, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c4a8947a-dd4d-4fcf-8371-9a43319fe8ffright25.jpg", "size": 47648, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c7a57b7c-e27d-4aa6-9c31-46c16026c269left13.jpg", "size": 47586, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c7dd46e5-c5d7-48e6-9584-1b8a501a39775.jpg", "size": 710, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c8c917d8-6cba-45d7-99b4-3329672eac4fbg-content.png.png", "size": 97578, "type": "image/png" }, { "file": "main-images/carousel-renders/c90e906b-67c5-431b-92e4-38a268932394left6.jpg", "size": 24271, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/c96d6688-5c53-4b65-a2ab-7e0245644bc9video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/Capture.JPG", "size": 69740, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/cc1b7500-1f80-4c58-a130-16f1fe32e7b5left2.jpg", "size": 40265, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/d0a9884f-0884-4f94-915d-6f62c0026b4a1.jpg", "size": 707, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/d1c4f496-00c7-4e44-9723-94e7d85b7eb4left0.jpg", "size": 63430, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/d29194f8-a253-47aa-afaf-e00bb38eceb0right26.jpg", "size": 30626, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/d2c5e7be-21a5-40ed-b8d4-3c94633ae1d7drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/d31389b8-4859-4ded-8819-015eaecd72f9left4.jpg", "size": 29158, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/dcb64191-ade2-479e-b545-9c6e639d562c4.jpg", "size": 746, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/de17fc1f-b9e4-4524-82c9-9ad8d7f79f44left4.jpg", "size": 42850, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/de9d1f48-6e4d-46c0-b343-e10c12a5af642.jpg", "size": 11535, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/e14e5f33-c6e2-4834-aacd-50f8bef3a4767.jpg", "size": 619, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/e3e88a48-591f-40da-970e-94442e6172f2right19.jpg", "size": 25884, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/e6bfb052-5e4a-4b21-99e4-0c18500c9c01video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/carousel-renders/e6d9ff30-3ec5-4466-ad87-b8c743c7d87813.jpg", "size": 739, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/e957d856-aa28-4537-a08c-dc76913bc1b514.jpg", "size": 750, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/ebe9b8aa-3998-4031-8eba-ba1260615e06right32.jpg", "size": 41707, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/f219a493-77a8-4fc2-9bdd-afe78ecb4099right28.jpg", "size": 28730, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/f7cc3646-ecfc-4c99-91c1-231c7cfa643fleft15.jpg", "size": 40493, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/f83cef51-5027-4f4a-acbe-7dba4d4d710f17.jpg", "size": 73318, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/f8815450-044c-4f2e-8edb-d482f7bb85659.jpg", "size": 651, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/f90ecafb-77bb-48d9-a168-af951a47a2a713.jpg", "size": 739, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/fb02ca5d-bd27-4614-ac92-e25b7600ff0b8.jpg", "size": 9786, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/fb1f283b-fdb8-49bc-93c8-5cc6be10c4ad6.jpg", "size": 694, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/fc123680-0c34-43d8-ae1d-c2ff70d909a1left2.jpg", "size": 58872, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/fe973c86-9de1-4d81-be02-7d6613c5fc6e3.jpg", "size": 711, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/left0.jpg", "size": 105597, "type": "image/jpeg" }, { "file": "main-images/carousel-renders/lest go.JPG", "size": 80519, "type": "image/jpeg" }, { "file": "main-images/page-carousels/0089b091-6e96-46d4-9eae-f883cac6757311.jpg", "size": 146273, "type": "image/jpeg" }, { "file": "main-images/page-carousels/11ff6563-17b3-4cf5-89ec-75c05486d79433340 Mullholland Hwy_2ND FLOOR 20211001.jpg", "size": 76256, "type": "image/jpeg" }, { "file": "main-images/page-carousels/130e72f1-2b07-499c-8faf-b860dbfa8d1f5.jpg", "size": 272997, "type": "image/jpeg" }, { "file": "main-images/page-carousels/132c1bb4-2e54-4fb2-8ecb-af66a06c57021.jpg", "size": 287065, "type": "image/jpeg" }, { "file": "main-images/page-carousels/1335005c-640b-4736-8f5e-1ca46d576ad212.jpg", "size": 608043, "type": "image/jpeg" }, { "file": "main-images/page-carousels/145d3d93-7c1d-4487-a448-85ca9f76203d33340 MULHOLLAND INT IMG 3A_00.jpg", "size": 71264, "type": "image/jpeg" }, { "file": "main-images/page-carousels/15e58380-9a37-4d1a-bbc8-21b924d17cfc33340 MULHOLLAND INT IMG 4A.jpg", "size": 77530, "type": "image/jpeg" }, { "file": "main-images/page-carousels/21639d58-caf5-4f78-8b2e-72d09ae1c17533340 Mullholland Hwy_SITE PLAN.jpg", "size": 110090, "type": "image/jpeg" }, { "file": "main-images/page-carousels/24c62537-942b-43c1-aae8-a36ffe1c54c333340 Mullholland Hwy_1ST FLOOR  BLACK 20211001.jpg", "size": 151979, "type": "image/jpeg" }, { "file": "main-images/page-carousels/273cee80-09bf-4f36-8834-ba2262985d3a33340 Mullholland Hwy_SITE PLAN.jpg", "size": 110060, "type": "image/jpeg" }, { "file": "main-images/page-carousels/279a7d44-7067-4bcb-ab9e-a00c1034760433340 MULHOLLAND INT IMG 26A.jpg", "size": 49377, "type": "image/jpeg" }, { "file": "main-images/page-carousels/30f762b7-d9e4-484d-9eca-144d8eaa5d3f33340 MULHOLLAND INT IMG 34C.jpg", "size": 52393, "type": "image/jpeg" }, { "file": "main-images/page-carousels/33df4d1a-ec8b-4f98-8819-54e60ef23bef33340 Mullholland Hwy_1ST FLOOR  BLACK 20211001.jpg", "size": 151979, "type": "image/jpeg" }, { "file": "main-images/page-carousels/34da93d1-5300-4bb1-84f1-27cc904e661d9.jpg", "size": 98448, "type": "image/jpeg" }, { "file": "main-images/page-carousels/39919891-c340-481c-9d00-6fd02749290dbg1.jpg", "size": 211704, "type": "image/jpeg" }, { "file": "main-images/page-carousels/3fdf5fe9-4bbc-4153-9a07-f1cd44a9ac80video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/page-carousels/41444d70-daa7-4c19-9d65-6a3915969c9812.jpg", "size": 148991, "type": "image/jpeg" }, { "file": "main-images/page-carousels/4defcbb9-d210-43d4-be6c-89a9190c512733340 MULHOLLAND INT IMG 14A.jpg", "size": 49289, "type": "image/jpeg" }, { "file": "main-images/page-carousels/56c724d9-ce77-4d23-895b-a259d20597509.jpg", "size": 266874, "type": "image/jpeg" }, { "file": "main-images/page-carousels/5817fc5d-d521-4bd5-86b6-3b2b97da8c5033340 Mullholland Hwy_2ND FLOOR 20211001.jpg", "size": 76256, "type": "image/jpeg" }, { "file": "main-images/page-carousels/594bf9f3-99c9-4360-9ecf-5e6fdb0de4112.jpg", "size": 73318, "type": "image/jpeg" }, { "file": "main-images/page-carousels/637f60a2-e3b0-4956-8e5c-3434fbe9a9997.jpg", "size": 84163, "type": "image/jpeg" }, { "file": "main-images/page-carousels/67f54d2e-3a19-402a-871d-71e708b5515d8.jpg", "size": 247752, "type": "image/jpeg" }, { "file": "main-images/page-carousels/706ef233-6be1-4094-a20a-f7821fd5370a4.jpg", "size": 76490, "type": "image/jpeg" }, { "file": "main-images/page-carousels/82c4ca9d-bc43-4d0c-b3c9-22366a1dc14cvideo-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/page-carousels/848006d0-141a-4b9e-a1b1-6ddabc0dc70e8.jpg", "size": 88186, "type": "image/jpeg" }, { "file": "main-images/page-carousels/852482cf-b737-4b46-a9d1-a4fe5019a6271.jpg", "size": 99492, "type": "image/jpeg" }, { "file": "main-images/page-carousels/8722c5a1-8afa-491a-bf73-8759fc441c9433340 MULHOLLAND INT IMG 11A_00.jpg", "size": 56483, "type": "image/jpeg" }, { "file": "main-images/page-carousels/8d29b538-c15c-4707-9ec9-062add71920610.jpg", "size": 106566, "type": "image/jpeg" }, { "file": "main-images/page-carousels/a2eb7160-6824-45be-9351-f030e89165a810.jpg", "size": 297762, "type": "image/jpeg" }, { "file": "main-images/page-carousels/a77f2e2f-fa51-42fa-a256-5854864ae0b333340 MULHOLLAND INT IMG 30A.jpg", "size": 43884, "type": "image/jpeg" }, { "file": "main-images/page-carousels/aea0f6aa-ac67-4d52-8934-0301564699012.jpg", "size": 211390, "type": "image/jpeg" }, { "file": "main-images/page-carousels/b094a2f0-3b61-45dd-9045-9410cfd63c59video-render-text-brush.png", "size": 2125, "type": "image/png" }, { "file": "main-images/page-carousels/b5240e20-6710-48b8-8327-819a7b3a018233340 Mullholland Hwy_1ST FLOOR  BLACK 20211001.jpg", "size": 152034, "type": "image/jpeg" }, { "file": "main-images/page-carousels/ba0b8ddc-36eb-4bd5-8971-d408d45d38fe5.jpg", "size": 94435, "type": "image/jpeg" }, { "file": "main-images/page-carousels/bg2.jpg", "size": 87555, "type": "image/jpeg" }, { "file": "main-images/page-carousels/c1943f41-9998-44b6-af17-db0b77549fb933340 MULHOLLAND INT IMG 26B.jpg", "size": 50873, "type": "image/jpeg" }, { "file": "main-images/page-carousels/c5c03705-6edd-480e-ab26-30f5524b10e5drone.jpg", "size": 127249, "type": "image/jpeg" }, { "file": "main-images/page-carousels/c5c3d120-1e6d-4a7f-a876-62466435f90e3.jpg", "size": 247113, "type": "image/jpeg" }, { "file": "main-images/page-carousels/cbc133d1-fc44-422e-a271-8419ef8a197e33340 Mullholland Hwy_2ND FLOOR 20211001.jpg", "size": 76263, "type": "image/jpeg" }, { "file": "main-images/page-carousels/d0a6c85d-72d9-471d-b12c-5cdfb8bc5e156.jpg", "size": 267370, "type": "image/jpeg" }, { "file": "main-images/page-carousels/dd510ed7-2902-41db-aa88-e1a10fbd84546.jpg", "size": 92695, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e03fbe92-d698-4e7e-8134-d01e34cdf35433340 MULHOLLAND INT IMG 24A.jpg", "size": 48532, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e04865ee-1f79-42d7-9d4f-1f69372b399833340 MULHOLLAND INT IMG 31A.jpg", "size": 63909, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e1772996-c6eb-486c-a298-461e964d1e3233340 MULHOLLAND INT IMG 16A_00.jpg", "size": 70372, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e2dd5515-e14f-4131-b399-8f49d5b6128cbg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/page-carousels/e44ced66-d7aa-4b46-bb12-0f9430869a9833340 MULHOLLAND INT IMG 34B.jpg", "size": 48854, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e4a24963-51ad-486b-b177-98cbd6db0a657.jpg", "size": 225756, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e4ce2011-b99c-4793-8f49-4b4e287a347f4.jpg", "size": 217055, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e6c8fe5a-7fd3-428d-b643-e96e0fab95ea33340 MULHOLLAND INT IMG 12A_00.jpg", "size": 68569, "type": "image/jpeg" }, { "file": "main-images/page-carousels/e83b06d7-58b4-4088-8c8f-a60ea4fe2edbbg-content.png.png", "size": 77539, "type": "image/png" }, { "file": "main-images/page-carousels/ec86e83b-669c-4670-a68c-a8a2f9eb24df33340 Mullholland Hwy_SITE PLAN.jpg", "size": 110060, "type": "image/jpeg" }, { "file": "main-images/page-carousels/f5c6d9a1-c36d-4bf1-a456-83fee0ded77433340 MULHOLLAND INT IMG 34A.jpg", "size": 50686, "type": "image/jpeg" }, { "file": "main-images/page-carousels/f5f72b1d-db0d-4ad2-aae3-3391f71dac2a3.jpg", "size": 87863, "type": "image/jpeg" }, { "file": "main-images/page-carousels/fbf8eb1c-b791-41e1-a45e-7122c771bdf811.jpg", "size": 591110, "type": "image/jpeg" }, { "file": "main-images/page-carousels/lest go.JPG", "size": 80519, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/1fdadf8f-7b84-4ed7-aad9-0682a50d60e633340 MULHOLLAND INT IMG 3A_00.jpg", "size": 594754, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/26fffcba-27ec-4514-bf92-e1b01a5f0ef133340 MULHOLLAND INT IMG 12A_00.jpg", "size": 606452, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/33e2bb22-7a9a-4b7e-af58-0ebe8541cf4633340 MULHOLLAND INT IMG 30A.jpg", "size": 328103, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/5cc9ee01-a6e7-4d59-8e2d-f4583f7c03ca33340 MULHOLLAND INT IMG 34B.jpg", "size": 346439, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/6c66c0a6-076e-4a30-bae0-dd63e9ea651d33340 MULHOLLAND INT IMG 14A.jpg", "size": 345333, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/8af8ddbb-9305-4671-bde8-f4089a4c863033340 MULHOLLAND INT IMG 34C.jpg", "size": 359691, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/8b59abf5-2b17-4e82-ad0f-0bde42e72f0c33340 MULHOLLAND INT IMG 11A_00.jpg", "size": 457333, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/9f4e5977-08ab-42f7-9a72-f91d7364789733340 MULHOLLAND INT IMG 34A.jpg", "size": 0, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/a29890b4-09b8-4372-a8db-b1b4867e34c933340 MULHOLLAND INT IMG 26A.jpg", "size": 364768, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/a52befb9-ce84-4070-9818-bafe2cda858c33340 MULHOLLAND INT IMG 24A.jpg", "size": 435529, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/b3376bb1-d649-458f-a67b-4e4dfd3faec433340 MULHOLLAND INT IMG 26B.jpg", "size": 379369, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/c05a38eb-bbd0-4060-9cce-51d54bd17f3f33340 MULHOLLAND INT IMG 31A.jpg", "size": 428965, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/c3842087-1843-467d-a178-67dbd15c8ae733340 MULHOLLAND INT IMG 16A_00.jpg", "size": 559894, "type": "image/jpeg" }, { "file": "main-images/renders-mobile/e9fe4aaa-49ac-4bad-9f7f-ee02ce5a98a233340 MULHOLLAND INT IMG 4A.jpg", "size": 639471, "type": "image/jpeg" }, { "file": "Maliview Left.png", "size": 95878, "type": "image/png" }, { "file": "Maliview Right.png", "size": 89766, "type": "image/png" }, { "file": "mobile-logo.png", "size": 188684, "type": "image/png" }, { "file": "playButton.png", "size": 15631, "type": "image/png" }, { "file": "z-caroArrow.png", "size": 28229, "type": "image/png" }],
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
const metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-a913ad6c.js", "css": [], "js": ["layout.svelte-a913ad6c.js", "chunks/vendor-0947166e.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-6ed99ddc.js", "css": [], "js": ["error.svelte-6ed99ddc.js", "chunks/vendor-0947166e.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-d9ef0f45.js", "css": ["assets/pages/index.svelte-08a4885a.css"], "js": ["pages/index.svelte-d9ef0f45.js", "chunks/vendor-0947166e.js"], "styles": [] } };
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
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load$1({ error: error2, status }) {
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
  load: load$1
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
const images = [
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
const pageLayout = {};
const currentPageStore = () => {
  const state = {
    page: 0,
    action: null
  };
  const { subscribe: subscribe2, set, update } = writable(state);
  const methods = {
    setPage(val) {
      update((state2) => {
        if (val === 1 && state2.page === images.length / 2 + 2) {
          state2.page = 0;
          return state2;
        }
        if (val === -1 && state2.page >= 1 || val === 1 && state2.page < images.length / 2 + 2) {
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
const galleryImg = writable({
  currPhase: 0,
  index: 0,
  selected: 0,
  imageToDisplay: pageLayout["bts"] ? pageLayout["bts"][0].images[0].url : null
});
var Modal_svelte_svelte_type_style_lang = "";
const css$n = {
  code: ".video-container.svelte-1uwzqqj .video-modal.svelte-1uwzqqj{position:absolute;top:0;bottom:0;left:0;right:0;height:100%;width:100%}img.svelte-1uwzqqj.svelte-1uwzqqj{width:100%;object-fit:cover;height:100%}",
  map: `{"version":3,"file":"Modal.svelte","sources":["Modal.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { modal } from \\"../../stores\\";\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"bu-modal {$modal.visibility ? 'bu-is-active' : ''}\\">\\r\\n  <div\\r\\n    on:click={() => {\\r\\n      $modal.content = null;\\r\\n\\r\\n      $modal.visibility = false;\\r\\n    }}\\r\\n    class=\\"bu-modal-background\\"\\r\\n  />\\r\\n  <div class=\\"bu-modal-content\\">\\r\\n    <div class=\\"bu-image bu-is-4by3\\">\\r\\n      {#if $modal.type === \\"video\\"}\\r\\n        <div class=\\"video-container\\">\\r\\n          <iframe\\r\\n            height=\\"100%\\"\\r\\n            class=\\"video-modal\\"\\r\\n            width=\\"100%\\"\\r\\n            src={$modal.content}\\r\\n            title=\\"YouTube video player\\"\\r\\n            frameBorder=\\"0\\"\\r\\n            allow=\\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\\"\\r\\n            allowFullScreen\\r\\n          />\\r\\n        </div>\\r\\n      {:else}\\r\\n        <img src={$modal.content} alt=\\"\\" />\\r\\n      {/if}\\r\\n    </div>\\r\\n  </div>\\r\\n  <button\\r\\n    on:click={() => {\\r\\n      $modal.content = null;\\r\\n\\r\\n      $modal.visibility = false;\\r\\n    }}\\r\\n    class=\\"bu-modal-close bu-is-large\\"\\r\\n    aria-label=\\"close\\"\\r\\n  />\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.video-container .video-modal {\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  height: 100%;\\n  width: 100%;\\n}\\n\\nimg {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AA4CmB,+BAAgB,CAAC,YAAY,eAAC,CAAC,AAChD,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,AACb,CAAC,AAED,GAAG,8BAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $modal, $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => $modal = value);
  $$result.css.add(css$n);
  $$unsubscribe_modal();
  return `<div class="${"bu-modal " + escape($modal.visibility ? "bu-is-active" : "")}"><div class="${"bu-modal-background"}"></div>
  <div class="${"bu-modal-content"}"><div class="${"bu-image bu-is-4by3"}">${$modal.type === "video" ? `<div class="${"video-container svelte-1uwzqqj"}"><iframe height="${"100%"}" class="${"video-modal svelte-1uwzqqj"}" width="${"100%"}"${add_attribute("src", $modal.content, 0)} title="${"YouTube video player"}" frameborder="${"0"}" allow="${"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}" allowfullscreen></iframe></div>` : `<img${add_attribute("src", $modal.content, 0)} alt="${""}" class="${"svelte-1uwzqqj"}">`}</div></div>
  <button class="${"bu-modal-close bu-is-large"}" aria-label="${"close"}"></button>
</div>`;
});
var Hamburger_svelte_svelte_type_style_lang = "";
const css$m = {
  code: '.burger-label.svelte-1vckazx.svelte-1vckazx{block-size:18px;display:flex;justify-content:center;cursor:pointer;inline-size:18px;font-size:14px;line-height:21px;align-items:center}.burger-label.svelte-1vckazx .main-trigger-icon-container.svelte-1vckazx{position:relative;display:block;block-size:18px;inline-size:100%}.burger-label.svelte-1vckazx .main-trigger-icon-container .main-trigger-icon.svelte-1vckazx{background-color:white;inline-size:100%;position:absolute;display:block;transition:all 300ms ease-in-out;block-size:calc(20px / 10);top:calc(36% + 2px)}.burger-label.svelte-1vckazx .main-trigger-icon-container .main-trigger-icon.svelte-1vckazx:before{transition:all 300ms ease-in-out;block-size:calc(20px / 10);background-color:white;content:"";top:-5px;display:block;position:absolute;inline-size:100%}.burger-label.svelte-1vckazx .main-trigger-icon-container .main-trigger-icon.svelte-1vckazx:after{transition:all 300ms ease-in-out;block-size:calc(20px / 10);background-color:white;content:"";top:5px;display:block;position:absolute;inline-size:100%}.burger-input.svelte-1vckazx.svelte-1vckazx{opacity:1;display:none}.burger-input.svelte-1vckazx:checked~.burger-label.svelte-1vckazx{z-index:4}.burger-input:checked~.burger-label.svelte-1vckazx .main-trigger-icon.svelte-1vckazx{transition:all 300ms ease-in-out;background-color:transparent}.burger-input:checked~.burger-label.svelte-1vckazx .main-trigger-icon.svelte-1vckazx:before{top:0;z-index:4;background-color:black;transform:rotate(45deg);transition:all 300ms ease-in-out}.burger-input:checked~.burger-label.svelte-1vckazx .main-trigger-icon.svelte-1vckazx:after{top:0;z-index:4;background-color:black;transform:rotate(-45deg);transition:all 300ms ease-in-out}.burger-input.svelte-1vckazx:checked~.side-menu-container.svelte-1vckazx{background-color:white;height:100vh;bottom:0;top:0;display:flex;flex-direction:column;transition:all 400ms ease-in-out;z-index:3;left:0;position:absolute}.burger-input:checked~.side-menu-container.svelte-1vckazx .side-menu-item-container.svelte-1vckazx{padding:40px 8px;overflow-y:scroll;height:100%;margin-top:1.5rem}.burger-input:checked~.side-menu-container.svelte-1vckazx .side-menu-item-container.svelte-1vckazx::before{content:"";height:100%;width:100%;display:block;opacity:30%;background-size:200px;z-index:1;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;background-repeat:no-repeat;background-position:center center}.burger-input:checked~.side-menu-container.svelte-1vckazx .side-menu-item-container.svelte-1vckazx::-webkit-scrollbar{display:none}.burger-input:checked~.side-menu-container.svelte-1vckazx .side-menu-item-container li.svelte-1vckazx:nth-child(-n+11){font-size:23px;font-weight:600;display:flex;text-transform:uppercase;align-items:center;z-index:2;position:relative;color:black;cursor:pointer;padding:20px 110px 20px 20px;border-bottom:1px solid #d0d1d2}.burger-input.svelte-1vckazx:checked~.header-mask.svelte-1vckazx{position:fixed;block-size:100vh;top:0;left:0;z-index:2;bottom:0;inline-size:100%;background-color:rgba(0, 0, 0, 0.5)}.side-menu-container.svelte-1vckazx.svelte-1vckazx{position:relative;background-color:white;height:100vh;bottom:0;top:0;display:flex;flex-direction:column;transition:all 400ms ease-in-out;z-index:3;left:-600px;position:absolute}.side-menu-container.svelte-1vckazx .side-menu-item-container.svelte-1vckazx{padding:40px 8px;overflow-y:scroll;height:100%;margin-top:1.5rem}.side-menu-container.svelte-1vckazx .side-menu-item-container.svelte-1vckazx::before{content:"";height:100%;width:100%;display:block;opacity:30%;background-size:200px;z-index:1;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;background-repeat:no-repeat;background-position:center center}.side-menu-container.svelte-1vckazx .side-menu-item-container.svelte-1vckazx::-webkit-scrollbar{display:none}.side-menu-container.svelte-1vckazx .side-menu-item-container li.svelte-1vckazx:nth-child(-n+11){font-size:23px;font-weight:600;display:flex;text-transform:uppercase;align-items:center;z-index:2;position:relative;color:black;cursor:pointer;padding:20px 110px 20px 20px;border-bottom:1px solid #d0d1d2}.sidebar-logo-container.svelte-1vckazx.svelte-1vckazx{max-width:266px;margin:auto;padding:30px;z-index:2;position:relative}.sidebar-logo-container.svelte-1vckazx img.svelte-1vckazx{width:100%;object-fit:cover}',
  map: `{"version":3,"file":"Hamburger.svelte","sources":["Hamburger.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { navButtons, navToLink } from '../../pageContent';\\r\\n\\timport { pagePositions } from '../../stores';\\r\\n\\r\\n\\tlet mainInput;\\r\\n\\tfunction triggerScroll(i) {\\r\\n\\t\\t$pagePositions.inital = true;\\r\\n\\t\\t$pagePositions.left = i * -100;\\r\\n\\t\\t$pagePositions.right = 100 * (i - 10);\\r\\n\\t\\t$pagePositions.page = i;\\r\\n\\t\\tmainInput.checked = false;\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<div>\\r\\n\\t<input bind:this=\\"{mainInput}\\" type=\\"checkbox\\" id=\\"burger-trigger\\" class=\\"burger-input\\" />\\r\\n\\t<label for=\\"burger-trigger\\" class=\\"burger-label\\">\\r\\n\\t\\t<span class=\\"main-trigger-icon-container\\">\\r\\n\\t\\t\\t<i class=\\"main-trigger-icon\\"></i>\\r\\n\\t\\t</span>\\r\\n\\t</label>\\r\\n\\t<div class=\\"side-menu-container\\">\\r\\n\\t\\t<ul name=\\"list-container\\" class=\\"side-menu-item-container\\">\\r\\n\\t\\t\\t{#each navButtons as label, i}\\r\\n\\t\\t\\t\\t<li\\r\\n\\t\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\t\\ttriggerScroll(i);\\r\\n\\t\\t\\t\\t\\t\\twindow.location.href = '#' + navToLink[i];\\r\\n\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t{label}\\r\\n\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t{/each}\\r\\n\\t\\t</ul>\\r\\n\\t\\t<div class=\\"sidebar-logo-container\\">\\r\\n\\t\\t\\t<a\\r\\n\\t\\t\\t\\ton:click=\\"{(e) => {\\r\\n\\t\\t\\t\\t\\te.preventDefault();\\r\\n\\t\\t\\t\\t\\twindow.open('https://www.apeldesign.com/');\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\thref=\\"https://www.apeldesign.com/\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t<img src=\\"By Apel Design Black.png\\" alt=\\"\\" />\\r\\n\\t\\t\\t</a>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n\\r\\n\\t<div\\r\\n\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\tmainInput.checked = false;\\r\\n\\t\\t}}\\"\\r\\n\\t\\tdata-id=\\"header-mask\\"\\r\\n\\t\\tclass=\\"header-mask\\"\\r\\n\\t></div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.burger-label {\\n  block-size: 18px;\\n  display: flex;\\n  justify-content: center;\\n  cursor: pointer;\\n  inline-size: 18px;\\n  font-size: 14px;\\n  line-height: 21px;\\n  align-items: center;\\n}\\n.burger-label .main-trigger-icon-container {\\n  position: relative;\\n  display: block;\\n  block-size: 18px;\\n  inline-size: 100%;\\n}\\n.burger-label .main-trigger-icon-container .main-trigger-icon {\\n  background-color: white;\\n  inline-size: 100%;\\n  position: absolute;\\n  display: block;\\n  transition: all 300ms ease-in-out;\\n  block-size: calc(20px / 10);\\n  top: calc(36% + 2px);\\n}\\n.burger-label .main-trigger-icon-container .main-trigger-icon:before {\\n  transition: all 300ms ease-in-out;\\n  block-size: calc(20px / 10);\\n  background-color: white;\\n  content: \\"\\";\\n  top: -5px;\\n  display: block;\\n  position: absolute;\\n  inline-size: 100%;\\n}\\n.burger-label .main-trigger-icon-container .main-trigger-icon:after {\\n  transition: all 300ms ease-in-out;\\n  block-size: calc(20px / 10);\\n  background-color: white;\\n  content: \\"\\";\\n  top: 5px;\\n  display: block;\\n  position: absolute;\\n  inline-size: 100%;\\n}\\n\\n.burger-input {\\n  opacity: 1;\\n  display: none;\\n}\\n.burger-input:checked ~ .burger-label {\\n  z-index: 4;\\n}\\n.burger-input:checked ~ .burger-label .main-trigger-icon {\\n  transition: all 300ms ease-in-out;\\n  background-color: transparent;\\n}\\n.burger-input:checked ~ .burger-label .main-trigger-icon:before {\\n  top: 0;\\n  z-index: 4;\\n  background-color: black;\\n  transform: rotate(45deg);\\n  transition: all 300ms ease-in-out;\\n}\\n.burger-input:checked ~ .burger-label .main-trigger-icon:after {\\n  top: 0;\\n  z-index: 4;\\n  background-color: black;\\n  transform: rotate(-45deg);\\n  transition: all 300ms ease-in-out;\\n}\\n.burger-input:checked ~ .side-menu-container {\\n  background-color: white;\\n  height: 100vh;\\n  bottom: 0;\\n  top: 0;\\n  display: flex;\\n  flex-direction: column;\\n  transition: all 400ms ease-in-out;\\n  z-index: 3;\\n  left: 0;\\n  position: absolute;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container {\\n  padding: 40px 8px;\\n  overflow-y: scroll;\\n  height: 100%;\\n  margin-top: 1.5rem;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container::before {\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  display: block;\\n  opacity: 30%;\\n  background-size: 200px;\\n  z-index: 1;\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n  background-repeat: no-repeat;\\n  background-position: center center;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container::-webkit-scrollbar {\\n  display: none;\\n}\\n.burger-input:checked ~ .side-menu-container .side-menu-item-container li:nth-child(-n+11) {\\n  font-size: 23px;\\n  font-weight: 600;\\n  display: flex;\\n  text-transform: uppercase;\\n  align-items: center;\\n  z-index: 2;\\n  position: relative;\\n  color: black;\\n  cursor: pointer;\\n  padding: 20px 110px 20px 20px;\\n  border-bottom: 1px solid #d0d1d2;\\n}\\n.burger-input:checked ~ .header-mask {\\n  position: fixed;\\n  block-size: 100vh;\\n  top: 0;\\n  left: 0;\\n  z-index: 2;\\n  bottom: 0;\\n  inline-size: 100%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n}\\n\\n.side-menu-container {\\n  position: relative;\\n  background-color: white;\\n  height: 100vh;\\n  bottom: 0;\\n  top: 0;\\n  display: flex;\\n  flex-direction: column;\\n  transition: all 400ms ease-in-out;\\n  z-index: 3;\\n  left: -600px;\\n  position: absolute;\\n}\\n.side-menu-container .side-menu-item-container {\\n  padding: 40px 8px;\\n  overflow-y: scroll;\\n  height: 100%;\\n  margin-top: 1.5rem;\\n}\\n.side-menu-container .side-menu-item-container::before {\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  display: block;\\n  opacity: 30%;\\n  background-size: 200px;\\n  z-index: 1;\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n  background-repeat: no-repeat;\\n  background-position: center center;\\n}\\n.side-menu-container .side-menu-item-container::-webkit-scrollbar {\\n  display: none;\\n}\\n.side-menu-container .side-menu-item-container li:nth-child(-n+11) {\\n  font-size: 23px;\\n  font-weight: 600;\\n  display: flex;\\n  text-transform: uppercase;\\n  align-items: center;\\n  z-index: 2;\\n  position: relative;\\n  color: black;\\n  cursor: pointer;\\n  padding: 20px 110px 20px 20px;\\n  border-bottom: 1px solid #d0d1d2;\\n}\\n\\n.sidebar-logo-container {\\n  max-width: 266px;\\n  margin: auto;\\n  padding: 30px;\\n  z-index: 2;\\n  position: relative;\\n}\\n.sidebar-logo-container img {\\n  width: 100%;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAwDmB,aAAa,8BAAC,CAAC,AAChC,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,CACjB,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,4BAAa,CAAC,4BAA4B,eAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,4BAAa,CAAC,4BAA4B,CAAC,kBAAkB,eAAC,CAAC,AAC7D,gBAAgB,CAAE,KAAK,CACvB,WAAW,CAAE,IAAI,CACjB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAC3B,GAAG,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,GAAG,CAAC,AACtB,CAAC,AACD,4BAAa,CAAC,4BAA4B,CAAC,iCAAkB,OAAO,AAAC,CAAC,AACpE,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAC3B,gBAAgB,CAAE,KAAK,CACvB,OAAO,CAAE,EAAE,CACX,GAAG,CAAE,IAAI,CACT,OAAO,CAAE,KAAK,CACd,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,4BAAa,CAAC,4BAA4B,CAAC,iCAAkB,MAAM,AAAC,CAAC,AACnE,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAC3B,gBAAgB,CAAE,KAAK,CACvB,OAAO,CAAE,EAAE,CACX,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,KAAK,CACd,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,IAAI,AACf,CAAC,AACD,4BAAa,QAAQ,CAAG,aAAa,eAAC,CAAC,AACrC,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,aAAa,QAAQ,CAAG,4BAAa,CAAC,kBAAkB,eAAC,CAAC,AACxD,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AACD,aAAa,QAAQ,CAAG,4BAAa,CAAC,iCAAkB,OAAO,AAAC,CAAC,AAC/D,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,CAAC,CACV,gBAAgB,CAAE,KAAK,CACvB,SAAS,CAAE,OAAO,KAAK,CAAC,CACxB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,AACnC,CAAC,AACD,aAAa,QAAQ,CAAG,4BAAa,CAAC,iCAAkB,MAAM,AAAC,CAAC,AAC9D,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,CAAC,CACV,gBAAgB,CAAE,KAAK,CACvB,SAAS,CAAE,OAAO,MAAM,CAAC,CACzB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,AACnC,CAAC,AACD,4BAAa,QAAQ,CAAG,oBAAoB,eAAC,CAAC,AAC5C,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,CAAC,CACP,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,yBAAyB,eAAC,CAAC,AACtE,OAAO,CAAE,IAAI,CAAC,GAAG,CACjB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,wCAAyB,QAAQ,AAAC,CAAC,AAC9E,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,GAAG,CACZ,eAAe,CAAE,KAAK,CACtB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,iBAAiB,CAAE,SAAS,CAC5B,mBAAmB,CAAE,MAAM,CAAC,MAAM,AACpC,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,wCAAyB,mBAAmB,AAAC,CAAC,AACzF,OAAO,CAAE,IAAI,AACf,CAAC,AACD,aAAa,QAAQ,CAAG,mCAAoB,CAAC,yBAAyB,CAAC,iBAAE,WAAW,KAAK,CAAC,AAAC,CAAC,AAC1F,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,CAAC,IAAI,CAC7B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAClC,CAAC,AACD,4BAAa,QAAQ,CAAG,YAAY,eAAC,CAAC,AACpC,QAAQ,CAAE,KAAK,CACf,UAAU,CAAE,KAAK,CACjB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,IAAI,CACjB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AAED,oBAAoB,8BAAC,CAAC,AACpB,QAAQ,CAAE,QAAQ,CAClB,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACjC,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,MAAM,CACZ,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,mCAAoB,CAAC,yBAAyB,eAAC,CAAC,AAC9C,OAAO,CAAE,IAAI,CAAC,GAAG,CACjB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,mCAAoB,CAAC,wCAAyB,QAAQ,AAAC,CAAC,AACtD,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,GAAG,CACZ,eAAe,CAAE,KAAK,CACtB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,iBAAiB,CAAE,SAAS,CAC5B,mBAAmB,CAAE,MAAM,CAAC,MAAM,AACpC,CAAC,AACD,mCAAoB,CAAC,wCAAyB,mBAAmB,AAAC,CAAC,AACjE,OAAO,CAAE,IAAI,AACf,CAAC,AACD,mCAAoB,CAAC,yBAAyB,CAAC,iBAAE,WAAW,KAAK,CAAC,AAAC,CAAC,AAClE,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,GAAG,IAAI,CAAE,IAAI,CACb,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,CAAC,IAAI,CAC7B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAClC,CAAC,AAED,uBAAuB,8BAAC,CAAC,AACvB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,sCAAuB,CAAC,GAAG,eAAC,CAAC,AAC3B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACnB,CAAC"}`
};
const Hamburger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_pagePositions;
  $$unsubscribe_pagePositions = subscribe(pagePositions, (value) => value);
  let mainInput;
  $$result.css.add(css$m);
  $$unsubscribe_pagePositions();
  return `<div><input type="${"checkbox"}" id="${"burger-trigger"}" class="${"burger-input svelte-1vckazx"}"${add_attribute("this", mainInput, 0)}>
	<label for="${"burger-trigger"}" class="${"burger-label svelte-1vckazx"}"><span class="${"main-trigger-icon-container svelte-1vckazx"}"><i class="${"main-trigger-icon svelte-1vckazx"}"></i></span></label>
	<div class="${"side-menu-container svelte-1vckazx"}"><ul name="${"list-container"}" class="${"side-menu-item-container svelte-1vckazx"}">${each(navButtons, (label, i) => `<li class="${"svelte-1vckazx"}">${escape(label)}
				</li>`)}</ul>
		<div class="${"sidebar-logo-container svelte-1vckazx"}"><a href="${"https://www.apeldesign.com/"}"><img src="${"By Apel Design Black.png"}" alt="${""}" class="${"svelte-1vckazx"}"></a></div></div>

	<div data-id="${"header-mask"}" class="${"header-mask svelte-1vckazx"}"></div>
</div>`;
});
var Navbar_svelte_svelte_type_style_lang = "";
const css$l = {
  code: '.wrapper.svelte-1j3w4u1.svelte-1j3w4u1{width:100vw;position:fixed;z-index:3;pointer-events:none}.container.svelte-1j3w4u1.svelte-1j3w4u1{color:white;display:flex;justify-content:space-between;align-items:center;font-family:"Orator";padding:20px 40px;font-weight:100}.container.svelte-1j3w4u1 .left-container.svelte-1j3w4u1{display:flex;pointer-events:all;align-items:center}.container.svelte-1j3w4u1 .logo-container.svelte-1j3w4u1{max-width:12em;height:66px;pointer-events:all}.container.svelte-1j3w4u1 .logo-container img.svelte-1j3w4u1{width:100%;object-fit:cover}@media(max-width: 650px){.secondary-main-trigger-icon.svelte-1j3w4u1.svelte-1j3w4u1{display:none}.logo.svelte-1j3w4u1.svelte-1j3w4u1{display:none}}.nav-menu-label.svelte-1j3w4u1.svelte-1j3w4u1{display:flex;align-items:center}.nav-menu-label.svelte-1j3w4u1 .secondary-main-trigger-icon.svelte-1j3w4u1{font-size:18px;margin-left:9px;line-height:18px;cursor:pointer;line-height:20px;margin-top:-2px;margin-bottom:-1px;text-transform:uppercase;font-family:Orator;height:fit-content}',
  map: `{"version":3,"file":"Navbar.svelte","sources":["Navbar.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport Hamburger from '../Hamburger/Hamburger.svelte';\\r\\n<\/script>\\r\\n\\r\\n<nav class=\\"wrapper\\">\\r\\n\\t<div class=\\"container\\">\\r\\n\\t\\t<div class=\\"left-container\\">\\r\\n\\t\\t\\t<Hamburger />\\r\\n\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t<label class=\\"nav-menu-label\\" for=\\"burger-trigger\\">\\r\\n\\t\\t\\t\\t\\t<p class=\\"secondary-main-trigger-icon\\">menu</p>\\r\\n\\t\\t\\t\\t</label>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\r\\n\\t\\t<div class=\\"logo-container\\">\\r\\n\\t\\t\\t<a\\r\\n\\t\\t\\t\\ton:click=\\"{(e) => {\\r\\n\\t\\t\\t\\t\\te.preventDefault();\\r\\n\\t\\t\\t\\t\\twindow.open('https://www.apeldesign.com/');\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\thref=\\"https://www.apeldesign.com/\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t<img class=\\"logo\\" src=\\"By Apel Design White.png\\" alt=\\"\\" />\\r\\n\\t\\t\\t</a>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</nav>\\r\\n\\r\\n<style lang=\\"scss\\">.wrapper {\\n  width: 100vw;\\n  position: fixed;\\n  z-index: 3;\\n  pointer-events: none;\\n}\\n\\n.container {\\n  color: white;\\n  display: flex;\\n  justify-content: space-between;\\n  align-items: center;\\n  font-family: \\"Orator\\";\\n  padding: 20px 40px;\\n  font-weight: 100;\\n}\\n.container .left-container {\\n  display: flex;\\n  pointer-events: all;\\n  align-items: center;\\n}\\n.container .logo-container {\\n  max-width: 12em;\\n  height: 66px;\\n  pointer-events: all;\\n}\\n.container .logo-container img {\\n  width: 100%;\\n  object-fit: cover;\\n}\\n\\n@media (max-width: 650px) {\\n  .secondary-main-trigger-icon {\\n    display: none;\\n  }\\n\\n  .logo {\\n    display: none;\\n  }\\n}\\n.nav-menu-label {\\n  display: flex;\\n  align-items: center;\\n}\\n.nav-menu-label .secondary-main-trigger-icon {\\n  font-size: 18px;\\n  margin-left: 9px;\\n  line-height: 18px;\\n  cursor: pointer;\\n  line-height: 20px;\\n  margin-top: -2px;\\n  margin-bottom: -1px;\\n  text-transform: uppercase;\\n  font-family: Orator;\\n  height: fit-content;\\n}</style>\\r\\n"],"names":[],"mappings":"AA6BmB,QAAQ,8BAAC,CAAC,AAC3B,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,CAAC,CACV,cAAc,CAAE,IAAI,AACtB,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,WAAW,CAAE,QAAQ,CACrB,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,yBAAU,CAAC,eAAe,eAAC,CAAC,AAC1B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,yBAAU,CAAC,eAAe,eAAC,CAAC,AAC1B,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,IAAI,CACZ,cAAc,CAAE,GAAG,AACrB,CAAC,AACD,yBAAU,CAAC,eAAe,CAAC,GAAG,eAAC,CAAC,AAC9B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,4BAA4B,8BAAC,CAAC,AAC5B,OAAO,CAAE,IAAI,AACf,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AACD,eAAe,8BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,8BAAe,CAAC,4BAA4B,eAAC,CAAC,AAC5C,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,IAAI,CACjB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,IAAI,CACnB,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,WAAW,AACrB,CAAC"}`
};
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$l);
  return `<nav class="${"wrapper svelte-1j3w4u1"}"><div class="${"container svelte-1j3w4u1"}"><div class="${"left-container svelte-1j3w4u1"}">${validate_component(Hamburger, "Hamburger").$$render($$result, {}, {}, {})}
			<div><label class="${"nav-menu-label svelte-1j3w4u1"}" for="${"burger-trigger"}"><p class="${"secondary-main-trigger-icon svelte-1j3w4u1"}">menu</p></label></div></div>

		<div class="${"logo-container svelte-1j3w4u1"}"><a href="${"https://www.apeldesign.com/"}"><img class="${"logo svelte-1j3w4u1"}" src="${"By Apel Design White.png"}" alt="${""}"></a></div></div>
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
const css$k = {
  code: ".container.svelte-l6eggz{position:fixed;z-index:3;right:40px;bottom:25px;width:15px;height:auto;display:flex;flex-direction:column;gap:18px;opacity:60%;object-fit:cover}",
  map: '{"version":3,"file":"Socials.svelte","sources":["Socials.svelte"],"sourcesContent":["<script>\\r\\n  import Facebook from \\"./Facebook/Facebook.svelte\\";\\r\\n  import Instagram from \\"./Instagram/Instagram.svelte\\";\\r\\n  import Linkedin from \\"./Linkedin/Linkedin.svelte\\";\\r\\n  import Twitter from \\"./Twitter/Twitter.svelte\\";\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"container\\">\\r\\n  <a\\r\\n    on:click={(e) => {\\r\\n      e.preventDefault();\\r\\n      window.open(\\"https://www.facebook.com/apeldesign/\\");\\r\\n    }}\\r\\n    href=\\"https://www.facebook.com/apeldesign/\\"\\r\\n  >\\r\\n    <Facebook />\\r\\n  </a>\\r\\n  <a\\r\\n    on:click={(e) => {\\r\\n      e.preventDefault();\\r\\n      window.open(\\"https://www.instagram.com/apeldesigninc/\\");\\r\\n    }}\\r\\n    href=\\"https://www.instagram.com/apeldesigninc/\\"><Instagram /></a\\r\\n  >\\r\\n  <a\\r\\n    on:click={(e) => {\\r\\n      e.preventDefault();\\r\\n      window.open(\\"https://www.linkedin.com/in/amit-apel-05373727\\");\\r\\n    }}\\r\\n    href=\\"https://www.linkedin.com/in/amit-apel-05373727\\"\\r\\n  >\\r\\n    <Linkedin /></a\\r\\n  >\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  position: fixed;\\n  z-index: 3;\\n  right: 40px;\\n  bottom: 25px;\\n  width: 15px;\\n  height: auto;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 18px;\\n  opacity: 60%;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmCmB,UAAU,cAAC,CAAC,AAC7B,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,CACT,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC"}'
};
const Socials = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$k);
  return `<div class="${"container svelte-l6eggz"}"><a href="${"https://www.facebook.com/apeldesign/"}">${validate_component(Facebook, "Facebook").$$render($$result, {}, {}, {})}</a>
  <a href="${"https://www.instagram.com/apeldesigninc/"}">${validate_component(Instagram, "Instagram").$$render($$result, {}, {}, {})}</a>
  <a href="${"https://www.linkedin.com/in/amit-apel-05373727"}">${validate_component(Linkedin, "Linkedin").$$render($$result, {}, {}, {})}</a>
</div>`;
});
var global = "";
var bulma_prefixed = "";
var Arrow_svelte_svelte_type_style_lang = "";
const css$j = {
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
  $$result.css.add(css$j);
  return `


<svg class="${"arrow " + escape(showMore ? "rotate" : "") + " svelte-1d2wgtf"}" version="${"1.1"}"${add_attribute("style", styleP, 0)} id="${"Layer_1"}" xmlns="${"http://www.w3.org/2000/svg"}" xmlns:xlink="${"http://www.w3.org/1999/xlink"}" x="${"0px"}" y="${"0px"}" viewBox="${"0 0 330 330"}" xml:space="${"preserve"}"><path id="${"XMLID_224_"}" d="${"M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394\r\n	l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393\r\n	C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z"}"></path><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>`;
});
var CarouselThumbs_svelte_svelte_type_style_lang = "";
const css$i = {
  code: ".selected.svelte-1o8acu1.svelte-1o8acu1{border:1px solid white}.image-container.svelte-1o8acu1.svelte-1o8acu1{width:25px;height:25px;border-radius:50%;overflow:hidden}.image-container.svelte-1o8acu1 img.svelte-1o8acu1{width:100%;height:100%;object-fit:cover;object-position:center center}.container.svelte-1o8acu1.svelte-1o8acu1{display:flex;margin:-7.5px}.container.svelte-1o8acu1 .image-container.svelte-1o8acu1{margin:7.5px}",
  map: `{"version":3,"file":"CarouselThumbs.svelte","sources":["CarouselThumbs.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\r\\n\\timport { lazyLoadInstance } from '../../lazy';\\r\\n\\r\\n\\timport { currentPage, pageLayout } from '../../stores';\\r\\n\\timport { createEventDispatcher } from 'svelte';\\r\\n\\texport let page;\\r\\n\\tconst dispatch = createEventDispatcher();\\r\\n\\tconst images = pageLayout['carousel-renders'][0].thumbs;\\r\\n\\tlet imagesToDisplay = images\\r\\n\\t\\t.map((img, i) => {\\r\\n\\t\\t\\tconst obj = {\\r\\n\\t\\t\\t\\turl: img.url,\\r\\n\\t\\t\\t\\tpage: i < 7 ? 'left' : 'right',\\r\\n\\t\\t\\t\\tindex: i\\r\\n\\t\\t\\t};\\r\\n\\t\\t\\treturn obj;\\r\\n\\t\\t})\\r\\n\\t\\t.filter((img) => {\\r\\n\\t\\t\\treturn img.page === page;\\r\\n\\t\\t});\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tlazyLoadInstance();\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n\\tstyle=\\"padding:{page === 'left' ? '25px 7.5px 0px 0px' : '25px 0px 0px 7.5px'};\\r\\n    float:{page === 'left' ? 'right' : 'left'};\\r\\n    \\"\\r\\n\\tclass=\\"container\\"\\r\\n>\\r\\n\\t{#each imagesToDisplay as img, i}\\r\\n\\t\\t{#if img}\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\tdispatch('carousel-page', page === 'left' ? i : i + 7);\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\tclass:selected=\\"{$currentPage.page === img.index}\\"\\r\\n\\t\\t\\t\\tclass=\\"image-container\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t<img class=\\"lazy\\" width=\\"200px\\" height=\\"200px\\" data-src=\\"{img.url}\\" alt=\\"\\" />;\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{:else}\\r\\n\\t\\t\\t<div style=\\"background-color:black\\" class=\\"image-container\\"></div>\\r\\n\\t\\t{/if}\\r\\n\\t{/each}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.selected {\\n  border: 1px solid white;\\n}\\n\\n.image-container {\\n  width: 25px;\\n  height: 25px;\\n  border-radius: 50%;\\n  overflow: hidden;\\n}\\n.image-container img {\\n  width: 100%;\\n  height: 100%;\\n  object-fit: cover;\\n  object-position: center center;\\n}\\n\\n.container {\\n  display: flex;\\n  margin: -7.5px;\\n}\\n.container .image-container {\\n  margin: 7.5px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmDmB,SAAS,8BAAC,CAAC,AAC5B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AACzB,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,+BAAgB,CAAC,GAAG,eAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,eAAe,CAAE,MAAM,CAAC,MAAM,AAChC,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,MAAM,AAChB,CAAC,AACD,yBAAU,CAAC,gBAAgB,eAAC,CAAC,AAC3B,MAAM,CAAE,KAAK,AACf,CAAC"}`
};
const CarouselThumbs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentPage, $$unsubscribe_currentPage;
  $$unsubscribe_currentPage = subscribe(currentPage, (value) => $currentPage = value);
  let { page } = $$props;
  createEventDispatcher();
  const images2 = pageLayout["carousel-renders"][0].thumbs;
  let imagesToDisplay = images2.map((img, i) => {
    const obj = {
      url: img.url,
      page: i < 7 ? "left" : "right",
      index: i
    };
    return obj;
  }).filter((img) => {
    return img.page === page;
  });
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$i);
  $$unsubscribe_currentPage();
  return `<div style="${"padding:" + escape(page === "left" ? "25px 7.5px 0px 0px" : "25px 0px 0px 7.5px") + "; float:" + escape(page === "left" ? "right" : "left") + ";"}" class="${"container svelte-1o8acu1"}">${each(imagesToDisplay, (img, i) => `${img ? `<div class="${[
    "image-container svelte-1o8acu1",
    $currentPage.page === img.index ? "selected" : ""
  ].join(" ").trim()}"><img class="${"lazy svelte-1o8acu1"}" width="${"200px"}" height="${"200px"}"${add_attribute("data-src", img.url, 0)} alt="${""}">;
			</div>` : `<div style="${"background-color:black"}" class="${"image-container svelte-1o8acu1"}"></div>`}`)}
</div>`;
});
var CarouselRenders_svelte_svelte_type_style_lang = "";
const css$h = {
  code: ".indicator.svelte-1g7h3l7.svelte-1g7h3l7{top:5px;z-index:4;font-weight:600;text-align:center;letter-spacing:0.2em;right:5px;position:absolute;padding:5px 15px;border-radius:14px;background-color:black;color:white;display:flex;justify-content:center}.indicator.svelte-1g7h3l7 p.svelte-1g7h3l7{margin-right:-0.2em}.title-container.svelte-1g7h3l7.svelte-1g7h3l7{text-align:right;color:white}.title-container.svelte-1g7h3l7 h1.svelte-1g7h3l7{font-size:3em;text-transform:uppercase;font-family:Orator;color:white}.title-left.svelte-1g7h3l7.svelte-1g7h3l7{padding:20px 0 20px 20px}.title-right.svelte-1g7h3l7.svelte-1g7h3l7{text-align:left;padding:20px 20px 20px 0px}.content-container.svelte-1g7h3l7.svelte-1g7h3l7{display:flex;height:100vh;overflow:hidden;flex-direction:column;align-items:flex-end;justify-content:center}.content-container-left.svelte-1g7h3l7.svelte-1g7h3l7{padding:10px 0 10px 30px}.content-container-right.svelte-1g7h3l7.svelte-1g7h3l7{padding:10px 30px 10px 0px;align-items:flex-start}.carousel-content-container.svelte-1g7h3l7.svelte-1g7h3l7{max-width:38vw;width:100%;height:100%;align-items:flex-end;display:flex;flex-direction:column;justify-content:center}.carousel-content-container-right.svelte-1g7h3l7.svelte-1g7h3l7{align-items:flex-start}.slide-image-container.svelte-1g7h3l7.svelte-1g7h3l7{position:relative;width:100%;height:100%}.slide-image-container.svelte-1g7h3l7 img.svelte-1g7h3l7{position:absolute;height:100%;width:100%}.glide__track.svelte-1g7h3l7.svelte-1g7h3l7{height:100%}.page-arrow-container.svelte-1g7h3l7.svelte-1g7h3l7{width:30px;height:30px;position:absolute;left:10px;bottom:0;top:50%;border-radius:50%;background-color:rgba(0, 0, 0, 0.5);border:none;overflow:hidden}.page-arrow-container.svelte-1g7h3l7 .page-arrow-relative.svelte-1g7h3l7{position:absolute;top:0;left:0;bottom:0;padding:5px;margin:auto}.page-arrow-container-right.svelte-1g7h3l7.svelte-1g7h3l7{right:10px;left:auto}.glide__slides.svelte-1g7h3l7.svelte-1g7h3l7{height:100%}.carousel-container.svelte-1g7h3l7.svelte-1g7h3l7{width:100%;height:70vh;display:flex;position:relative}",
  map: `{"version":3,"file":"CarouselRenders.svelte","sources":["CarouselRenders.svelte"],"sourcesContent":["<script>\\r\\n\\timport Glide from '@glidejs/glide';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport { currentPage, pageLayout } from '../../stores';\\r\\n\\timport Arrow from '../Card/Arrow.svelte';\\r\\n\\timport CarouselThumbs from '../CarouselThumbs/CarouselThumbs.svelte';\\r\\n\\r\\n\\texport let page;\\r\\n\\texport let itemIndex;\\r\\n\\tconst left = pageLayout['carousel-renders'][itemIndex].left.sort((a, b) => {\\r\\n\\t\\treturn a.order - b.order;\\r\\n\\t});\\r\\n\\r\\n\\tconst right = pageLayout['carousel-renders'][itemIndex].right.sort((a, b) => {\\r\\n\\t\\treturn a.order - b.order;\\r\\n\\t});\\r\\n\\tconst images = [...left, ...right];\\r\\n\\r\\n\\tlet carousel;\\r\\n\\tlet glide;\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tglide = new Glide(carousel, {\\r\\n\\t\\t\\tdragThreshold: false\\r\\n\\t\\t});\\r\\n\\t\\tglide.mount();\\r\\n\\t});\\r\\n\\r\\n\\t$: {\\r\\n\\t\\tif (glide) {\\r\\n\\t\\t\\tglide.go(\`=\${$currentPage.page}\`);\\r\\n\\t\\t}\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n\\t<div class=\\"content-container content-container-{page}\\">\\r\\n\\t\\t<div class=\\"carousel-content-container carousel-content-container-{page}\\">\\r\\n\\t\\t\\t<div class=\\"title-container title-{page}\\">\\r\\n\\t\\t\\t\\t<h1>{page === 'left' ? 'ren' : 'ders'}</h1>\\r\\n\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t{page === 'left'\\r\\n\\t\\t\\t\\t\\t\\t? 'Browse below for interior and ext'\\r\\n\\t\\t\\t\\t\\t\\t: 'erior renders of Maliview Estates.'}\\r\\n\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"carousel-container\\">\\r\\n\\t\\t\\t\\t{#if glide && page === 'right'}\\r\\n\\t\\t\\t\\t\\t<div class=\\"indicator {page}\\">\\r\\n\\t\\t\\t\\t\\t\\t{#if glide}\\r\\n\\t\\t\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{$currentPage.page + 1}/{images.length / 2}\\r\\n\\t\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t\\t{/if}\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t{/if}\\r\\n\\t\\t\\t\\t<div bind:this=\\"{carousel}\\" data-glide-dir=\\"{\`\${$currentPage.page}\`}\\" class=\\"glide \\">\\r\\n\\t\\t\\t\\t\\t<div class=\\"glide__track\\" data-glide-el=\\"track\\">\\r\\n\\t\\t\\t\\t\\t\\t<ul class=\\"glide__slides\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t{#each page === 'left' ? left : right as img}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<li class=\\"glide__slide\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<div class=\\"slide-image-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t<img loading=\\"lazy\\" class=\\"carousel-image lazy\\" src=\\"{img.url}\\" alt=\\"\\" />\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<button\\r\\n\\t\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\t\\tcurrentPage.setPage(page === 'left' ? -1 : 1);\\r\\n\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t\\tclass=\\"page-arrow-container page-arrow-container-{page}\\"\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t<div class=\\"page-arrow-relative page-arrow-relative\\">\\r\\n\\t\\t\\t\\t\\t\\t<Arrow\\r\\n\\t\\t\\t\\t\\t\\t\\tstyleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate({page === 'left'\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t? '-90deg'\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t: '90deg'}); height:100%; \\"\\r\\n\\t\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</div>\\r\\n\\r\\n\\t\\t\\t<CarouselThumbs\\r\\n\\t\\t\\t\\ton:carousel-page=\\"{(e) => {\\r\\n\\t\\t\\t\\t\\tconst page = e.detail;\\r\\n\\t\\t\\t\\t\\tcurrentPage.update((s) => {\\r\\n\\t\\t\\t\\t\\t\\ts.page = page;\\r\\n\\t\\t\\t\\t\\t\\treturn s;\\r\\n\\t\\t\\t\\t\\t});\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\tpage=\\"{page}\\"\\r\\n\\t\\t\\t/>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.indicator {\\n  top: 5px;\\n  z-index: 4;\\n  font-weight: 600;\\n  text-align: center;\\n  letter-spacing: 0.2em;\\n  right: 5px;\\n  position: absolute;\\n  padding: 5px 15px;\\n  border-radius: 14px;\\n  background-color: black;\\n  color: white;\\n  display: flex;\\n  justify-content: center;\\n}\\n.indicator p {\\n  margin-right: -0.2em;\\n}\\n\\n.title-container {\\n  text-align: right;\\n  color: white;\\n}\\n.title-container h1 {\\n  font-size: 3em;\\n  text-transform: uppercase;\\n  font-family: Orator;\\n  color: white;\\n}\\n\\n.title-left {\\n  padding: 20px 0 20px 20px;\\n}\\n\\n.title-right {\\n  text-align: left;\\n  padding: 20px 20px 20px 0px;\\n}\\n\\n.content-container {\\n  display: flex;\\n  height: 100vh;\\n  overflow: hidden;\\n  flex-direction: column;\\n  align-items: flex-end;\\n  justify-content: center;\\n}\\n\\n.content-container-left {\\n  padding: 10px 0 10px 30px;\\n}\\n\\n.content-container-right {\\n  padding: 10px 30px 10px 0px;\\n  align-items: flex-start;\\n}\\n\\n.carousel-content-container {\\n  max-width: 38vw;\\n  width: 100%;\\n  height: 100%;\\n  align-items: flex-end;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n}\\n\\n.carousel-content-container-right {\\n  align-items: flex-start;\\n}\\n\\n.slide-image-container {\\n  position: relative;\\n  width: 100%;\\n  height: 100%;\\n}\\n.slide-image-container img {\\n  position: absolute;\\n  height: 100%;\\n  width: 100%;\\n}\\n\\n.glide__track {\\n  height: 100%;\\n}\\n\\n.page-arrow-container {\\n  width: 30px;\\n  height: 30px;\\n  position: absolute;\\n  left: 10px;\\n  bottom: 0;\\n  top: 50%;\\n  border-radius: 50%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: none;\\n  overflow: hidden;\\n}\\n.page-arrow-container .page-arrow-relative {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  bottom: 0;\\n  padding: 5px;\\n  margin: auto;\\n}\\n\\n.page-arrow-container-right {\\n  right: 10px;\\n  left: auto;\\n}\\n\\n.glide__slides {\\n  height: 100%;\\n}\\n\\n.carousel-container {\\n  width: 100%;\\n  height: 70vh;\\n  display: flex;\\n  position: relative;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmGmB,UAAU,8BAAC,CAAC,AAC7B,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,KAAK,CACrB,KAAK,CAAE,GAAG,CACV,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,yBAAU,CAAC,CAAC,eAAC,CAAC,AACZ,YAAY,CAAE,MAAM,AACtB,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,KAAK,AACd,CAAC,AACD,+BAAgB,CAAC,EAAE,eAAC,CAAC,AACnB,SAAS,CAAE,GAAG,CACd,cAAc,CAAE,SAAS,CACzB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,OAAO,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,AAC3B,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,GAAG,AAC7B,CAAC,AAED,kBAAkB,8BAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,CACb,QAAQ,CAAE,MAAM,CAChB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,QAAQ,CACrB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,uBAAuB,8BAAC,CAAC,AACvB,OAAO,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,AAC3B,CAAC,AAED,wBAAwB,8BAAC,CAAC,AACxB,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,GAAG,CAC3B,WAAW,CAAE,UAAU,AACzB,CAAC,AAED,2BAA2B,8BAAC,CAAC,AAC3B,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,QAAQ,CACrB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,iCAAiC,8BAAC,CAAC,AACjC,WAAW,CAAE,UAAU,AACzB,CAAC,AAED,sBAAsB,8BAAC,CAAC,AACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,qCAAsB,CAAC,GAAG,eAAC,CAAC,AAC1B,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,AACb,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,MAAM,CAAE,IAAI,AACd,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,IAAI,CACV,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,GAAG,CACR,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,oCAAqB,CAAC,oBAAoB,eAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AAED,2BAA2B,8BAAC,CAAC,AAC3B,KAAK,CAAE,IAAI,CACX,IAAI,CAAE,IAAI,AACZ,CAAC,AAED,cAAc,8BAAC,CAAC,AACd,MAAM,CAAE,IAAI,AACd,CAAC,AAED,mBAAmB,8BAAC,CAAC,AACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,AACpB,CAAC"}`
};
const CarouselRenders = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentPage, $$unsubscribe_currentPage;
  $$unsubscribe_currentPage = subscribe(currentPage, (value) => $currentPage = value);
  let { page } = $$props;
  let { itemIndex } = $$props;
  const left = pageLayout["carousel-renders"][itemIndex].left.sort((a, b) => {
    return a.order - b.order;
  });
  const right = pageLayout["carousel-renders"][itemIndex].right.sort((a, b) => {
    return a.order - b.order;
  });
  [...left, ...right];
  let carousel;
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.itemIndex === void 0 && $$bindings.itemIndex && itemIndex !== void 0)
    $$bindings.itemIndex(itemIndex);
  $$result.css.add(css$h);
  $$unsubscribe_currentPage();
  return `<div class="${"page"}"><div class="${"content-container content-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"carousel-content-container carousel-content-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"title-container title-" + escape(page) + " svelte-1g7h3l7"}"><h1 class="${"svelte-1g7h3l7"}">${escape(page === "left" ? "ren" : "ders")}</h1>
				<p class="${"svelte-1g7h3l7"}">${escape(page === "left" ? "Browse below for interior and ext" : "erior renders of Maliview Estates.")}</p></div>
			<div class="${"carousel-container svelte-1g7h3l7"}">${``}
				<div${add_attribute("data-glide-dir", `${$currentPage.page}`, 0)} class="${"glide "}"${add_attribute("this", carousel, 0)}><div class="${"glide__track svelte-1g7h3l7"}" data-glide-el="${"track"}"><ul class="${"glide__slides svelte-1g7h3l7"}">${each(page === "left" ? left : right, (img) => `<li class="${"glide__slide"}"><div class="${"slide-image-container svelte-1g7h3l7"}"><img loading="${"lazy"}" class="${"carousel-image lazy svelte-1g7h3l7"}"${add_attribute("src", img.url, 0)} alt="${""}"></div>
								</li>`)}</ul></div></div>
				<button class="${"page-arrow-container page-arrow-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"page-arrow-relative page-arrow-relative svelte-1g7h3l7"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(" + (page === "left" ? "-90deg" : "90deg") + "); height:100%; "
  }, {}, {})}</div></button></div>

			${validate_component(CarouselThumbs, "CarouselThumbs").$$render($$result, { page }, {}, {})}</div></div>
</div>`;
});
var ContactUs_svelte_svelte_type_style_lang = "";
const css$g = {
  code: ".success-message.svelte-15wztcz.svelte-15wztcz{color:white}.bu-button.svelte-15wztcz.svelte-15wztcz{background-color:#a4632e}.form-container.svelte-15wztcz.svelte-15wztcz{width:100%;max-width:500px}.form-container.svelte-15wztcz .bu-field.svelte-15wztcz{margin:15px}.form-container.svelte-15wztcz .bu-field .svelte-15wztcz::placeholder{color:black;font-size:0.8em;opacity:0.5}.container.svelte-15wztcz.svelte-15wztcz{width:100%;height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column}h5.svelte-15wztcz.svelte-15wztcz{text-transform:uppercase;color:white;font-family:Orator}",
  map: `{"version":3,"file":"ContactUs.svelte","sources":["ContactUs.svelte"],"sourcesContent":["<script>\\r\\n  let form;\\r\\n  let submitted = false;\\r\\n  const handleSubmit = (e) => {\\r\\n    e.preventDefault();\\r\\n\\r\\n    let formData = new FormData(form);\\r\\n    fetch(\\"/\\", {\\r\\n      method: \\"POST\\",\\r\\n      headers: { \\"Content-Type\\": \\"application/x-www-form-urlencoded\\" },\\r\\n      body: new URLSearchParams(formData).toString(),\\r\\n    })\\r\\n      .then(() => {\\r\\n        submitted = true;\\r\\n      })\\r\\n      .catch((error) => alert(error));\\r\\n  };\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"container\\">\\r\\n  <h5 class=\\"bu-is-size-1\\">contact</h5>\\r\\n  {#if !submitted}<form\\r\\n      bind:this={form}\\r\\n      name=\\"emailForm\\"\\r\\n      data-netlify=\\"true\\"\\r\\n      class=\\"form-container\\"\\r\\n    >\\r\\n      <input type=\\"hidden\\" name=\\"form-name\\" value=\\"emailForm\\" />\\r\\n\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"name-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"text\\"\\r\\n            name=\\"name\\"\\r\\n            placeholder=\\"Name\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"email-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"email\\"\\r\\n            name=\\"email\\"\\r\\n            placeholder=\\"Email\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"country-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"text\\"\\r\\n            name=\\"country\\"\\r\\n            placeholder=\\"Country\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            id=\\"phone-input\\"\\r\\n            class=\\"bu-input\\"\\r\\n            type=\\"phone\\"\\r\\n            name=\\"phone\\"\\r\\n            placeholder=\\"Phone\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <textarea\\r\\n            id=\\"message-input\\"\\r\\n            class=\\"bu-textarea\\"\\r\\n            type=\\"text\\"\\r\\n            name=\\"message\\"\\r\\n            placeholder=\\"Message\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n      <div class=\\"bu-field\\">\\r\\n        <div class=\\"bu-control\\">\\r\\n          <input\\r\\n            on:click={handleSubmit}\\r\\n            type=\\"submit\\"\\r\\n            class=\\"bu-button bu-is-link bu-is-fullwidth\\"\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n    </form>\\r\\n  {:else}\\r\\n    <p class=\\"success-message\\">Thanks! We'll get back to you shortly.</p>\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.success-message {\\n  color: white;\\n}\\n\\n.bu-button {\\n  background-color: #a4632e;\\n}\\n\\n.form-container {\\n  width: 100%;\\n  max-width: 500px;\\n}\\n.form-container .bu-field {\\n  margin: 15px;\\n}\\n.form-container .bu-field ::placeholder {\\n  /* Chrome, Firefox, Opera, Safari 10.1+ */\\n  color: black;\\n  font-size: 0.8em;\\n  opacity: 0.5;\\n  /* Firefox */\\n}\\n\\n.container {\\n  width: 100%;\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n  flex-direction: column;\\n}\\n\\nh5 {\\n  text-transform: uppercase;\\n  color: white;\\n  font-family: Orator;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmGmB,gBAAgB,8BAAC,CAAC,AACnC,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,8BAAe,CAAC,SAAS,eAAC,CAAC,AACzB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,8BAAe,CAAC,SAAS,gBAAC,aAAa,AAAC,CAAC,AAEvC,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,GAAG,AAEd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,cAAc,CAAE,MAAM,AACxB,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,cAAc,CAAE,SAAS,CACzB,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,MAAM,AACrB,CAAC"}`
};
const ContactUs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let form;
  $$result.css.add(css$g);
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
const css$f = {
  code: '.container.svelte-y4i8f3.svelte-y4i8f3{width:50vw;height:100vh;display:flex;align-items:center;gap:2rem;color:white;font-family:Orator;overflow:hidden}.sub-container.svelte-y4i8f3.svelte-y4i8f3{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center}.title-container.svelte-y4i8f3.svelte-y4i8f3{width:100%;height:15%;margin-bottom:20px;display:flex;position:relative;font-size:3em}.svelte-y4i8f3.svelte-y4i8f3::-webkit-scrollbar{width:20px}.svelte-y4i8f3.svelte-y4i8f3::-webkit-scrollbar-track{background-color:transparent}.svelte-y4i8f3.svelte-y4i8f3::-webkit-scrollbar-thumb{background-color:#d6dee1;border-radius:20px;border:6px solid transparent;background-clip:content-box}.content-container.svelte-y4i8f3.svelte-y4i8f3{display:flex;overflow-y:auto;justify-content:center;align-items:center;width:fit-content;padding:10px;height:60%}.content-container.svelte-y4i8f3 .credits-container-sub.svelte-y4i8f3{height:100%}.content-container.svelte-y4i8f3 .credits-container.svelte-y4i8f3{font-size:1.3em;opacity:0;text-align:center;margin-bottom:1rem}.content-container.svelte-y4i8f3 .credits-container h5.svelte-y4i8f3{font-size:1em;margin-bottom:20px}@media(max-width: 1040px){.content-container.svelte-y4i8f3 .credits-container h5.svelte-y4i8f3{margin-bottom:10px;font-size:0.7em}}.content-container.svelte-y4i8f3 .credits-container p.svelte-y4i8f3{font-family:"Roboto", sans-serif;font-size:0.8em}@media(max-width: 1270px){.content-container.svelte-y4i8f3 .credits-container p.svelte-y4i8f3{font-size:0.6em}}',
  map: `{"version":3,"file":"Credits.svelte","sources":["Credits.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\r\\n\\timport { creditsContent } from '../../pageContent';\\r\\n\\timport { pagePositions, scrollContainers } from '../../stores';\\r\\n\\r\\n\\texport let page;\\r\\n\\tlet scrollContainer;\\r\\n\\tconst disableWheel = (e) => {\\r\\n\\t\\te.stopImmediatePropagation();\\r\\n\\t};\\r\\n\\tonMount(() => {\\r\\n\\t\\tscrollContainers.push(scrollContainer);\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n\\t<div\\r\\n\\t\\tclass=\\"container\\"\\r\\n\\t\\tstyle=\\"\\r\\n        justify-content: {page === 'left' ? 'flex-end' : 'flex-start'}\\r\\n      \\"\\r\\n\\t>\\r\\n\\t\\t<div style=\\"align-items:{page === 'left' ? 'flex-end' : 'flex-start'}\\" class=\\"sub-container\\">\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\tclass=\\"title-container\\"\\r\\n\\t\\t\\t\\tstyle=\\"\\r\\n        justify-content: {page === 'left' ? 'flex-end' : 'flex-start'}\\r\\n      \\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t{#if page === 'left'}<div class=\\"title-text-container\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>Developmen</h5>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t{:else}<div class=\\"title-text-container\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>t Credits</h5>\\r\\n\\t\\t\\t\\t\\t</div>{/if}\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\tbind:this={scrollContainer}\\r\\n\\t\\t\\t\\ton:scroll={(e) => {\\r\\n\\t\\t\\t\\t\\twindow.addEventListener('wheel', disableWheel);\\r\\n\\t\\t\\t\\t\\twindow.removeEventListener('wheel', disableWheel);\\r\\n\\t\\t\\t\\t}}\\r\\n\\t\\t\\t\\tclass=\\"content-container\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t{#if page === 'left'}\\r\\n\\t\\t\\t\\t\\t<div class=\\"credits-container-sub\\">\\r\\n\\t\\t\\t\\t\\t\\t{#each creditsContent.slice(0, 2) as credit}\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"credits-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<h5 class=\\"header\\">{credit.header}</h5>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{#each credit.paragraphs as p}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<p>{p}</p>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t{:else}<div class=\\"credits-container-sub\\">\\r\\n\\t\\t\\t\\t\\t\\t{#each creditsContent.slice(2, 6) as credit}\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"credits-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<h5 class=\\"header\\">{credit.header}</h5>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{#each credit.paragraphs as p}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<p>{p}</p>\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t</div>{/if}\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  width: 50vw;\\n  height: 100vh;\\n  display: flex;\\n  align-items: center;\\n  gap: 2rem;\\n  color: white;\\n  font-family: Orator;\\n  overflow: hidden;\\n}\\n\\n.sub-container {\\n  width: 100%;\\n  height: 100%;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n}\\n\\n.title-container {\\n  width: 100%;\\n  height: 15%;\\n  margin-bottom: 20px;\\n  display: flex;\\n  position: relative;\\n  font-size: 3em;\\n}\\n.title-container img {\\n  object-fit: contain;\\n  width: 100%;\\n}\\n\\n::-webkit-scrollbar {\\n  width: 20px;\\n}\\n\\n::-webkit-scrollbar-track {\\n  background-color: transparent;\\n}\\n\\n::-webkit-scrollbar-thumb {\\n  background-color: #d6dee1;\\n  border-radius: 20px;\\n  border: 6px solid transparent;\\n  background-clip: content-box;\\n}\\n\\n.content-container {\\n  display: flex;\\n  overflow-y: auto;\\n  justify-content: center;\\n  align-items: center;\\n  width: fit-content;\\n  padding: 10px;\\n  height: 60%;\\n}\\n.content-container .credits-container-sub {\\n  height: 100%;\\n}\\n.content-container .credits-container {\\n  font-size: 1.3em;\\n  opacity: 0;\\n  text-align: center;\\n  margin-bottom: 1rem;\\n}\\n.content-container .credits-container h5 {\\n  font-size: 1em;\\n  margin-bottom: 20px;\\n}\\n@media (max-width: 1040px) {\\n  .content-container .credits-container h5 {\\n    margin-bottom: 10px;\\n    font-size: 0.7em;\\n  }\\n}\\n.content-container .credits-container p {\\n  font-family: \\"Roboto\\", sans-serif;\\n  font-size: 0.8em;\\n}\\n@media (max-width: 1270px) {\\n  .content-container .credits-container p {\\n    font-size: 0.6em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAuEmB,UAAU,4BAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,gBAAgB,4BAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,GAAG,AAChB,CAAC,4BAMD,mBAAmB,AAAC,CAAC,AACnB,KAAK,CAAE,IAAI,AACb,CAAC,4BAED,yBAAyB,AAAC,CAAC,AACzB,gBAAgB,CAAE,WAAW,AAC/B,CAAC,4BAED,yBAAyB,AAAC,CAAC,AACzB,gBAAgB,CAAE,OAAO,CACzB,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAC7B,eAAe,CAAE,WAAW,AAC9B,CAAC,AAED,kBAAkB,4BAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,CAChB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,WAAW,CAClB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,GAAG,AACb,CAAC,AACD,gCAAkB,CAAC,sBAAsB,cAAC,CAAC,AACzC,MAAM,CAAE,IAAI,AACd,CAAC,AACD,gCAAkB,CAAC,kBAAkB,cAAC,CAAC,AACrC,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,MAAM,CAClB,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,gCAAkB,CAAC,kBAAkB,CAAC,EAAE,cAAC,CAAC,AACxC,SAAS,CAAE,GAAG,CACd,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,gCAAkB,CAAC,kBAAkB,CAAC,EAAE,cAAC,CAAC,AACxC,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC,AACD,gCAAkB,CAAC,kBAAkB,CAAC,CAAC,cAAC,CAAC,AACvC,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,gCAAkB,CAAC,kBAAkB,CAAC,CAAC,cAAC,CAAC,AACvC,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC"}`
};
const Credits = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { page } = $$props;
  let scrollContainer;
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$f);
  return `<div class="${"page svelte-y4i8f3"}"><div class="${"container svelte-y4i8f3"}" style="${"justify-content: " + escape(page === "left" ? "flex-end" : "flex-start") + ""}"><div style="${"align-items:" + escape(page === "left" ? "flex-end" : "flex-start")}" class="${"sub-container svelte-y4i8f3"}"><div class="${"title-container svelte-y4i8f3"}" style="${"justify-content: " + escape(page === "left" ? "flex-end" : "flex-start") + ""}">${page === "left" ? `<div class="${"title-text-container svelte-y4i8f3"}"><h5 class="${"svelte-y4i8f3"}">Developmen</h5></div>` : `<div class="${"title-text-container svelte-y4i8f3"}"><h5 class="${"svelte-y4i8f3"}">t Credits</h5></div>`}</div>
			<div class="${"content-container svelte-y4i8f3"}"${add_attribute("this", scrollContainer, 0)}>${page === "left" ? `<div class="${"credits-container-sub svelte-y4i8f3"}">${each(creditsContent.slice(0, 2), (credit) => `<div class="${"credits-container svelte-y4i8f3"}"><h5 class="${"header svelte-y4i8f3"}">${escape(credit.header)}</h5>
								${each(credit.paragraphs, (p) => `<p class="${"svelte-y4i8f3"}">${escape(p)}</p>`)}
							</div>`)}</div>` : `<div class="${"credits-container-sub svelte-y4i8f3"}">${each(creditsContent.slice(2, 6), (credit) => `<div class="${"credits-container svelte-y4i8f3"}"><h5 class="${"header svelte-y4i8f3"}">${escape(credit.header)}</h5>
								${each(credit.paragraphs, (p) => `<p class="${"svelte-y4i8f3"}">${escape(p)}</p>`)}
							</div>`)}</div>`}</div></div></div>
</div>`;
});
var GalleryPreview_svelte_svelte_type_style_lang = "";
const css$e = {
  code: ".image-container.svelte-cfqce8.svelte-cfqce8{height:100%;padding-right:5px}.image-container.svelte-cfqce8 img.svelte-cfqce8{height:100%;object-fit:cover;width:100%}",
  map: '{"version":3,"file":"GalleryPreview.svelte","sources":["GalleryPreview.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n  import { highResBts } from \\"../../pageContent\\";\\r\\n  import { galleryImg } from \\"./store\\";\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n  <div class=\\"image-container\\">\\r\\n    <img loading=\\"lazy\\" src={$galleryImg.imageToDisplay} alt=\\"\\" />\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.image-container {\\n  height: 100%;\\n  padding-right: 5px;\\n}\\n.image-container img {\\n  height: 100%;\\n  object-fit: cover;\\n  width: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AAWmB,gBAAgB,4BAAC,CAAC,AACnC,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,8BAAgB,CAAC,GAAG,cAAC,CAAC,AACpB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,IAAI,AACb,CAAC"}'
};
const GalleryPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  $$result.css.add(css$e);
  $$unsubscribe_galleryImg();
  return `<div class="${"page"}"><div class="${"image-container svelte-cfqce8"}"><img loading="${"lazy"}"${add_attribute("src", $galleryImg.imageToDisplay, 0)} alt="${""}" class="${"svelte-cfqce8"}"></div>
</div>`;
});
var ImagePage_svelte_svelte_type_style_lang = "";
const css$d = {
  code: '.blur.svelte-1aqh5gk.svelte-1aqh5gk{left:0;right:0;z-index:0;position:relative}.blur.svelte-1aqh5gk.svelte-1aqh5gk::before{pointer-events:none;position:absolute;content:"";height:100%;display:block;left:0;right:0;top:0;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)){.blur.svelte-1aqh5gk.svelte-1aqh5gk::before{background:rgba(0, 0, 0, 0.5)}}.image-container.svelte-1aqh5gk.svelte-1aqh5gk{height:100%}.image-container.svelte-1aqh5gk .main-image.svelte-1aqh5gk{width:100%;object-fit:cover;height:100%}.play-button.svelte-1aqh5gk.svelte-1aqh5gk{position:absolute;width:160px;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:auto;z-index:5;object-fit:cover}',
  map: `{"version":3,"file":"ImagePage.svelte","sources":["ImagePage.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { modal, pageLayout } from '../../stores';\\r\\n\\timport { afterUpdate, beforeUpdate, onMount } from 'svelte';\\r\\n\\timport { lazy } from '../../lazy.js';\\r\\n\\texport let index;\\r\\n\\texport let imageInd;\\r\\n\\tconst images = [\\r\\n\\t\\t...pageLayout['image-pages'],\\r\\n\\t\\t{\\r\\n\\t\\t\\ttype: 'images'\\r\\n\\t\\t}\\r\\n\\t];\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n\\ton:click=\\"{() => {\\r\\n\\t\\tif (images[imageInd].type === 'video') {\\r\\n\\t\\t\\t$modal.visibility = true;\\r\\n\\t\\t\\t$modal.content = images[imageInd].videoUrl;\\r\\n\\t\\t\\t$modal.type = 'video';\\r\\n\\t\\t}\\r\\n\\t}}\\"\\r\\n\\tclass=\\"page\\"\\r\\n>\\r\\n\\t<div class=\\"image-container {images[imageInd].type === 'video' ? 'blur' : ''} \\">\\r\\n\\t\\t{#if images[imageInd].type === 'video'}\\r\\n\\t\\t\\t<img alt=\\"\\" src=\\"playButton.png\\" class=\\"play-button\\" />\\r\\n\\t\\t{/if}\\r\\n\\r\\n\\t\\t<img data-src=\\"{images[imageInd].image.url}\\" alt=\\"\\" class=\\"main-image lazy\\" />\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.blur {\\n  left: 0;\\n  right: 0;\\n  z-index: 0;\\n  position: relative;\\n}\\n.blur::before {\\n  pointer-events: none;\\n  position: absolute;\\n  content: \\"\\";\\n  height: 100%;\\n  display: block;\\n  left: 0;\\n  right: 0;\\n  top: 0;\\n  -webkit-backdrop-filter: blur(5px);\\n  backdrop-filter: blur(5px);\\n}\\n@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {\\n  .blur::before {\\n    background: rgba(0, 0, 0, 0.5);\\n  }\\n}\\n\\n.image-container {\\n  height: 100%;\\n}\\n.image-container .main-image {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n}\\n\\n.play-button {\\n  position: absolute;\\n  width: 160px;\\n  position: absolute;\\n  top: 50%;\\n  /* position the top  edge of the element at the middle of the parent */\\n  left: 50%;\\n  /* position the left edge of the element at the middle of the parent */\\n  transform: translate(-50%, -50%);\\n  height: auto;\\n  z-index: 5;\\n  object-fit: cover;\\n}</style>\\r\\n"],"names":[],"mappings":"AAiCmB,KAAK,8BAAC,CAAC,AACxB,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,mCAAK,QAAQ,AAAC,CAAC,AACb,cAAc,CAAE,IAAI,CACpB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,KAAK,CACd,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,GAAG,CAAE,CAAC,CACN,uBAAuB,CAAE,KAAK,GAAG,CAAC,CAClC,eAAe,CAAE,KAAK,GAAG,CAAC,AAC5B,CAAC,AACD,UAAU,GAAG,CAAC,CAAC,CAAC,yBAAyB,IAAI,CAAC,CAAC,EAAE,CAAC,CAAC,iBAAiB,IAAI,CAAC,CAAC,AAAC,CAAC,AAC1E,mCAAK,QAAQ,AAAC,CAAC,AACb,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AAChC,CAAC,AACH,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,+BAAgB,CAAC,WAAW,eAAC,CAAC,AAC5B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CAER,IAAI,CAAE,GAAG,CAET,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,KAAK,AACnB,CAAC"}`
};
const ImagePage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { index: index2 } = $$props;
  let { imageInd } = $$props;
  const images2 = [...pageLayout["image-pages"], { type: "images" }];
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.imageInd === void 0 && $$bindings.imageInd && imageInd !== void 0)
    $$bindings.imageInd(imageInd);
  $$result.css.add(css$d);
  $$unsubscribe_modal();
  return `<div class="${"page"}"><div class="${"image-container " + escape(images2[imageInd].type === "video" ? "blur" : "") + " svelte-1aqh5gk"}">${images2[imageInd].type === "video" ? `<img alt="${""}" src="${"playButton.png"}" class="${"play-button svelte-1aqh5gk"}">` : ``}

		<img${add_attribute("data-src", images2[imageInd].image.url, 0)} alt="${""}" class="${"main-image lazy svelte-1aqh5gk"}"></div>
</div>`;
});
var TextPage_svelte_svelte_type_style_lang = "";
const css$c = {
  code: ".container.svelte-1wjvxy1.svelte-1wjvxy1{margin:auto;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;height:100%}@media(max-width: 1400px){.container.svelte-1wjvxy1.svelte-1wjvxy1{padding:30px;max-width:100%}.container.svelte-1wjvxy1 .text-content.svelte-1wjvxy1{width:100%;max-width:100%}}.container.svelte-1wjvxy1 .header.svelte-1wjvxy1{text-transform:uppercase;color:white}@media(max-width: 650px){.container.svelte-1wjvxy1.svelte-1wjvxy1{width:100%;height:100%;display:none}}@media(max-width: 950px){.container.svelte-1wjvxy1 .text-content.svelte-1wjvxy1{padding-top:67px}}.text-content.svelte-1wjvxy1.svelte-1wjvxy1{max-width:50%;display:flex;flex-direction:column;width:100%;overflow:hidden}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1{height:100%;overflow:auto}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar{width:20px}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar-track{background-color:transparent}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar-thumb{background-color:#d6dee1;border-radius:20px;border:6px solid transparent;background-clip:content-box}",
  map: `{"version":3,"file":"TextPage.svelte","sources":["TextPage.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport Logo from '../../images/svgs/Logo/Logo.svelte';\\r\\n\\timport { textPages } from '../../pageContent';\\r\\n\\timport { scrollContainers } from '../../stores';\\r\\n\\texport let index;\\r\\n\\texport let bgColor;\\r\\n\\tlet scrollContainer;\\r\\n<\/script>\\r\\n\\r\\n<div style=\\"background-color: {bgColor};\\" class=\\"page container\\">\\r\\n\\t<div class=\\"text-content\\">\\r\\n\\t\\t<div class=\\"bu-content bu-is-large\\">\\r\\n\\t\\t\\t<h3 class=\\"header bu-content-header \\">\\r\\n\\t\\t\\t\\t{textPages[index].header}\\r\\n\\t\\t\\t</h3>\\r\\n\\t\\t</div>\\r\\n\\t\\t<div\\r\\n\\t\\t\\ton:mousewheel=\\"{(e) => {\\r\\n\\t\\t\\t\\tif (e.currentTarget.scrollHeight > e.currentTarget.clientHeight) {\\r\\n\\t\\t\\t\\t\\te.stopPropagation();\\r\\n\\t\\t\\t\\t}\\r\\n\\t\\t\\t}}\\"\\r\\n\\t\\t\\tclass=\\"bu-content text-container\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<div bind:this=\\"{scrollContainer}\\" class=\\"scroll-container-text\\">\\r\\n\\t\\t\\t\\t<div class=\\"text-p-container\\">\\r\\n\\t\\t\\t\\t\\t{#each textPages[index].paragraphs as text, i}\\r\\n\\t\\t\\t\\t\\t\\t<p key=\\"{i}\\" class=\\"$1\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t{text}\\r\\n\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  margin: auto;\\n  overflow: hidden;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n  align-items: center;\\n  color: white;\\n  height: 100%;\\n}\\n@media (max-width: 1400px) {\\n  .container {\\n    padding: 30px;\\n    max-width: 100%;\\n  }\\n  .container .text-content {\\n    width: 100%;\\n    max-width: 100%;\\n  }\\n}\\n.container .header {\\n  text-transform: uppercase;\\n  color: white;\\n}\\n@media (max-width: 650px) {\\n  .container {\\n    width: 100%;\\n    height: 100%;\\n    display: none;\\n  }\\n}\\n@media (max-width: 950px) {\\n  .container .text-content {\\n    padding-top: 67px;\\n  }\\n}\\n\\n.text-content {\\n  max-width: 50%;\\n  display: flex;\\n  flex-direction: column;\\n  width: 100%;\\n  overflow: hidden;\\n}\\n.text-content .text-container {\\n  height: 100%;\\n  overflow: auto;\\n}\\n.text-content .text-container::-webkit-scrollbar {\\n  width: 20px;\\n}\\n.text-content .text-container::-webkit-scrollbar-track {\\n  background-color: transparent;\\n}\\n.text-content .text-container::-webkit-scrollbar-thumb {\\n  background-color: #d6dee1;\\n  border-radius: 20px;\\n  border: 6px solid transparent;\\n  background-clip: content-box;\\n}</style>\\r\\n"],"names":[],"mappings":"AAsCmB,UAAU,8BAAC,CAAC,AAC7B,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,yBAAU,CAAC,OAAO,eAAC,CAAC,AAClB,cAAc,CAAE,SAAS,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,WAAW,CAAE,IAAI,AACnB,CAAC,AACH,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,SAAS,CAAE,GAAG,CACd,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,4BAAa,CAAC,eAAe,eAAC,CAAC,AAC7B,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,IAAI,AAChB,CAAC,AACD,4BAAa,CAAC,8BAAe,mBAAmB,AAAC,CAAC,AAChD,KAAK,CAAE,IAAI,AACb,CAAC,AACD,4BAAa,CAAC,8BAAe,yBAAyB,AAAC,CAAC,AACtD,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AACD,4BAAa,CAAC,8BAAe,yBAAyB,AAAC,CAAC,AACtD,gBAAgB,CAAE,OAAO,CACzB,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAC7B,eAAe,CAAE,WAAW,AAC9B,CAAC"}`
};
const TextPage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { index: index2 } = $$props;
  let { bgColor } = $$props;
  let scrollContainer;
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.bgColor === void 0 && $$bindings.bgColor && bgColor !== void 0)
    $$bindings.bgColor(bgColor);
  $$result.css.add(css$c);
  return `<div style="${"background-color: " + escape(bgColor) + ";"}" class="${"page container svelte-1wjvxy1"}"><div class="${"text-content svelte-1wjvxy1"}"><div class="${"bu-content bu-is-large"}"><h3 class="${"header bu-content-header  svelte-1wjvxy1"}">${escape(textPages[index2].header)}</h3></div>
		<div class="${"bu-content text-container svelte-1wjvxy1"}"><div class="${"scroll-container-text"}"${add_attribute("this", scrollContainer, 0)}><div class="${"text-p-container"}">${each(textPages[index2].paragraphs, (text, i) => `<p${add_attribute("key", i, 0)} class="${"$1"}">${escape(text)}
						</p>`)}</div></div></div></div>
</div>`;
});
var LeftContainer_svelte_svelte_type_style_lang = "";
const css$b = {
  code: ".bg-image-container.svelte-x4nibx.svelte-x4nibx{width:100%;height:100%;position:absolute;z-index:1}.bg-image-container.svelte-x4nibx .bg-image.svelte-x4nibx{width:100%;height:100%}.container.svelte-x4nibx.svelte-x4nibx{position:relative;align-items:center;transition:all 1s ease-out;height:100vh;max-width:50vw;width:100%}.container.svelte-x4nibx .logo-wrapper.svelte-x4nibx{width:50vw;height:100vh;display:flex;align-items:center;justify-content:flex-end;z-index:2;position:relative}.container.svelte-x4nibx .logo-wrapper .logo-container.svelte-x4nibx{max-width:33%}.container.svelte-x4nibx .logo-wrapper .logo-container .image-logo.svelte-x4nibx{object-fit:contain;width:100%}@media(max-width: 650px){.container.svelte-x4nibx .logo-wrapper.svelte-x4nibx{width:100%;max-width:100%;justify-content:center}.container.svelte-x4nibx .logo-wrapper .logo-container.svelte-x4nibx{max-width:40%}.container.svelte-x4nibx .logo-wrapper .logo-container .image-logo.svelte-x4nibx{width:100%}}@media(max-width: 650px){.container.svelte-x4nibx.svelte-x4nibx{max-width:100%}}@media(max-width: 650px){.image-logo.svelte-x4nibx.svelte-x4nibx{display:none}.container.svelte-x4nibx.svelte-x4nibx{width:100vw}.container.svelte-x4nibx.svelte-x4nibx{transform:translateY(0) !important;justify-content:center}}",
  map: `{"version":3,"file":"LeftContainer.svelte","sources":["LeftContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport CarouselRenders from '../CarouselRenders/CarouselRenders.svelte';\\r\\n\\timport ContactUs from '../ContactUs/ContactUs.svelte';\\r\\n\\timport Credits from '../Credits/Credits.svelte';\\r\\n\\timport GalleryPreview from '../GalleryPreview/GalleryPreview.svelte';\\r\\n\\timport ImagePage from '../ImagePage/ImagePage.svelte';\\r\\n\\timport TextPage from '../TextPage/TextPage.svelte';\\r\\n\\r\\n\\texport let leftPage;\\r\\n\\texport let carouselPage;\\r\\n<\/script>\\r\\n\\r\\n<div bind:this=\\"{leftPage}\\" class=\\"container\\">\\r\\n\\t<div class=\\"bg-image-container\\">\\r\\n\\t\\t<img class=\\"bg-image\\" src=\\"horse-left.jpg\\" alt=\\"\\" />\\r\\n\\t</div>\\r\\n\\t<div id=\\"home\\" class=\\"logo-wrapper\\">\\r\\n\\t\\t<div class=\\"logo-container\\">\\r\\n\\t\\t\\t<img class=\\"image-logo\\" src=\\"Maliview Left.png\\" alt=\\"\\" />\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n\\r\\n\\t<ImagePage imageInd=\\"{0}\\" name=\\"malibu\\" index=\\"{0}\\" />\\r\\n\\t<TextPage name=\\"discover\\" bgColor=\\"#a4632e\\" index=\\"{1}\\" />\\r\\n\\t<CarouselRenders itemIndex=\\"{0}\\" name=\\"renders\\" carouselPage=\\"{carouselPage}\\" page=\\"left\\" />\\r\\n\\r\\n\\t<TextPage name=\\"floorplans\\" bgColor=\\"#a4632e\\" index=\\"{3}\\" />\\r\\n\\t<ImagePage imageInd=\\"{1}\\" name=\\"equestrian\\" index=\\"{2}\\" />\\r\\n\\t<TextPage name=\\"video render\\" bgColor=\\"#a4632e\\" index=\\"{5}\\" />\\r\\n\\t<GalleryPreview name=\\"behind the scenes\\" />\\r\\n\\r\\n\\t<TextPage index=\\"{7}\\" name=\\"drone footage\\" />\\r\\n\\t<Credits page=\\"left\\" />\\r\\n\\t<div class=\\"page\\">\\r\\n\\t\\t<ContactUs />\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.bg-image-container {\\n  width: 100%;\\n  height: 100%;\\n  position: absolute;\\n  z-index: 1;\\n}\\n.bg-image-container .bg-image {\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.container {\\n  position: relative;\\n  align-items: center;\\n  transition: all 1s ease-out;\\n  height: 100vh;\\n  max-width: 50vw;\\n  width: 100%;\\n}\\n.container .logo-wrapper {\\n  width: 50vw;\\n  height: 100vh;\\n  display: flex;\\n  align-items: center;\\n  justify-content: flex-end;\\n  z-index: 2;\\n  position: relative;\\n}\\n.container .logo-wrapper .logo-container {\\n  max-width: 33%;\\n}\\n.container .logo-wrapper .logo-container .image-logo {\\n  object-fit: contain;\\n  width: 100%;\\n}\\n@media (max-width: 650px) {\\n  .container .logo-wrapper {\\n    width: 100%;\\n    max-width: 100%;\\n    justify-content: center;\\n  }\\n  .container .logo-wrapper .logo-container {\\n    max-width: 40%;\\n  }\\n  .container .logo-wrapper .logo-container .image-logo {\\n    width: 100%;\\n  }\\n}\\n@media (max-width: 650px) {\\n  .container {\\n    max-width: 100%;\\n  }\\n}\\n\\n@media (max-width: 650px) {\\n  .image-logo {\\n    display: none;\\n  }\\n\\n  .container {\\n    width: 100vw;\\n  }\\n\\n  .container {\\n    transform: translateY(0) !important;\\n    justify-content: center;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAsCmB,mBAAmB,4BAAC,CAAC,AACtC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,iCAAmB,CAAC,SAAS,cAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,GAAG,CAAC,EAAE,CAAC,QAAQ,CAC3B,MAAM,CAAE,KAAK,CACb,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,AACb,CAAC,AACD,wBAAU,CAAC,aAAa,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,QAAQ,CACzB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,cAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,cAAC,CAAC,AACpD,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,wBAAU,CAAC,aAAa,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,cAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,wBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,cAAC,CAAC,AACpD,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,4BAAC,CAAC,AACV,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,WAAW,4BAAC,CAAC,AACX,OAAO,CAAE,IAAI,AACf,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,SAAS,CAAE,WAAW,CAAC,CAAC,CAAC,UAAU,CACnC,eAAe,CAAE,MAAM,AACzB,CAAC,AACH,CAAC"}`
};
const LeftContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { leftPage } = $$props;
  let { carouselPage } = $$props;
  if ($$props.leftPage === void 0 && $$bindings.leftPage && leftPage !== void 0)
    $$bindings.leftPage(leftPage);
  if ($$props.carouselPage === void 0 && $$bindings.carouselPage && carouselPage !== void 0)
    $$bindings.carouselPage(carouselPage);
  $$result.css.add(css$b);
  return `<div class="${"container svelte-x4nibx"}"${add_attribute("this", leftPage, 0)}><div class="${"bg-image-container svelte-x4nibx"}"><img class="${"bg-image svelte-x4nibx"}" src="${"horse-left.jpg"}" alt="${""}"></div>
	<div id="${"home"}" class="${"logo-wrapper svelte-x4nibx"}"><div class="${"logo-container svelte-x4nibx"}"><img class="${"image-logo svelte-x4nibx"}" src="${"Maliview Left.png"}" alt="${""}"></div></div>

	${validate_component(ImagePage, "ImagePage").$$render($$result, { imageInd: 0, name: "malibu", index: 0 }, {}, {})}
	${validate_component(TextPage, "TextPage").$$render($$result, {
    name: "discover",
    bgColor: "#a4632e",
    index: 1
  }, {}, {})}
	${validate_component(CarouselRenders, "CarouselRenders").$$render($$result, {
    itemIndex: 0,
    name: "renders",
    carouselPage,
    page: "left"
  }, {}, {})}

	${validate_component(TextPage, "TextPage").$$render($$result, {
    name: "floorplans",
    bgColor: "#a4632e",
    index: 3
  }, {}, {})}
	${validate_component(ImagePage, "ImagePage").$$render($$result, {
    imageInd: 1,
    name: "equestrian",
    index: 2
  }, {}, {})}
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
const css$a = {
  code: ".page.svelte-ecj6uw.svelte-ecj6uw{position:relative}.left.svelte-ecj6uw.svelte-ecj6uw{right:5px}.right.svelte-ecj6uw.svelte-ecj6uw{left:5px}.indicator.svelte-ecj6uw.svelte-ecj6uw{top:5px;z-index:4;font-weight:600;text-align:center;letter-spacing:0.2em;position:absolute;padding:5px 15px;border-radius:14px;background-color:black;color:white;display:flex;justify-content:center}.indicator.svelte-ecj6uw p.svelte-ecj6uw{margin-right:-0.2em}.glide__arrow--right.svelte-ecj6uw.svelte-ecj6uw{right:20px;transform:rotate(180deg)}.glide__arrow--left.svelte-ecj6uw.svelte-ecj6uw{left:20px}.page-arrow-container.svelte-ecj6uw.svelte-ecj6uw{width:30px;height:30px;position:absolute;bottom:0;top:50%;border-radius:50%;background-color:rgba(0, 0, 0, 0.5);border:none;overflow:hidden}.page-arrow-container.svelte-ecj6uw .page-arrow-relative.svelte-ecj6uw{position:absolute;top:0;left:0;bottom:0;right:0;padding:5px;margin:auto}.glide__slides.svelte-ecj6uw.svelte-ecj6uw{height:100%;display:flex;justify-content:center}.glide__slide.svelte-ecj6uw.svelte-ecj6uw{display:flex;justify-content:center}.glide__arrows.svelte-ecj6uw.svelte-ecj6uw{position:absolute;left:0;margin:auto;top:0;bottom:0;right:0;width:100%}.glide.svelte-ecj6uw.svelte-ecj6uw{height:100%}.glide.svelte-ecj6uw .glide__track.svelte-ecj6uw{height:100%}.glide.svelte-ecj6uw .glide__track .image-container.svelte-ecj6uw{width:100%}.glide.svelte-ecj6uw .glide__track .image-container img.svelte-ecj6uw{width:100%;object-fit:cover;height:100%;object-position:center center}",
  map: `{"version":3,"file":"CarouselFull.svelte","sources":["CarouselFull.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport Glide from '@glidejs/glide';\\r\\n\\timport { pageLayout } from '../../stores';\\r\\n\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport Arrow from '../Card/Arrow.svelte';\\r\\n\\r\\n\\tlet glider;\\r\\n\\texport let name;\\r\\n\\texport let page;\\r\\n\\texport let orient;\\r\\n\\texport let itemInd;\\r\\n\\tconst data = pageLayout['page-carousels'];\\r\\n\\r\\n\\tconst images = {\\r\\n\\t\\tfloorplans: data[itemInd].images.filter((item) => {\\r\\n\\t\\t\\treturn item.url;\\r\\n\\t\\t}),\\r\\n\\t\\tdiscover: data[itemInd].images.filter((item) => {\\r\\n\\t\\t\\treturn item.url;\\r\\n\\t\\t})\\r\\n\\t};\\r\\n\\r\\n\\tconst halfCarousel = {};\\r\\n\\tlet glide;\\r\\n\\tlet glideIndex = 0;\\r\\n\\tonMount(() => {\\r\\n\\t\\tglide = new Glide(glider);\\r\\n\\t\\tglide.mount();\\r\\n\\t\\tglide.on('run', function () {\\r\\n\\t\\t\\tglideIndex = glide.index;\\r\\n\\t\\t});\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"page\\">\\r\\n\\t<div class=\\"indicator {page}\\">\\r\\n\\t\\t{#if glide}\\r\\n\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t{glideIndex + 1}/{orient === 'half' ? halfCarousel[name].length : images[name].length}\\r\\n\\t\\t\\t</p>\\r\\n\\t\\t{/if}\\r\\n\\t</div>\\r\\n\\t<div bind:this=\\"{glider}\\" class=\\"glide\\">\\r\\n\\t\\t<div class=\\"glide__track\\" data-glide-el=\\"track\\">\\r\\n\\t\\t\\t<ul class=\\"glide__slides\\">\\r\\n\\t\\t\\t\\t{#each images[name] as img, i}\\r\\n\\t\\t\\t\\t\\t<li class=\\"glide__slide\\">\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\"image-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t{#if img.url}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<img loading=\\"lazy\\" class=\\"carousel-image\\" src=\\"{img.url}\\" alt=\\"\\" />\\r\\n\\t\\t\\t\\t\\t\\t\\t{/if}\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t</ul>\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"glide__arrows\\" data-glide-el=\\"controls\\">\\r\\n\\t\\t\\t<button class=\\"glide__arrow page-arrow-container glide__arrow--left\\" data-glide-dir=\\"<\\">\\r\\n\\t\\t\\t\\t<div class=\\"page-arrow-relative\\">\\r\\n\\t\\t\\t\\t\\t<Arrow\\r\\n\\t\\t\\t\\t\\t\\tstyleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t</div></button\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t<button class=\\"glide__arrow  page-arrow-container glide__arrow--right\\" data-glide-dir=\\">\\">\\r\\n\\t\\t\\t\\t<div class=\\"page-arrow-relative\\">\\r\\n\\t\\t\\t\\t\\t<Arrow\\r\\n\\t\\t\\t\\t\\t\\tstyleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</button>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.page {\\n  position: relative;\\n}\\n\\n.left {\\n  right: 5px;\\n}\\n\\n.right {\\n  left: 5px;\\n}\\n\\n.indicator {\\n  top: 5px;\\n  z-index: 4;\\n  font-weight: 600;\\n  text-align: center;\\n  letter-spacing: 0.2em;\\n  position: absolute;\\n  padding: 5px 15px;\\n  border-radius: 14px;\\n  background-color: black;\\n  color: white;\\n  display: flex;\\n  justify-content: center;\\n}\\n.indicator p {\\n  margin-right: -0.2em;\\n}\\n\\n.glide__arrow--right {\\n  right: 20px;\\n  transform: rotate(180deg);\\n}\\n\\n.glide__arrow--left {\\n  left: 20px;\\n}\\n\\n.page-arrow-container {\\n  width: 30px;\\n  height: 30px;\\n  position: absolute;\\n  bottom: 0;\\n  top: 50%;\\n  border-radius: 50%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: none;\\n  overflow: hidden;\\n}\\n.page-arrow-container .page-arrow-relative {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  bottom: 0;\\n  right: 0;\\n  padding: 5px;\\n  margin: auto;\\n}\\n\\n.glide__slides {\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n}\\n\\n.glide__slide {\\n  display: flex;\\n  justify-content: center;\\n}\\n\\n.glide__arrows {\\n  position: absolute;\\n  left: 0;\\n  margin: auto;\\n  top: 0;\\n  bottom: 0;\\n  right: 0;\\n  width: 100%;\\n}\\n\\n.glide {\\n  height: 100%;\\n}\\n.glide .glide__track {\\n  height: 100%;\\n}\\n.glide .glide__track .image-container {\\n  width: 100%;\\n}\\n.glide .glide__track .image-container img {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n  object-position: center center;\\n}</style>\\r\\n"],"names":[],"mappings":"AA4EmB,KAAK,4BAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,AACpB,CAAC,AAED,KAAK,4BAAC,CAAC,AACL,KAAK,CAAE,GAAG,AACZ,CAAC,AAED,MAAM,4BAAC,CAAC,AACN,IAAI,CAAE,GAAG,AACX,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,KAAK,CACrB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,wBAAU,CAAC,CAAC,cAAC,CAAC,AACZ,YAAY,CAAE,MAAM,AACtB,CAAC,AAED,oBAAoB,4BAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,mBAAmB,4BAAC,CAAC,AACnB,IAAI,CAAE,IAAI,AACZ,CAAC,AAED,qBAAqB,4BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,GAAG,CACR,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,mCAAqB,CAAC,oBAAoB,cAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,cAAc,4BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,KAAK,CAAE,IAAI,AACb,CAAC,AAED,MAAM,4BAAC,CAAC,AACN,MAAM,CAAE,IAAI,AACd,CAAC,AACD,oBAAM,CAAC,aAAa,cAAC,CAAC,AACpB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,oBAAM,CAAC,aAAa,CAAC,gBAAgB,cAAC,CAAC,AACrC,KAAK,CAAE,IAAI,AACb,CAAC,AACD,oBAAM,CAAC,aAAa,CAAC,gBAAgB,CAAC,GAAG,cAAC,CAAC,AACzC,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,CACZ,eAAe,CAAE,MAAM,CAAC,MAAM,AAChC,CAAC"}`
};
const CarouselFull = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let glider;
  let { name } = $$props;
  let { page } = $$props;
  let { orient } = $$props;
  let { itemInd } = $$props;
  const data = pageLayout["page-carousels"];
  const images2 = {
    floorplans: data[itemInd].images.filter((item) => {
      return item.url;
    }),
    discover: data[itemInd].images.filter((item) => {
      return item.url;
    })
  };
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.orient === void 0 && $$bindings.orient && orient !== void 0)
    $$bindings.orient(orient);
  if ($$props.itemInd === void 0 && $$bindings.itemInd && itemInd !== void 0)
    $$bindings.itemInd(itemInd);
  $$result.css.add(css$a);
  return `<div class="${"page svelte-ecj6uw"}"><div class="${"indicator " + escape(page) + " svelte-ecj6uw"}">${``}</div>
	<div class="${"glide svelte-ecj6uw"}"${add_attribute("this", glider, 0)}><div class="${"glide__track svelte-ecj6uw"}" data-glide-el="${"track"}"><ul class="${"glide__slides svelte-ecj6uw"}">${each(images2[name], (img, i) => `<li class="${"glide__slide svelte-ecj6uw"}"><div class="${"image-container svelte-ecj6uw"}">${img.url ? `<img loading="${"lazy"}" class="${"carousel-image svelte-ecj6uw"}"${add_attribute("src", img.url, 0)} alt="${""}">` : ``}</div>
					</li>`)}</ul></div>
		<div class="${"glide__arrows svelte-ecj6uw"}" data-glide-el="${"controls"}"><button class="${"glide__arrow page-arrow-container glide__arrow--left svelte-ecj6uw"}" data-glide-dir="${"<"}"><div class="${"page-arrow-relative svelte-ecj6uw"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button>
			<button class="${"glide__arrow page-arrow-container glide__arrow--right svelte-ecj6uw"}" data-glide-dir="${">"}"><div class="${"page-arrow-relative svelte-ecj6uw"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button></div></div>
</div>`;
});
var GallerySelected_svelte_svelte_type_style_lang = "";
const css$9 = {
  code: '.image-container.svelte-16g7mu0.svelte-16g7mu0{flex:30%}.image-container.svelte-16g7mu0.svelte-16g7mu0:last-child{flex-grow:0}.image-container.svelte-16g7mu0 img.svelte-16g7mu0{object-fit:cover;cursor:pointer;width:100%;height:100%}.overlay-image.svelte-16g7mu0.svelte-16g7mu0{position:relative;border:1px solid white}.overlay-image.svelte-16g7mu0.svelte-16g7mu0::before{z-index:2;content:"";height:100%;width:100%;position:absolute;display:block;background-color:rgba(0, 0, 0, 0.5)}',
  map: `{"version":3,"file":"GallerySelected.svelte","sources":["GallerySelected.svelte"],"sourcesContent":["<script>\\r\\n\\timport { galleryImg } from './../GalleryPreview/store.js';\\r\\n\\timport { createEventDispatcher } from 'svelte';\\r\\n\\r\\n\\texport let img;\\r\\n\\texport let index;\\r\\n\\r\\n\\tconst dispatch = createEventDispatcher();\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n\\tclass:overlay-image=\\"{$galleryImg.selected === index}\\"\\r\\n\\tclass=\\"{$galleryImg.currPhase} image-container\\"\\r\\n>\\r\\n\\t<img\\r\\n\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\tgalleryImg.update((s) => {\\r\\n\\t\\t\\t\\t$galleryImg.selected = index;\\r\\n\\t\\t\\t\\t$galleryImg.imageToDisplay = img.url;\\r\\n\\t\\t\\t\\t// s.imageToDisplay = img.raw;\\r\\n\\t\\t\\t\\treturn s;\\r\\n\\t\\t\\t});\\r\\n\\t\\t\\tdispatch('select', img.index);\\r\\n\\t\\t}}\\"\\r\\n\\t\\tloading=\\"lazy\\"\\r\\n\\t\\tsrc=\\"{img.url}\\"\\r\\n\\t\\talt=\\"\\"\\r\\n\\t/>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.image-container {\\n  flex: 30%;\\n}\\n.image-container:last-child {\\n  flex-grow: 0;\\n}\\n.image-container img {\\n  object-fit: cover;\\n  cursor: pointer;\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.overlay-image {\\n  position: relative;\\n  border: 1px solid white;\\n}\\n.overlay-image::before {\\n  z-index: 2;\\n  content: \\"\\";\\n  height: 100%;\\n  width: 100%;\\n  position: absolute;\\n  display: block;\\n  background-color: rgba(0, 0, 0, 0.5);\\n}</style>\\r\\n"],"names":[],"mappings":"AA8BmB,gBAAgB,8BAAC,CAAC,AACnC,IAAI,CAAE,GAAG,AACX,CAAC,AACD,8CAAgB,WAAW,AAAC,CAAC,AAC3B,SAAS,CAAE,CAAC,AACd,CAAC,AACD,+BAAgB,CAAC,GAAG,eAAC,CAAC,AACpB,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,cAAc,8BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AACzB,CAAC,AACD,4CAAc,QAAQ,AAAC,CAAC,AACtB,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC"}`
};
const GallerySelected = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  let { img } = $$props;
  let { index: index2 } = $$props;
  createEventDispatcher();
  if ($$props.img === void 0 && $$bindings.img && img !== void 0)
    $$bindings.img(img);
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  $$result.css.add(css$9);
  $$unsubscribe_galleryImg();
  return `<div class="${[
    escape($galleryImg.currPhase) + " image-container svelte-16g7mu0",
    $galleryImg.selected === index2 ? "overlay-image" : ""
  ].join(" ").trim()}"><img loading="${"lazy"}"${add_attribute("src", img.url, 0)} alt="${""}" class="${"svelte-16g7mu0"}">
</div>`;
});
var Gallery_svelte_svelte_type_style_lang = "";
const css$8 = {
  code: '.flex-column.svelte-1jagky3.svelte-1jagky3{display:flex;width:100%;gap:5px;flex-direction:column}.flex-container.svelte-1jagky3.svelte-1jagky3{width:100%;height:100%;gap:5px;display:flex;flex-wrap:wrap;overflow:auto}.phase-label-container.svelte-1jagky3.svelte-1jagky3{color:white;display:flex;gap:10px;align-items:center;padding:0.5rem;font-family:Orator}.phase-label-container.svelte-1jagky3 h5.svelte-1jagky3{width:fit-content;position:relative;cursor:pointer}.phase-label-container.svelte-1jagky3 .phase-label.svelte-1jagky3::after{content:"";display:block;width:100%;height:1px;background-color:white}',
  map: `{"version":3,"file":"Gallery.svelte","sources":["Gallery.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport GallerySelected from './GallerySelected.svelte';\\r\\n\\timport { galleryImg } from '../GalleryPreview/store';\\r\\n\\timport GalleryImage from '../GalleryImage/GalleryImage.svelte';\\r\\n\\r\\n\\timport { pageLayout } from '../../stores';\\r\\n\\r\\n\\tlet selected;\\r\\n\\tconst images = pageLayout.bts;\\r\\n\\tconst selectImage = (i) => {\\r\\n\\t\\tgalleryImg.update((s) => {\\r\\n\\t\\t\\ts.index = i;\\r\\n\\t\\t\\treturn s;\\r\\n\\t\\t});\\r\\n\\t};\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n\\ton:mousewheel=\\"{(e) => {\\r\\n\\t\\te.stopPropagation();\\r\\n\\t}}\\"\\r\\n\\tclass=\\"page\\"\\r\\n>\\r\\n\\t<div class=\\"phase-label-container\\">\\r\\n\\t\\t{#each images as phase, i}\\r\\n\\t\\t\\t<h5\\r\\n\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\tgalleryImg.update((s) => {\\r\\n\\t\\t\\t\\t\\t\\ts.currPhase = i;\\r\\n\\t\\t\\t\\t\\t\\ts.index = 0;\\r\\n\\t\\t\\t\\t\\t\\treturn s;\\r\\n\\t\\t\\t\\t\\t});\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\tclass:phase-label=\\"{i === $galleryImg.currPhase}\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\tphase {i + 1}\\r\\n\\t\\t\\t</h5>\\r\\n\\t\\t{/each}\\r\\n\\t</div>\\r\\n\\t<div class=\\"flex-container {$galleryImg.currPhase}\\">\\r\\n\\t\\t{#each images[$galleryImg.currPhase].images as img, i}\\r\\n\\t\\t\\t<GallerySelected img=\\"{img}\\" selected=\\"{selected}\\" index=\\"{i}\\" />\\r\\n\\t\\t{/each}\\r\\n\\t\\t{#if $galleryImg.currPhase === 'phase-1'}\\r\\n\\t\\t\\t<!-- <iframe\\r\\n        class=\\"video-modal\\"\\r\\n        width=\\"100%\\"\\r\\n        src=\\"https://www.youtube.com/embed/nTS10ZQM5Ms\\"\\r\\n        title=\\"YouTube video player\\"\\r\\n        allow=\\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\\"\\r\\n      /> -->\\r\\n\\t\\t{/if}\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.flex-column {\\n  display: flex;\\n  width: 100%;\\n  gap: 5px;\\n  flex-direction: column;\\n}\\n.flex-column:nth-child(3) .image-container {\\n  max-height: calc(100% / 5);\\n}\\n\\n.flex-container {\\n  width: 100%;\\n  height: 100%;\\n  gap: 5px;\\n  display: flex;\\n  flex-wrap: wrap;\\n  overflow: auto;\\n}\\n\\n.phase-label-container {\\n  color: white;\\n  display: flex;\\n  gap: 10px;\\n  align-items: center;\\n  padding: 0.5rem;\\n  font-family: Orator;\\n}\\n.phase-label-container h5 {\\n  width: fit-content;\\n  position: relative;\\n  cursor: pointer;\\n}\\n.phase-label-container .phase-label::after {\\n  content: \\"\\";\\n  display: block;\\n  width: 100%;\\n  height: 1px;\\n  background-color: white;\\n}</style>\\r\\n"],"names":[],"mappings":"AAuDmB,YAAY,8BAAC,CAAC,AAC/B,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,GAAG,CAAE,GAAG,CACR,cAAc,CAAE,MAAM,AACxB,CAAC,AAKD,eAAe,8BAAC,CAAC,AACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,CACf,QAAQ,CAAE,IAAI,AAChB,CAAC,AAED,sBAAsB,8BAAC,CAAC,AACtB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,CACT,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,MAAM,CACf,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,qCAAsB,CAAC,EAAE,eAAC,CAAC,AACzB,KAAK,CAAE,WAAW,CAClB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,qCAAsB,CAAC,2BAAY,OAAO,AAAC,CAAC,AAC1C,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,gBAAgB,CAAE,KAAK,AACzB,CAAC"}`
};
const Gallery = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  let selected;
  const images2 = pageLayout.bts;
  $$result.css.add(css$8);
  $$unsubscribe_galleryImg();
  return `<div class="${"page"}"><div class="${"phase-label-container svelte-1jagky3"}">${each(images2, (phase, i) => `<h5 class="${["svelte-1jagky3", i === $galleryImg.currPhase ? "phase-label" : ""].join(" ").trim()}">phase ${escape(i + 1)}
			</h5>`)}</div>
	<div class="${"flex-container " + escape($galleryImg.currPhase) + " svelte-1jagky3"}">${each(images2[$galleryImg.currPhase].images, (img, i) => `${validate_component(GallerySelected, "GallerySelected").$$render($$result, { img, selected, index: i }, {}, {})}`)}
		${$galleryImg.currPhase === "phase-1" ? `` : ``}</div>
</div>`;
});
var RightContainer_svelte_svelte_type_style_lang = "";
const css$7 = {
  code: ".bg-image-container.svelte-1ppt77p.svelte-1ppt77p{width:100%;height:100%;position:absolute;z-index:1;margin:auto}.bg-image-container.svelte-1ppt77p .bg-image.svelte-1ppt77p{width:100%;height:100%}.container.svelte-1ppt77p.svelte-1ppt77p{position:relative;align-items:center;transform:translateY(-1000vh);transition:all 1s ease-out;height:100vh;max-width:50vw;width:100%}.container.svelte-1ppt77p .logo-wrapper.svelte-1ppt77p{width:50vw;height:100vh;display:flex;align-items:center;justify-content:flex-start;z-index:2;position:relative}.container.svelte-1ppt77p .logo-wrapper .logo-container.svelte-1ppt77p{max-width:33%}.container.svelte-1ppt77p .logo-wrapper .logo-container .image-logo.svelte-1ppt77p{object-fit:contain;width:100%}@media(max-width: 650px){.container.svelte-1ppt77p .logo-wrapper.svelte-1ppt77p{width:100%;max-width:100%;justify-content:center}.container.svelte-1ppt77p .logo-wrapper .logo-container.svelte-1ppt77p{max-width:40%}.container.svelte-1ppt77p .logo-wrapper .logo-container .image-logo.svelte-1ppt77p{width:100%}}@media(max-width: 650px){.container.svelte-1ppt77p.svelte-1ppt77p{max-width:100%}}@media(max-width: 650px){.image-logo.svelte-1ppt77p.svelte-1ppt77p{display:none}.container.svelte-1ppt77p.svelte-1ppt77p{width:100vw}.container.svelte-1ppt77p.svelte-1ppt77p{transform:translateY(0) !important;justify-content:center}}",
  map: `{"version":3,"file":"RightContainer.svelte","sources":["RightContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport CarouselFull from '../CarouselFull/CarouselFull.svelte';\\r\\n\\timport Credits from '../Credits/Credits.svelte';\\r\\n\\timport Gallery from '../Gallery/Gallery.svelte';\\r\\n\\timport ImagePage from '../ImagePage/ImagePage.svelte';\\r\\n\\timport TextPage from '../TextPage/TextPage.svelte';\\r\\n\\timport CarouselRenders from './../CarouselRenders/CarouselRenders.svelte';\\r\\n\\r\\n\\texport let rightPage;\\r\\n\\texport let carouselPage;\\r\\n<\/script>\\r\\n\\r\\n<div bind:this=\\"{rightPage}\\" class=\\"container\\">\\r\\n\\t<ImagePage imageInd=\\"{2}\\" index=\\"{5}\\" />\\r\\n\\t<Credits page=\\"right\\" />\\r\\n\\t<ImagePage imageInd=\\"{3}\\" index=\\"{4}\\" />\\r\\n\\t<Gallery />\\r\\n\\t<ImagePage imageInd=\\"{2}\\" index=\\"{3}\\" />\\r\\n\\r\\n\\t<TextPage index=\\"{4}\\" />\\r\\n\\t<CarouselFull itemInd=\\"{1}\\" orient=\\"full\\" page=\\"right\\" name=\\"floorplans\\" />\\r\\n\\t<CarouselRenders itemIndex=\\"{0}\\" carouselPage=\\"{carouselPage}\\" page=\\"right\\" />\\r\\n\\r\\n\\t<CarouselFull itemInd=\\"{0}\\" orient=\\"full\\" page=\\"right\\" name=\\"discover\\" index=\\"{1}\\" />\\r\\n\\t<TextPage index=\\"{0}\\" />\\r\\n\\t<div class=\\"bg-image-container\\">\\r\\n\\t\\t<img class=\\"bg-image\\" src=\\"horse-right.jpg\\" alt=\\"\\" />\\r\\n\\t</div>\\r\\n\\t<div class=\\"logo-wrapper\\">\\r\\n\\t\\t<div class=\\"logo-container\\">\\r\\n\\t\\t\\t<img class=\\"image-logo\\" src=\\"Maliview Right.png\\" alt=\\"\\" />\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.bg-image-container {\\n  width: 100%;\\n  height: 100%;\\n  position: absolute;\\n  z-index: 1;\\n  margin: auto;\\n}\\n.bg-image-container .bg-image {\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.container {\\n  position: relative;\\n  align-items: center;\\n  transform: translateY(-1000vh);\\n  transition: all 1s ease-out;\\n  height: 100vh;\\n  max-width: 50vw;\\n  width: 100%;\\n}\\n.container .logo-wrapper {\\n  width: 50vw;\\n  height: 100vh;\\n  display: flex;\\n  align-items: center;\\n  justify-content: flex-start;\\n  z-index: 2;\\n  position: relative;\\n}\\n.container .logo-wrapper .logo-container {\\n  max-width: 33%;\\n}\\n.container .logo-wrapper .logo-container .image-logo {\\n  object-fit: contain;\\n  width: 100%;\\n}\\n@media (max-width: 650px) {\\n  .container .logo-wrapper {\\n    width: 100%;\\n    max-width: 100%;\\n    justify-content: center;\\n  }\\n  .container .logo-wrapper .logo-container {\\n    max-width: 40%;\\n  }\\n  .container .logo-wrapper .logo-container .image-logo {\\n    width: 100%;\\n  }\\n}\\n@media (max-width: 650px) {\\n  .container {\\n    max-width: 100%;\\n  }\\n}\\n\\n@media (max-width: 650px) {\\n  .image-logo {\\n    display: none;\\n  }\\n\\n  .container {\\n    width: 100vw;\\n  }\\n\\n  .container {\\n    transform: translateY(0) !important;\\n    justify-content: center;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAmCmB,mBAAmB,8BAAC,CAAC,AACtC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,IAAI,AACd,CAAC,AACD,kCAAmB,CAAC,SAAS,eAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,WAAW,OAAO,CAAC,CAC9B,UAAU,CAAE,GAAG,CAAC,EAAE,CAAC,QAAQ,CAC3B,MAAM,CAAE,KAAK,CACb,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,AACb,CAAC,AACD,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,UAAU,CAC3B,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,eAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,eAAC,CAAC,AACpD,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,yBAAU,CAAC,aAAa,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,eAAC,CAAC,AACxC,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,yBAAU,CAAC,aAAa,CAAC,eAAe,CAAC,WAAW,eAAC,CAAC,AACpD,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,UAAU,8BAAC,CAAC,AACV,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,WAAW,8BAAC,CAAC,AACX,OAAO,CAAE,IAAI,AACf,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,SAAS,CAAE,WAAW,CAAC,CAAC,CAAC,UAAU,CACnC,eAAe,CAAE,MAAM,AACzB,CAAC,AACH,CAAC"}`
};
const RightContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { rightPage } = $$props;
  let { carouselPage } = $$props;
  if ($$props.rightPage === void 0 && $$bindings.rightPage && rightPage !== void 0)
    $$bindings.rightPage(rightPage);
  if ($$props.carouselPage === void 0 && $$bindings.carouselPage && carouselPage !== void 0)
    $$bindings.carouselPage(carouselPage);
  $$result.css.add(css$7);
  return `<div class="${"container svelte-1ppt77p"}"${add_attribute("this", rightPage, 0)}>${validate_component(ImagePage, "ImagePage").$$render($$result, { imageInd: 2, index: 5 }, {}, {})}
	${validate_component(Credits, "Credits").$$render($$result, { page: "right" }, {}, {})}
	${validate_component(ImagePage, "ImagePage").$$render($$result, { imageInd: 3, index: 4 }, {}, {})}
	${validate_component(Gallery, "Gallery").$$render($$result, {}, {}, {})}
	${validate_component(ImagePage, "ImagePage").$$render($$result, { imageInd: 2, index: 3 }, {}, {})}

	${validate_component(TextPage, "TextPage").$$render($$result, { index: 4 }, {}, {})}
	${validate_component(CarouselFull, "CarouselFull").$$render($$result, {
    itemInd: 1,
    orient: "full",
    page: "right",
    name: "floorplans"
  }, {}, {})}
	${validate_component(CarouselRenders, "CarouselRenders").$$render($$result, {
    itemIndex: 0,
    carouselPage,
    page: "right"
  }, {}, {})}

	${validate_component(CarouselFull, "CarouselFull").$$render($$result, {
    itemInd: 0,
    orient: "full",
    page: "right",
    name: "discover",
    index: 1
  }, {}, {})}
	${validate_component(TextPage, "TextPage").$$render($$result, { index: 0 }, {}, {})}
	<div class="${"bg-image-container svelte-1ppt77p"}"><img class="${"bg-image svelte-1ppt77p"}" src="${"horse-right.jpg"}" alt="${""}"></div>
	<div class="${"logo-wrapper svelte-1ppt77p"}"><div class="${"logo-container svelte-1ppt77p"}"><img class="${"image-logo svelte-1ppt77p"}" src="${"Maliview Right.png"}" alt="${""}"></div></div>
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
  code: '.main-image.svelte-jwm8jv.svelte-jwm8jv{object-fit:cover}h5.svelte-jwm8jv.svelte-jwm8jv{font-family:Orator}.font-white.svelte-jwm8jv.svelte-jwm8jv{color:white}.square-place-holder.svelte-jwm8jv.svelte-jwm8jv{width:100%}.square-place-holder.svelte-jwm8jv img.svelte-jwm8jv{width:100%;object-fit:cover}.card-content.svelte-jwm8jv.svelte-jwm8jv{background-color:transparent}.play-button-container.svelte-jwm8jv.svelte-jwm8jv{position:absolute;width:25%;top:50%;left:50%;transform:translate(-50%, -50%);height:auto;z-index:5;object-fit:cover}.content.svelte-jwm8jv.svelte-jwm8jv{max-height:20rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}.card-container.svelte-jwm8jv.svelte-jwm8jv{display:flex;flex-direction:column;background-color:transparent}.card-container.svelte-jwm8jv:nth-child(4) .show-more.svelte-jwm8jv{display:none !important}.blur.svelte-jwm8jv.svelte-jwm8jv{left:0;right:0;z-index:0;position:relative}.blur.svelte-jwm8jv.svelte-jwm8jv::before{pointer-events:none;position:absolute;content:"";height:100%;display:block;left:0;right:0;top:0;z-index:2;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)){.blur.svelte-jwm8jv.svelte-jwm8jv::before{background:rgba(0, 0, 0, 0.5)}}.show-more.svelte-jwm8jv.svelte-jwm8jv{display:block;max-height:100%}',
  map: `{"version":3,"file":"Card.svelte","sources":["Card.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { onDestroy, onMount } from 'svelte';\\r\\n\\timport { browser } from '$app/env';\\r\\n\\r\\n\\timport { navToLink, textPages } from '../../pageContent';\\r\\n\\timport { modal } from '../../stores';\\r\\n\\timport Arrow from './Arrow.svelte';\\r\\n\\r\\n\\texport let index;\\r\\n\\texport let image;\\r\\n\\texport let type;\\r\\n\\tlet showMore = false;\\r\\n\\tlet mainText;\\r\\n\\tlet overFlowing;\\r\\n\\r\\n\\tfunction checkOverFlow() {\\r\\n\\t\\tif (mainText.scrollHeight > mainText.clientHeight) {\\r\\n\\t\\t\\toverFlowing = true;\\r\\n\\t\\t} else {\\r\\n\\t\\t\\toverFlowing = false;\\r\\n\\t\\t}\\r\\n\\t}\\r\\n\\tonMount(() => {\\r\\n\\t\\tif (browser) {\\r\\n\\t\\t\\twindow.addEventListener('resize', checkOverFlow);\\r\\n\\t\\t}\\r\\n\\r\\n\\t\\tcheckOverFlow();\\r\\n\\t});\\r\\n\\tonDestroy(() => {\\r\\n\\t\\tif (browser) {\\r\\n\\t\\t\\twindow.removeEventListener('resize', checkOverFlow);\\r\\n\\t\\t}\\r\\n\\t});\\r\\n\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"bu-card card-container\\" id=\\"{navToLink[index + 1]}\\">\\r\\n\\t<div class=\\"bu-card-image\\">\\r\\n\\t\\t<figure\\r\\n\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\tif (type === 'video') {\\r\\n\\t\\t\\t\\t\\t$modal.visibility = true;\\r\\n\\t\\t\\t\\t\\t$modal.content = images[index].videoUrl;\\r\\n\\t\\t\\t\\t\\t$modal.type = 'video';\\r\\n\\t\\t\\t\\t}\\r\\n\\t\\t\\t}}\\"\\r\\n\\t\\t\\tclass=\\"bu-image bu-is-4by3 {type === 'video' ? 'blur' : ''}\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t{#if type === 'video'}\\r\\n\\t\\t\\t\\t<div class=\\"play-button-container\\">\\r\\n\\t\\t\\t\\t\\t<figure class=\\"bu-image bu-is-square \\">\\r\\n\\t\\t\\t\\t\\t\\t<img src=\\"playButton.png\\" alt=\\"\\" />\\r\\n\\t\\t\\t\\t\\t</figure>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t\\t<img loading=\\"lazy\\" class=\\"main-image\\" src=\\"{image.url}\\" alt=\\"\\" />\\r\\n\\t\\t</figure>\\r\\n\\t</div>\\r\\n\\t<div class=\\"card-content bu-card-content\\">\\r\\n\\t\\t<div class=\\"bu-media\\">\\r\\n\\t\\t\\t<div class=\\"bu-media-left\\">\\r\\n\\t\\t\\t\\t<figure class=\\"bu-image bu-is-48x48\\">\\r\\n\\t\\t\\t\\t\\t<div class=\\"square-place-holder\\" style=\\" height: 100%; width:100%;\\">\\r\\n\\t\\t\\t\\t\\t\\t<img src=\\"mobile-logo.png\\" alt=\\"\\" />\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</figure>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t{#if textPages[index]}\\r\\n\\t\\t\\t\\t<h5 class=\\"title is-4 font-white\\">\\r\\n\\t\\t\\t\\t\\t{textPages[index].header}\\r\\n\\t\\t\\t\\t</h5>\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t</div>\\r\\n\\t\\t<div\\r\\n\\t\\t\\tbind:this=\\"{mainText}\\"\\r\\n\\t\\t\\tclass=\\"content bu-is-clipped content font-white {showMore ? 'show-more' : ''}\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t{#if textPages[index]}\\r\\n\\t\\t\\t\\t{#each textPages[index].paragraphs as p}\\r\\n\\t\\t\\t\\t\\t{p}\\r\\n\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t</div>\\r\\n\\t\\t<br />\\r\\n\\t\\t{#if overFlowing}\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\tshowMore = !showMore;\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\tclass=\\"bu-level bu-is-mobile\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t<div class=\\"bu-level-left\\">\\r\\n\\t\\t\\t\\t\\t<p class=\\"bu-level-left bu-level-item\\">Read More</p>\\r\\n\\t\\t\\t\\t\\t<span class=\\"bu-level-left bu-level-item bu-icon bu-is-small\\">\\r\\n\\t\\t\\t\\t\\t\\t<Arrow styleP=\\"height:16px; width:16px;\\" showMore=\\"{showMore}\\" />\\r\\n\\t\\t\\t\\t\\t</span>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{/if}\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.main-image {\\n  object-fit: cover;\\n}\\n\\nh5 {\\n  font-family: Orator;\\n}\\n\\n.font-white {\\n  color: white;\\n}\\n\\n.square-place-holder {\\n  width: 100%;\\n}\\n.square-place-holder img {\\n  width: 100%;\\n  object-fit: cover;\\n}\\n\\n.card-content {\\n  background-color: transparent;\\n}\\n\\n.play-button-container {\\n  position: absolute;\\n  width: 25%;\\n  top: 50%;\\n  /* position the top  edge of the element at the middle of the parent */\\n  left: 50%;\\n  /* position the left edge of the element at the middle of the parent */\\n  transform: translate(-50%, -50%);\\n  height: auto;\\n  z-index: 5;\\n  object-fit: cover;\\n}\\n\\n.content {\\n  max-height: 20rem;\\n  overflow: hidden;\\n  display: -webkit-box;\\n  -webkit-line-clamp: 4;\\n  -webkit-box-orient: vertical;\\n}\\n\\n.card-container {\\n  display: flex;\\n  flex-direction: column;\\n  background-color: transparent;\\n}\\n.card-container:nth-child(4) .show-more {\\n  display: none !important;\\n}\\n\\n.blur {\\n  left: 0;\\n  right: 0;\\n  z-index: 0;\\n  position: relative;\\n}\\n.blur::before {\\n  pointer-events: none;\\n  position: absolute;\\n  content: \\"\\";\\n  height: 100%;\\n  display: block;\\n  left: 0;\\n  right: 0;\\n  top: 0;\\n  z-index: 2;\\n  -webkit-backdrop-filter: blur(5px);\\n  backdrop-filter: blur(5px);\\n}\\n@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {\\n  .blur::before {\\n    background: rgba(0, 0, 0, 0.5);\\n  }\\n}\\n\\n.show-more {\\n  display: block;\\n  max-height: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AAuGmB,WAAW,4BAAC,CAAC,AAC9B,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,EAAE,4BAAC,CAAC,AACF,WAAW,CAAE,MAAM,AACrB,CAAC,AAED,WAAW,4BAAC,CAAC,AACX,KAAK,CAAE,KAAK,AACd,CAAC,AAED,oBAAoB,4BAAC,CAAC,AACpB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,kCAAoB,CAAC,GAAG,cAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,aAAa,4BAAC,CAAC,AACb,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,sBAAsB,4BAAC,CAAC,AACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,GAAG,CACV,GAAG,CAAE,GAAG,CAER,IAAI,CAAE,GAAG,CAET,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,QAAQ,4BAAC,CAAC,AACR,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,WAAW,CACpB,kBAAkB,CAAE,CAAC,CACrB,kBAAkB,CAAE,QAAQ,AAC9B,CAAC,AAED,eAAe,4BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AACD,6BAAe,WAAW,CAAC,CAAC,CAAC,UAAU,cAAC,CAAC,AACvC,OAAO,CAAE,IAAI,CAAC,UAAU,AAC1B,CAAC,AAED,KAAK,4BAAC,CAAC,AACL,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,iCAAK,QAAQ,AAAC,CAAC,AACb,cAAc,CAAE,IAAI,CACpB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,KAAK,CACd,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,CAAC,CACV,uBAAuB,CAAE,KAAK,GAAG,CAAC,CAClC,eAAe,CAAE,KAAK,GAAG,CAAC,AAC5B,CAAC,AACD,UAAU,GAAG,CAAC,CAAC,CAAC,yBAAyB,IAAI,CAAC,CAAC,EAAE,CAAC,CAAC,iBAAiB,IAAI,CAAC,CAAC,AAAC,CAAC,AAC1E,iCAAK,QAAQ,AAAC,CAAC,AACb,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AAChC,CAAC,AACH,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,AAClB,CAAC"}`
};
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { index: index2 } = $$props;
  let { image } = $$props;
  let { type } = $$props;
  let mainText;
  onDestroy(() => {
  });
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.image === void 0 && $$bindings.image && image !== void 0)
    $$bindings.image(image);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$5);
  $$unsubscribe_modal();
  return `<div class="${"bu-card card-container svelte-jwm8jv"}"${add_attribute("id", navToLink[index2 + 1], 0)}><div class="${"bu-card-image"}"><figure class="${"bu-image bu-is-4by3 " + escape(type === "video" ? "blur" : "") + " svelte-jwm8jv"}">${type === "video" ? `<div class="${"play-button-container svelte-jwm8jv"}"><figure class="${"bu-image bu-is-square "}"><img src="${"playButton.png"}" alt="${""}"></figure></div>` : ``}
			<img loading="${"lazy"}" class="${"main-image svelte-jwm8jv"}"${add_attribute("src", image.url, 0)} alt="${""}"></figure></div>
	<div class="${"card-content bu-card-content svelte-jwm8jv"}"><div class="${"bu-media"}"><div class="${"bu-media-left"}"><figure class="${"bu-image bu-is-48x48"}"><div class="${"square-place-holder svelte-jwm8jv"}" style="${"height: 100%; width:100%;"}"><img src="${"mobile-logo.png"}" alt="${""}" class="${"svelte-jwm8jv"}"></div></figure></div>
			${textPages[index2] ? `<h5 class="${"title is-4 font-white svelte-jwm8jv"}">${escape(textPages[index2].header)}</h5>` : ``}</div>
		<div class="${"content bu-is-clipped content font-white " + escape("") + " svelte-jwm8jv"}"${add_attribute("this", mainText, 0)}>${textPages[index2] ? `${each(textPages[index2].paragraphs, (p) => `${escape(p)}`)}` : ``}</div>
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
    return current_value.map((_2, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
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
  map: `{"version":3,"file":"CardCarousel.svelte","sources":["CardCarousel.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { browser } from '$app/env';\\r\\n\\timport Glide from '@glidejs/glide';\\r\\n\\timport { onDestroy, onMount } from 'svelte';\\r\\n\\timport { navToLink, textPages } from '../../pageContent';\\r\\n\\timport { DragGesture } from '@use-gesture/vanilla';\\r\\n\\timport { spring } from 'svelte/motion';\\r\\n\\r\\n\\timport Arrow from '../Card/Arrow.svelte';\\r\\n\\timport PinchZoom from '../PinchZoom.svelte';\\r\\n\\texport let index;\\r\\n\\texport let page;\\r\\n\\texport let images;\\r\\n\\timages = images.filter((item) => {\\r\\n\\t\\treturn item.url;\\r\\n\\t});\\r\\n\\tlet carousel;\\r\\n\\tlet glide;\\r\\n\\tlet showMore = false;\\r\\n\\tlet slider;\\r\\n\\tlet overFlowing;\\r\\n\\tlet mainText;\\r\\n\\tlet shouldDrag = true;\\r\\n\\tlet glideContainer;\\r\\n\\tlet currInd = 0;\\r\\n\\r\\n\\tlet carouselWidth;\\r\\n\\tlet sliderThresh = 80;\\r\\n\\r\\n\\tconst xVal = spring(0, { stiffness: 0.1, damping: 0.89 });\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tcarouselWidth = carousel.offsetWidth * images.length;\\r\\n\\t\\tnew DragGesture(\\r\\n\\t\\t\\tslider,\\r\\n\\t\\t\\t({ direction, movement, down }) => {\\r\\n\\t\\t\\t\\tif (shouldDrag) {\\r\\n\\t\\t\\t\\t\\txVal.set((carousel.offsetWidth + 10) * currInd * -1 + movement[0]);\\r\\n\\r\\n\\t\\t\\t\\t\\tif (!down) {\\r\\n\\t\\t\\t\\t\\t\\tif (\\r\\n\\t\\t\\t\\t\\t\\t\\tMath.abs(movement[0]) > sliderThresh &&\\r\\n\\t\\t\\t\\t\\t\\t\\tcurrInd === images.length - 1 &&\\r\\n\\t\\t\\t\\t\\t\\t\\tmovement[0] < 0\\r\\n\\t\\t\\t\\t\\t\\t) {\\r\\n\\t\\t\\t\\t\\t\\t\\txVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\r\\n\\t\\t\\t\\t\\t\\t\\treturn;\\r\\n\\t\\t\\t\\t\\t\\t}\\r\\n\\t\\t\\t\\t\\t\\tif (Math.abs(movement[0]) > sliderThresh && currInd === 0 && movement[0] > 0) {\\r\\n\\t\\t\\t\\t\\t\\t\\txVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\r\\n\\t\\t\\t\\t\\t\\t\\treturn;\\r\\n\\t\\t\\t\\t\\t\\t}\\r\\n\\t\\t\\t\\t\\t\\tif (Math.abs(movement[0]) > sliderThresh) {\\r\\n\\t\\t\\t\\t\\t\\t\\tif (movement[0] < -1) {\\r\\n\\t\\t\\t\\t\\t\\t\\t\\tcurrInd += 1;\\r\\n\\t\\t\\t\\t\\t\\t\\t} else {\\r\\n\\t\\t\\t\\t\\t\\t\\t\\tcurrInd -= 1;\\r\\n\\t\\t\\t\\t\\t\\t\\t}\\r\\n\\r\\n\\t\\t\\t\\t\\t\\t\\txVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\t\\t\\t\\t\\t\\t} else {\\r\\n\\t\\t\\t\\t\\t\\t\\txVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\t\\t\\t\\t\\t\\t}\\r\\n\\t\\t\\t\\t\\t}\\r\\n\\t\\t\\t\\t}\\r\\n\\t\\t\\t},\\r\\n\\t\\t\\t{\\r\\n\\t\\t\\t\\tpointer: {\\r\\n\\t\\t\\t\\t\\ttouch: true\\r\\n\\t\\t\\t\\t}\\r\\n\\t\\t\\t}\\r\\n\\t\\t);\\r\\n\\t\\tglide = new Glide(carousel, {\\r\\n\\t\\t\\tswipeThreshold: false,\\r\\n\\t\\t\\tdragThreshold: false\\r\\n\\t\\t});\\r\\n\\t\\tglide.mount({\\r\\n\\t\\t\\tResize: function (Glide, Components, Events) {\\r\\n\\t\\t\\t\\treturn {};\\r\\n\\t\\t\\t}\\r\\n\\t\\t});\\r\\n\\t\\tif (browser) {\\r\\n\\t\\t\\twindow.addEventListener('resize', resize);\\r\\n\\t\\t}\\r\\n\\r\\n\\t\\tresize();\\r\\n\\t\\txVal.subscribe((v) => {\\r\\n\\t\\t\\tslider.style.transform = \`translate(\${v}px,0px)\`;\\r\\n\\t\\t});\\r\\n\\t});\\r\\n\\tfunction resize() {\\r\\n\\t\\tcarouselWidth = carousel.offsetWidth;\\r\\n\\t\\tslider.style.width = carousel.offsetWidth * (images.length + 1) * 5 + 'px';\\r\\n\\t\\tcarousel.style.width = xVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\t\\tif (mainText.scrollHeight > mainText.clientHeight) {\\r\\n\\t\\t\\toverFlowing = true;\\r\\n\\t\\t} else {\\r\\n\\t\\t\\toverFlowing = false;\\r\\n\\t\\t}\\r\\n\\t}\\r\\n\\r\\n\\tonDestroy(() => {\\r\\n\\t\\tif (browser) {\\r\\n\\t\\t\\twindow.removeEventListener('resize', resize);\\r\\n\\t\\t}\\r\\n\\t});\\r\\n\\r\\n\\t$: {\\r\\n\\t\\tif (glide) {\\r\\n\\t\\t\\tif (!shouldDrag) {\\r\\n\\t\\t\\t\\tglide.disable();\\r\\n\\t\\t\\t} else {\\r\\n\\t\\t\\t\\tglide.enable();\\r\\n\\t\\t\\t}\\r\\n\\t\\t}\\r\\n\\t}\\r\\n\\tconst handleCarousel = (val) => {\\r\\n\\t\\tif (currInd === 0 && val === -1) {\\r\\n\\t\\t\\treturn;\\r\\n\\t\\t} else if (currInd === images.length - 1 && val === 1) {\\r\\n\\t\\t\\treturn;\\r\\n\\t\\t} else {\\r\\n\\t\\t\\tcurrInd += val;\\r\\n\\t\\t\\txVal.set(-currInd * (carousel.offsetWidth + 10));\\r\\n\\t\\t}\\r\\n\\t};\\r\\n<\/script>\\r\\n\\r\\n<div id=\\"{navToLink[index + 2]}\\" class=\\"bu-card card-container\\">\\r\\n\\t<div class=\\"carousel-container\\">\\r\\n\\t\\t<div bind:this=\\"{carousel}\\" class=\\"glide\\">\\r\\n\\t\\t\\t<div class=\\"indicator\\">\\r\\n\\t\\t\\t\\t{#if glide}\\r\\n\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t{currInd + 1}/{images.length}\\r\\n\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t{/if}\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"glide__track\\" data-glide-el=\\"track\\">\\r\\n\\t\\t\\t\\t<ul bind:this=\\"{slider}\\" class=\\"glide__slides\\">\\r\\n\\t\\t\\t\\t\\t{#each images as img, i}\\r\\n\\t\\t\\t\\t\\t\\t<li\\r\\n\\t\\t\\t\\t\\t\\t\\tstyle=\\"width:{glideContainer ? carouselWidth : ''}px\\"\\r\\n\\t\\t\\t\\t\\t\\t\\tbind:this=\\"{glideContainer}\\"\\r\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"glide__slide\\"\\r\\n\\t\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"glide-image-container\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<PinchZoom\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\ton:pinch=\\"{(e) => {\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tshouldDrag = !e.detail;\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\timg=\\"{img.url}\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"glide__arrows\\" data-glide-el=\\"controls\\">\\r\\n\\t\\t\\t\\t<button\\r\\n\\t\\t\\t\\t\\tclass=\\"glide__arrow page-arrow-container glide__arrow--left arrow-left\\"\\r\\n\\t\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\t\\thandleCarousel(-1);\\r\\n\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t<div class=\\"page-arrow-relative\\">\\r\\n\\t\\t\\t\\t\\t\\t<Arrow\\r\\n\\t\\t\\t\\t\\t\\t\\tstyleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n\\t\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t\\t</div></button\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t<button\\r\\n\\t\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\t\\thandleCarousel(1);\\r\\n\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t\\tclass=\\"glide__arrow  page-arrow-container glide__arrow--right arrow-right\\"\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t<div class=\\"page-arrow-relative\\">\\r\\n\\t\\t\\t\\t\\t\\t<Arrow\\r\\n\\t\\t\\t\\t\\t\\t\\tstyleP=\\"object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; \\"\\r\\n\\t\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n\\t<div class=\\"card-content bu-card-content\\">\\r\\n\\t\\t<div class=\\"bu-media\\">\\r\\n\\t\\t\\t<div class=\\"bu-media-left\\">\\r\\n\\t\\t\\t\\t<figure class=\\"bu-image bu-is-48x48\\">\\r\\n\\t\\t\\t\\t\\t<div class=\\"square-place-holder\\" style=\\" height: 100%; width:100%;\\">\\r\\n\\t\\t\\t\\t\\t\\t<img src=\\"mobile-logo.png\\" alt=\\"\\" />\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</figure>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t{#if textPages[index]}\\r\\n\\t\\t\\t\\t<h5 class=\\"title is-4 font-white\\">\\r\\n\\t\\t\\t\\t\\t{textPages[index].header}\\r\\n\\t\\t\\t\\t</h5>\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t</div>\\r\\n\\t\\t<div\\r\\n\\t\\t\\tbind:this=\\"{mainText}\\"\\r\\n\\t\\t\\tclass=\\"content bu-is-clipped content font-white {showMore ? 'show-more' : ''}\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t{#if textPages[index]}\\r\\n\\t\\t\\t\\t{#each textPages[index].paragraphs as p}\\r\\n\\t\\t\\t\\t\\t<p>{p}</p>\\r\\n\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t</div>\\r\\n\\t\\t<br />\\r\\n\\t\\t{#if overFlowing}\\r\\n\\t\\t\\t<div\\r\\n\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\tshowMore = !showMore;\\r\\n\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\tclass=\\"bu-level bu-is-mobile\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t<div class=\\"bu-level-left\\">\\r\\n\\t\\t\\t\\t\\t<p class=\\"bu-level-left bu-level-item\\">Read More</p>\\r\\n\\t\\t\\t\\t\\t<span class=\\"bu-level-left bu-level-item bu-icon bu-is-small\\">\\r\\n\\t\\t\\t\\t\\t\\t<Arrow styleP=\\"height:16px; width:16px;\\" showMore=\\"{showMore}\\" />\\r\\n\\t\\t\\t\\t\\t</span>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{/if}\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.page-arrow-container {\\n  width: 30px;\\n  height: 30px;\\n  position: absolute;\\n  border-radius: 50%;\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: none;\\n  overflow: hidden;\\n}\\n.page-arrow-container .page-arrow-relative {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  bottom: 0;\\n  right: 0;\\n  padding: 5px;\\n  margin: auto;\\n}\\n\\n.indicator {\\n  z-index: 3;\\n  font-weight: 600;\\n  text-align: center;\\n  letter-spacing: 0.2em;\\n  bottom: 5px;\\n  left: 5px;\\n  position: absolute;\\n  padding: 5px 15px;\\n  border-radius: 14px;\\n  background-color: black;\\n  color: white;\\n  display: flex;\\n  justify-content: center;\\n}\\n.indicator p {\\n  margin-right: -0.2em;\\n}\\n\\n.square-place-holder {\\n  width: 100%;\\n  height: 100%;\\n}\\n.square-place-holder img {\\n  width: 100%;\\n  height: 100%;\\n  object-fit: cover;\\n}\\n\\nh5 {\\n  font-family: Orator;\\n}\\n\\n.font-white {\\n  color: white;\\n}\\n\\n.card-content {\\n  background-color: transparent;\\n}\\n\\n.content {\\n  max-height: 20rem;\\n  overflow: hidden;\\n  display: -webkit-box;\\n  -webkit-line-clamp: 4;\\n  -webkit-box-orient: vertical;\\n}\\n\\n.card-container {\\n  display: flex;\\n  flex-direction: column;\\n  background-color: transparent;\\n}\\n\\n.carousel-container .glide-image-container {\\n  display: flex;\\n  padding-bottom: 100%;\\n  height: 0;\\n  position: relative;\\n  justify-content: center;\\n}\\n\\n.page-arrow-container {\\n  width: 30px;\\n  border-radius: 50%;\\n  position: absolute;\\n  border: none;\\n  overflow: hidden;\\n  height: 30px;\\n  bottom: 0;\\n}\\n\\n.arrow-left {\\n  right: 40px;\\n  bottom: 5px;\\n}\\n\\n.show-more {\\n  display: block;\\n  max-height: 100%;\\n}\\n\\n.arrow-right {\\n  transform: rotate(180deg);\\n  right: 5px;\\n  bottom: 5px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAwOmB,qBAAqB,8BAAC,CAAC,AACxC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,oCAAqB,CAAC,oBAAoB,eAAC,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,IAAI,AACd,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,KAAK,CACrB,MAAM,CAAE,GAAG,CACX,IAAI,CAAE,GAAG,CACT,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,yBAAU,CAAC,CAAC,eAAC,CAAC,AACZ,YAAY,CAAE,MAAM,AACtB,CAAC,AAED,oBAAoB,8BAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,mCAAoB,CAAC,GAAG,eAAC,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,WAAW,CAAE,MAAM,AACrB,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,KAAK,CAAE,KAAK,AACd,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,QAAQ,8BAAC,CAAC,AACR,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,WAAW,CACpB,kBAAkB,CAAE,CAAC,CACrB,kBAAkB,CAAE,QAAQ,AAC9B,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,kCAAmB,CAAC,sBAAsB,eAAC,CAAC,AAC1C,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,IAAI,CACpB,MAAM,CAAE,CAAC,CACT,QAAQ,CAAE,QAAQ,CAClB,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,CAChB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,CAAC,AACX,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,AACb,CAAC,AAED,UAAU,8BAAC,CAAC,AACV,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,SAAS,CAAE,OAAO,MAAM,CAAC,CACzB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
const CardCarousel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { index: index2 } = $$props;
  let { page } = $$props;
  let { images: images2 } = $$props;
  images2 = images2.filter((item) => {
    return item.url;
  });
  let carousel;
  let slider;
  let mainText;
  let glideContainer;
  spring(0, { stiffness: 0.1, damping: 0.89 });
  onDestroy(() => {
  });
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.images === void 0 && $$bindings.images && images2 !== void 0)
    $$bindings.images(images2);
  $$result.css.add(css$3);
  return `<div${add_attribute("id", navToLink[index2 + 2], 0)} class="${"bu-card card-container svelte-15wnr6z"}"><div class="${"carousel-container svelte-15wnr6z"}"><div class="${"glide"}"${add_attribute("this", carousel, 0)}><div class="${"indicator svelte-15wnr6z"}">${``}</div>
			<div class="${"glide__track"}" data-glide-el="${"track"}"><ul class="${"glide__slides"}"${add_attribute("this", slider, 0)}>${each(images2, (img, i) => `<li style="${"width:" + escape("") + "px"}" class="${"glide__slide"}"${add_attribute("this", glideContainer, 0)}><div class="${"glide-image-container svelte-15wnr6z"}">${validate_component(PinchZoom, "PinchZoom").$$render($$result, { img: img.url }, {}, {})}</div>
						</li>`)}</ul></div>
			<div class="${"glide__arrows"}" data-glide-el="${"controls"}"><button class="${"glide__arrow page-arrow-container glide__arrow--left arrow-left svelte-15wnr6z"}"><div class="${"page-arrow-relative svelte-15wnr6z"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button>
				<button class="${"glide__arrow page-arrow-container glide__arrow--right arrow-right svelte-15wnr6z"}"><div class="${"page-arrow-relative svelte-15wnr6z"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button></div></div></div>
	<div class="${"card-content bu-card-content svelte-15wnr6z"}"><div class="${"bu-media"}"><div class="${"bu-media-left"}"><figure class="${"bu-image bu-is-48x48"}"><div class="${"square-place-holder svelte-15wnr6z"}" style="${"height: 100%; width:100%;"}"><img src="${"mobile-logo.png"}" alt="${""}" class="${"svelte-15wnr6z"}"></div></figure></div>
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
  map: `{"version":3,"file":"CardGallery.svelte","sources":["CardGallery.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { highResBts } from '../../pageContent';\\r\\n\\timport { modal } from '../../stores';\\r\\n\\timport { images } from '../Gallery/galleryImages';\\r\\n\\timport { galleryImg } from '../GalleryPreview/store';\\r\\n\\texport let data;\\r\\n<\/script>\\r\\n\\r\\n<div>\\r\\n\\t<div id=\\"behind-the-scenes\\" class=\\"container\\">\\r\\n\\t\\t<div><h5 class=\\"bu-title bu-has-text-centered\\">behind the scenes</h5></div>\\r\\n\\t\\t<div class=\\"curr-phase-container\\">\\r\\n\\t\\t\\t{#each data.phases as phase, i}\\r\\n\\t\\t\\t\\t<h5\\r\\n\\t\\t\\t\\t\\tclass:phase-label=\\"{$galleryImg.currPhase === i}\\"\\r\\n\\t\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\t\\t$galleryImg.currPhase = i;\\r\\n\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\tphase {i + 1}\\r\\n\\t\\t\\t\\t</h5>\\r\\n\\t\\t\\t{/each}\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"gallery-container\\">\\r\\n\\t\\t\\t{#each data.phases[$galleryImg.currPhase].images as image, i}\\r\\n\\t\\t\\t\\t<div class=\\"image-container\\">\\r\\n\\t\\t\\t\\t\\t<img\\r\\n\\t\\t\\t\\t\\t\\tsrc=\\"{image.url}\\"\\r\\n\\t\\t\\t\\t\\t\\ton:click=\\"{() => {\\r\\n\\t\\t\\t\\t\\t\\t\\t$modal.visibility = true;\\r\\n\\t\\t\\t\\t\\t\\t\\t$modal.content = $galleryImg.selected;\\r\\n\\t\\t\\t\\t\\t\\t\\t$modal.type = 'image';\\r\\n\\t\\t\\t\\t\\t\\t}}\\"\\r\\n\\t\\t\\t\\t\\t\\tloading=\\"lazy\\"\\r\\n\\t\\t\\t\\t\\t\\talt=\\"\\"\\r\\n\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t</div>{/each}\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  max-height: 500px;\\n  overflow: hidden;\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n  flex-direction: column;\\n  align-items: center;\\n  padding: 20px;\\n  gap: 20px;\\n  margin-bottom: 20px;\\n}\\n\\n.curr-phase-container {\\n  display: flex;\\n  color: white;\\n  gap: 10px;\\n  text-transform: uppercase;\\n}\\n.curr-phase-container h5 {\\n  cursor: pointer;\\n}\\n.curr-phase-container .phase-label::after {\\n  content: \\"\\";\\n  display: block;\\n  width: 100%;\\n  height: 1px;\\n  background-color: white;\\n}\\n\\n@keyframes example {\\n  0% {\\n    opacity: 0;\\n  }\\n  100% {\\n    width: 100%;\\n  }\\n}\\n.bu-title {\\n  font-family: Orator;\\n  color: white;\\n  font-weight: 200;\\n}\\n\\n.gallery-container {\\n  display: grid;\\n  width: 100%;\\n  gap: 6px;\\n  overflow-y: auto;\\n  grid-template-columns: repeat(4, minmax(50px, 1fr));\\n}\\n\\n.image-container {\\n  position: relative;\\n  padding-bottom: 100%;\\n}\\n.image-container img {\\n  height: 100%;\\n  object-fit: cover;\\n  width: 100%;\\n  border-radius: 4px;\\n  animation-fill-mode: forwards;\\n  position: absolute;\\n}</style>\\r\\n"],"names":[],"mappings":"AAyCmB,UAAU,4BAAC,CAAC,AAC7B,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,CACT,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,qBAAqB,4BAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,KAAK,CACZ,GAAG,CAAE,IAAI,CACT,cAAc,CAAE,SAAS,AAC3B,CAAC,AACD,mCAAqB,CAAC,EAAE,cAAC,CAAC,AACxB,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,mCAAqB,CAAC,0BAAY,OAAO,AAAC,CAAC,AACzC,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,WAAW,qBAAQ,CAAC,AAClB,EAAE,AAAC,CAAC,AACF,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,SAAS,4BAAC,CAAC,AACT,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,kBAAkB,4BAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,GAAG,CAAE,GAAG,CACR,UAAU,CAAE,IAAI,CAChB,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,OAAO,IAAI,CAAC,CAAC,GAAG,CAAC,CAAC,AACrD,CAAC,AAED,gBAAgB,4BAAC,CAAC,AAChB,QAAQ,CAAE,QAAQ,CAClB,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,8BAAgB,CAAC,GAAG,cAAC,CAAC,AACpB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,mBAAmB,CAAE,QAAQ,CAC7B,QAAQ,CAAE,QAAQ,AACpB,CAAC"}`
};
const CardGallery = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  let $$unsubscribe_modal;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css$1);
  $$unsubscribe_galleryImg();
  $$unsubscribe_modal();
  return `<div><div id="${"behind-the-scenes"}" class="${"container svelte-iyyz4g"}"><div><h5 class="${"bu-title bu-has-text-centered svelte-iyyz4g"}">behind the scenes</h5></div>
		<div class="${"curr-phase-container svelte-iyyz4g"}">${each(data.phases, (phase, i) => `<h5 class="${["svelte-iyyz4g", $galleryImg.currPhase === i ? "phase-label" : ""].join(" ").trim()}">phase ${escape(i + 1)}
				</h5>`)}</div>
		<div class="${"gallery-container svelte-iyyz4g"}">${each(data.phases[$galleryImg.currPhase].images, (image, i) => `<div class="${"image-container svelte-iyyz4g"}"><img${add_attribute("src", image.url, 0)} loading="${"lazy"}" alt="${""}" class="${"svelte-iyyz4g"}">
				</div>`)}</div></div>
</div>`;
});
var CardContainer_svelte_svelte_type_style_lang = "";
const css = {
  code: ".bg-image-container.svelte-1fu2nnh.svelte-1fu2nnh{position:absolute;z-index:1;width:100%;height:100%}.bg-image-container.svelte-1fu2nnh .bg-image.svelte-1fu2nnh{width:100%;object-fit:cover;height:100%}.contact-us-container.svelte-1fu2nnh.svelte-1fu2nnh{width:100%;padding:30px;height:100vh}.card-container.svelte-1fu2nnh.svelte-1fu2nnh{position:relative;background-color:#2c2a2b}.logo-wrapper.svelte-1fu2nnh.svelte-1fu2nnh{z-index:2;position:relative;width:100vw;height:100vh;display:flex;justify-content:center;align-items:center}.logo-wrapper.svelte-1fu2nnh .logo-container.svelte-1fu2nnh{max-width:55%}.logo-wrapper.svelte-1fu2nnh .logo-container .image-logo.svelte-1fu2nnh{object-fit:contain;width:100%}",
  map: `{"version":3,"file":"CardContainer.svelte","sources":["CardContainer.svelte"],"sourcesContent":["\uFEFF<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\r\\n\\timport Card from '../Card/Card.svelte';\\r\\n\\timport CardCarousel from '../CardCarousel/CardCarousel.svelte';\\r\\n\\timport CardCredits from '../CardCredits/CardCredits.svelte';\\r\\n\\timport CardGallery from '../CardGallery/CardGallery.svelte';\\r\\n\\timport ContactUs from '../ContactUs/ContactUs.svelte';\\r\\n\\r\\n\\tlet cardLayout = [];\\r\\n\\tonMount(async () => {\\r\\n\\t\\tconst res = await fetch('http://localhost:3000/api/mobile');\\r\\n\\t\\tconst data = await res.json();\\r\\n\\t\\tcardLayout = data;\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"card-wrapper\\">\\r\\n\\t<div class=\\"bg-image-container\\">\\r\\n\\t\\t<img class=\\"bg-image\\" src=\\"horses.jpg\\" alt=\\"\\" />\\r\\n\\t</div>\\r\\n\\t<div id=\\"home\\" class=\\"logo-wrapper\\">\\r\\n\\t\\t<div class=\\"logo-container\\">\\r\\n\\t\\t\\t<img class=\\"image-logo\\" src=\\"homeLogo.png\\" alt=\\"\\" />\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n\\t<div class=\\"card-container\\">\\r\\n\\t\\t{#each cardLayout as card, i}\\r\\n\\t\\t\\t{#if cardLayout[i].type === 'bg-image' || cardLayout[i].type === 'video'}\\r\\n\\t\\t\\t\\t<Card\\r\\n\\t\\t\\t\\t\\ttype=\\"{card.type}\\"\\r\\n\\t\\t\\t\\t\\timage=\\"{card.images.filter((item) => {\\r\\n\\t\\t\\t\\t\\t\\treturn item.url;\\r\\n\\t\\t\\t\\t\\t})[0]}\\"\\r\\n\\t\\t\\t\\t\\tpage=\\"{card}\\"\\r\\n\\t\\t\\t\\t\\tindex=\\"{i}\\"\\r\\n\\t\\t\\t\\t/>\\r\\n\\t\\t\\t{:else if cardLayout[i].type === 'gallery'}\\r\\n\\t\\t\\t\\t<CardGallery data=\\"{card}\\" />\\r\\n\\t\\t\\t{:else}\\r\\n\\t\\t\\t\\t<CardCarousel images=\\"{card.images}\\" page=\\"{card}\\" index=\\"{i}\\" />\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t{/each}\\r\\n\\t\\t<CardCredits />\\r\\n\\t\\t<div id=\\"contact\\" class=\\"contact-us-container\\">\\r\\n\\t\\t\\t<ContactUs />\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.bg-image-container {\\n  position: absolute;\\n  z-index: 1;\\n  width: 100%;\\n  height: 100%;\\n}\\n.bg-image-container .bg-image {\\n  width: 100%;\\n  object-fit: cover;\\n  height: 100%;\\n}\\n\\n.contact-us-container {\\n  width: 100%;\\n  padding: 30px;\\n  height: 100vh;\\n}\\n\\n.card-container {\\n  position: relative;\\n  background-color: #2c2a2b;\\n}\\n\\n.logo-wrapper {\\n  z-index: 2;\\n  position: relative;\\n  width: 100vw;\\n  height: 100vh;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}\\n.logo-wrapper .logo-container {\\n  max-width: 55%;\\n}\\n.logo-wrapper .logo-container .image-logo {\\n  object-fit: contain;\\n  width: 100%;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkDmB,mBAAmB,8BAAC,CAAC,AACtC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACD,kCAAmB,CAAC,SAAS,eAAC,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,AACf,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,QAAQ,CAAE,QAAQ,CAClB,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,4BAAa,CAAC,eAAe,eAAC,CAAC,AAC7B,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,4BAAa,CAAC,eAAe,CAAC,WAAW,eAAC,CAAC,AACzC,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,AACb,CAAC"}`
};
const CardContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cardLayout = [];
  $$result.css.add(css);
  return `<div class="${"card-wrapper"}"><div class="${"bg-image-container svelte-1fu2nnh"}"><img class="${"bg-image svelte-1fu2nnh"}" src="${"horses.jpg"}" alt="${""}"></div>
	<div id="${"home"}" class="${"logo-wrapper svelte-1fu2nnh"}"><div class="${"logo-container svelte-1fu2nnh"}"><img class="${"image-logo svelte-1fu2nnh"}" src="${"homeLogo.png"}" alt="${""}"></div></div>
	<div class="${"card-container svelte-1fu2nnh"}">${each(cardLayout, (card, i) => `${cardLayout[i].type === "bg-image" || cardLayout[i].type === "video" ? `${validate_component(Card, "Card").$$render($$result, {
    type: card.type,
    image: card.images.filter((item) => {
      return item.url;
    })[0],
    page: card,
    index: i
  }, {}, {})}` : `${cardLayout[i].type === "gallery" ? `${validate_component(CardGallery, "CardGallery").$$render($$result, { data: card }, {}, {})}` : `${validate_component(CardCarousel, "CardCarousel").$$render($$result, {
    images: card.images,
    page: card,
    index: i
  }, {}, {})}`}`}`)}
		${validate_component(CardCredits, "CardCredits").$$render($$result, {}, {}, {})}
		<div id="${"contact"}" class="${"contact-us-container svelte-1fu2nnh"}">${validate_component(ContactUs, "ContactUs").$$render($$result, {}, {}, {})}</div></div>
</div>`;
});
const prerender = true;
async function load({ params, fetch: fetch2, session, stuff }) {
  const imagePages = await fetch2("http://localhost:3000/api/bg-pages");
  const carouselRenders = await fetch2("http://localhost:3000/api/carousel-renders");
  const pageCarousels = await fetch2("http://localhost:3000/api/page-carousels");
  const bts = await fetch2("http://localhost:3000/api/behind-the-scenes");
  pageLayout["image-pages"] = await imagePages.json();
  pageLayout["carousel-renders"] = await carouselRenders.json();
  pageLayout["page-carousels"] = await pageCarousels.json();
  pageLayout["bts"] = await bts.json();
  galleryImg.update((s2) => {
    s2.imageToDisplay = pageLayout["bts"][0].images[0].url;
    return s2;
  });
  function isObjectOrArray(item) {
    return _.isPlainObject(item) || Array.isArray(item);
  }
  const arr2 = [];
  let shouldExit = false;
  function changeUrls(obj) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        changeUrls(item);
      }
      return;
    }
    if (!isObjectOrArray(obj)) {
      return;
    } else {
      if (obj.url) {
        shouldExit = true;
        arr2.push(obj);
        return;
      } else {
        for (const key in obj) {
          if (isObjectOrArray(obj[key])) {
            if (shouldExit) {
              continue;
            } else {
              changeUrls(obj[key]);
              shouldExit = false;
            }
          }
        }
      }
    }
    return arr2;
  }
  function changeAllUrls(urls) {
    urls.map((item) => {
      item.url = item.url.replace("http://localhost:3000/mock-bb-storage/", "main-images/");
    });
  }
  changeAllUrls(changeUrls(pageLayout));
  return {
    status: 200,
    props: { pagesData: { imagePages } }
  };
}
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pagesData } = $$props;
  onDestroy(() => {
  });
  if ($$props.pagesData === void 0 && $$bindings.pagesData && pagesData !== void 0)
    $$bindings.pagesData(pagesData);
  return `<div>${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})}

	${validate_component(ScrollContainer, "ScrollContainer").$$render($$result, { pageLayout: pagesData }, {}, {})}

	${validate_component(CardContainer, "CardContainer").$$render($$result, {}, {}, {})}

	${validate_component(Modal, "Modal").$$render($$result, {}, {}, {})}
	${validate_component(Socials, "Socials").$$render($$result, {}, {}, {})}
</div>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender,
  load
});
export { init, render };
