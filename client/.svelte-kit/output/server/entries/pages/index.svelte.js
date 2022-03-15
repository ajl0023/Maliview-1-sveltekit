import { n as noop, a as safe_not_equal, c as create_ssr_component, b as subscribe, e as escape, d as add_attribute, f as each, v as validate_component, g as compute_rest_props, h as spread, i as escape_object, j as createEventDispatcher, o as onDestroy, k as now, l as loop } from "../../chunks/index-d30cef5f.js";
import _ from "lodash";
import "@glidejs/glide";
import "vanilla-lazyload";
import "@use-gesture/vanilla";
import "../../chunks/host-ef40cb6e.js";
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
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
  function subscribe2(run, invalidate = noop) {
    const subscriber = [run, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run(value);
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
  imageToDisplay: null
});
var Modal_svelte_svelte_type_style_lang = "";
const css$n = {
  code: ".video-container.svelte-1uwzqqj .video-modal.svelte-1uwzqqj{position:absolute;top:0;bottom:0;left:0;right:0;height:100%;width:100%}img.svelte-1uwzqqj.svelte-1uwzqqj{width:100%;object-fit:cover;height:100%}",
  map: null
};
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $modal, $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => $modal = value);
  $$result.css.add(css$n);
  $$unsubscribe_modal();
  return `<div class="${"bu-modal " + escape($modal.visibility ? "bu-is-active" : "")}"><div class="${"bu-modal-background"}"></div>
	<div class="${"bu-modal-content"}"><div class="${"bu-image bu-is-4by3"}">${$modal.type === "video" && $modal.content ? `<div class="${"video-container svelte-1uwzqqj"}"><iframe height="${"100%"}" class="${"video-modal svelte-1uwzqqj"}" width="${"100%"}"${add_attribute("src", function() {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = $modal.content.match(regExp);
    if (match && match[2].length == 11) {
      return "https://www.youtube.com/embed/" + match[2];
    } else {
      return "error";
    }
  }(), 0)} title="${"YouTube video player"}" frameborder="${"0"}" allow="${"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}" allowfullscreen></iframe></div>` : `${$modal.content ? `<img${add_attribute("src", $modal.content.url, 0)} alt="${""}" class="${"svelte-1uwzqqj"}">` : ``}`}</div></div>
	<button class="${"bu-modal-close bu-is-large"}" aria-label="${"close"}"></button>
</div>`;
});
var Hamburger_svelte_svelte_type_style_lang = "";
const css$m = {
  code: '.burger-label.svelte-1flnpmr.svelte-1flnpmr{block-size:18px;display:flex;justify-content:center;cursor:pointer;inline-size:18px;font-size:14px;line-height:21px;align-items:center}.burger-label.svelte-1flnpmr .main-trigger-icon-container.svelte-1flnpmr{position:relative;display:block;block-size:18px;inline-size:100%}.burger-label.svelte-1flnpmr .main-trigger-icon-container .main-trigger-icon.svelte-1flnpmr{background-color:white;inline-size:100%;position:absolute;display:block;transition:all 300ms ease-in-out;block-size:2px;top:calc(36% + 2px)}.burger-label.svelte-1flnpmr .main-trigger-icon-container .main-trigger-icon.svelte-1flnpmr:before{transition:all 300ms ease-in-out;block-size:2px;background-color:white;content:"";top:-5px;display:block;position:absolute;inline-size:100%}.burger-label.svelte-1flnpmr .main-trigger-icon-container .main-trigger-icon.svelte-1flnpmr:after{transition:all 300ms ease-in-out;block-size:2px;background-color:white;content:"";top:5px;display:block;position:absolute;inline-size:100%}.burger-input.svelte-1flnpmr.svelte-1flnpmr{opacity:1;display:none}.burger-input.svelte-1flnpmr:checked~.burger-label.svelte-1flnpmr{z-index:4}.burger-input:checked~.burger-label.svelte-1flnpmr .main-trigger-icon.svelte-1flnpmr{transition:all 300ms ease-in-out;background-color:transparent}.burger-input:checked~.burger-label.svelte-1flnpmr .main-trigger-icon.svelte-1flnpmr:before{top:0;z-index:4;background-color:black;transform:rotate(45deg);transition:all 300ms ease-in-out}.burger-input:checked~.burger-label.svelte-1flnpmr .main-trigger-icon.svelte-1flnpmr:after{top:0;z-index:4;background-color:black;transform:rotate(-45deg);transition:all 300ms ease-in-out}.burger-input.svelte-1flnpmr:checked~.side-menu-container.svelte-1flnpmr{background-color:white;height:100vh;bottom:0;top:0;display:flex;flex-direction:column;transition:all 400ms ease-in-out;z-index:3;left:0;position:absolute}.burger-input:checked~.side-menu-container.svelte-1flnpmr .side-menu-item-container.svelte-1flnpmr{padding:40px 8px;overflow-y:scroll;height:100%;margin-top:1.5rem}.burger-input:checked~.side-menu-container.svelte-1flnpmr .side-menu-item-container.svelte-1flnpmr::before{content:"";height:100%;width:100%;display:block;opacity:30%;background-size:200px;z-index:1;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;background-repeat:no-repeat;background-position:center center}.burger-input:checked~.side-menu-container.svelte-1flnpmr .side-menu-item-container.svelte-1flnpmr::-webkit-scrollbar{display:none}.burger-input:checked~.side-menu-container.svelte-1flnpmr .side-menu-item-container li.svelte-1flnpmr:nth-child(-n+11){font-size:23px;font-weight:600;display:flex;text-transform:uppercase;align-items:center;z-index:2;position:relative;color:black;cursor:pointer;padding:20px 110px 20px 20px;border-bottom:1px solid #d0d1d2}.burger-input.svelte-1flnpmr:checked~.header-mask.svelte-1flnpmr{position:fixed;block-size:100vh;top:0;left:0;z-index:2;bottom:0;inline-size:100%;background-color:rgba(0, 0, 0, 0.5)}.side-menu-container.svelte-1flnpmr.svelte-1flnpmr{position:relative;background-color:white;height:100vh;bottom:0;top:0;display:flex;flex-direction:column;transition:all 400ms ease-in-out;z-index:3;left:-600px;position:absolute}.side-menu-container.svelte-1flnpmr .side-menu-item-container.svelte-1flnpmr{padding:40px 8px;overflow-y:scroll;height:100%;margin-top:1.5rem}.side-menu-container.svelte-1flnpmr .side-menu-item-container.svelte-1flnpmr::before{content:"";height:100%;width:100%;display:block;opacity:30%;background-size:200px;z-index:1;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;background-repeat:no-repeat;background-position:center center}.side-menu-container.svelte-1flnpmr .side-menu-item-container.svelte-1flnpmr::-webkit-scrollbar{display:none}.side-menu-container.svelte-1flnpmr .side-menu-item-container li.svelte-1flnpmr:nth-child(-n+11){font-size:23px;font-weight:600;display:flex;text-transform:uppercase;align-items:center;z-index:2;position:relative;color:black;cursor:pointer;padding:20px 110px 20px 20px;border-bottom:1px solid #d0d1d2}.sidebar-logo-container.svelte-1flnpmr.svelte-1flnpmr{max-width:266px;margin:auto;padding:30px;z-index:2;position:relative}.sidebar-logo-container.svelte-1flnpmr img.svelte-1flnpmr{width:100%;object-fit:cover}',
  map: null
};
const Hamburger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_pagePositions;
  $$unsubscribe_pagePositions = subscribe(pagePositions, (value) => value);
  let mainInput;
  $$result.css.add(css$m);
  $$unsubscribe_pagePositions();
  return `<div><input type="${"checkbox"}" id="${"burger-trigger"}" class="${"burger-input svelte-1flnpmr"}"${add_attribute("this", mainInput, 0)}>
	<label for="${"burger-trigger"}" class="${"burger-label svelte-1flnpmr"}"><span class="${"main-trigger-icon-container svelte-1flnpmr"}"><i class="${"main-trigger-icon svelte-1flnpmr"}"></i></span></label>
	<div class="${"side-menu-container svelte-1flnpmr"}"><ul name="${"list-container"}" class="${"side-menu-item-container svelte-1flnpmr"}">${each(navButtons, (label, i) => {
    return `<li class="${"svelte-1flnpmr"}">${escape(label)}
				</li>`;
  })}</ul>
		<div class="${"sidebar-logo-container svelte-1flnpmr"}"><a href="${"https://www.apeldesign.com/"}"><img src="${"By Apel Design Black.png"}" alt="${""}" class="${"svelte-1flnpmr"}"></a></div></div>

	<div data-id="${"header-mask"}" class="${"header-mask svelte-1flnpmr"}"></div>
</div>`;
});
var Navbar_svelte_svelte_type_style_lang = "";
const css$l = {
  code: '.wrapper.svelte-1j3w4u1.svelte-1j3w4u1{width:100vw;position:fixed;z-index:3;pointer-events:none}.container.svelte-1j3w4u1.svelte-1j3w4u1{color:white;display:flex;justify-content:space-between;align-items:center;font-family:"Orator";padding:20px 40px;font-weight:100}.container.svelte-1j3w4u1 .left-container.svelte-1j3w4u1{display:flex;pointer-events:all;align-items:center}.container.svelte-1j3w4u1 .logo-container.svelte-1j3w4u1{max-width:12em;height:66px;pointer-events:all}.container.svelte-1j3w4u1 .logo-container img.svelte-1j3w4u1{width:100%;object-fit:cover}@media(max-width: 650px){.secondary-main-trigger-icon.svelte-1j3w4u1.svelte-1j3w4u1{display:none}.logo.svelte-1j3w4u1.svelte-1j3w4u1{display:none}}.nav-menu-label.svelte-1j3w4u1.svelte-1j3w4u1{display:flex;align-items:center}.nav-menu-label.svelte-1j3w4u1 .secondary-main-trigger-icon.svelte-1j3w4u1{font-size:18px;margin-left:9px;line-height:18px;cursor:pointer;line-height:20px;margin-top:-2px;margin-bottom:-1px;text-transform:uppercase;font-family:Orator;height:fit-content}',
  map: null
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
  ], {})}>${slots.default ? slots.default({}) : ``}<title>Facebook</title><path d="${"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"}"></path></svg>`;
});
const Instagram = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `<svg${spread([
    { role: "img" },
    { fill: "white" },
    { viewBox: "0 0 24 24" },
    { xmlns: "http://www.w3.org/2000/svg" },
    escape_object($$restProps)
  ], {})}>${slots.default ? slots.default({}) : ``}<title>Instagram</title><path d="${"M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"}"></path></svg>`;
});
const Linkedin = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `<svg${spread([
    { role: "img" },
    { fill: "white" },
    { viewBox: "0 0 24 24" },
    { xmlns: "http://www.w3.org/2000/svg" },
    escape_object($$restProps)
  ], {})}>${slots.default ? slots.default({}) : ``}<title>LinkedIn</title><path d="${"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"}"></path></svg>`;
});
var Socials_svelte_svelte_type_style_lang = "";
const css$k = {
  code: ".container.svelte-l6eggz{position:fixed;z-index:3;right:40px;bottom:25px;width:15px;height:auto;display:flex;flex-direction:column;gap:18px;opacity:60%;object-fit:cover}",
  map: null
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
  map: null
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
  map: null
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
  return `<div style="${"padding:" + escape(page === "left" ? "25px 7.5px 0px 0px" : "25px 0px 0px 7.5px") + "; float:" + escape(page === "left" ? "right" : "left") + ";"}" class="${"container svelte-1o8acu1"}">${each(imagesToDisplay, (img, i) => {
    return `${img ? `<div class="${[
      "image-container svelte-1o8acu1",
      $currentPage.page === img.index ? "selected" : ""
    ].join(" ").trim()}"><img class="${"lazy svelte-1o8acu1"}" width="${"200px"}" height="${"200px"}"${add_attribute("data-src", img.url, 0)} alt="${""}">;
			</div>` : `<div style="${"background-color:black"}" class="${"image-container svelte-1o8acu1"}"></div>`}`;
  })}
</div>`;
});
var CarouselRenders_svelte_svelte_type_style_lang = "";
const css$h = {
  code: ".indicator.svelte-1g7h3l7.svelte-1g7h3l7{top:5px;z-index:4;font-weight:600;text-align:center;letter-spacing:0.2em;right:5px;position:absolute;padding:5px 15px;border-radius:14px;background-color:black;color:white;display:flex;justify-content:center}.indicator.svelte-1g7h3l7 p.svelte-1g7h3l7{margin-right:-0.2em}.title-container.svelte-1g7h3l7.svelte-1g7h3l7{text-align:right;color:white}.title-container.svelte-1g7h3l7 h1.svelte-1g7h3l7{font-size:3em;text-transform:uppercase;font-family:Orator;color:white}.title-left.svelte-1g7h3l7.svelte-1g7h3l7{padding:20px 0 20px 20px}.title-right.svelte-1g7h3l7.svelte-1g7h3l7{text-align:left;padding:20px 20px 20px 0px}.content-container.svelte-1g7h3l7.svelte-1g7h3l7{display:flex;height:100vh;overflow:hidden;flex-direction:column;align-items:flex-end;justify-content:center}.content-container-left.svelte-1g7h3l7.svelte-1g7h3l7{padding:10px 0 10px 30px}.content-container-right.svelte-1g7h3l7.svelte-1g7h3l7{padding:10px 30px 10px 0px;align-items:flex-start}.carousel-content-container.svelte-1g7h3l7.svelte-1g7h3l7{max-width:38vw;width:100%;height:100%;align-items:flex-end;display:flex;flex-direction:column;justify-content:center}.carousel-content-container-right.svelte-1g7h3l7.svelte-1g7h3l7{align-items:flex-start}.slide-image-container.svelte-1g7h3l7.svelte-1g7h3l7{position:relative;width:100%;height:100%}.slide-image-container.svelte-1g7h3l7 img.svelte-1g7h3l7{position:absolute;height:100%;width:100%}.glide__track.svelte-1g7h3l7.svelte-1g7h3l7{height:100%}.page-arrow-container.svelte-1g7h3l7.svelte-1g7h3l7{width:30px;height:30px;position:absolute;left:10px;bottom:0;top:50%;border-radius:50%;background-color:rgba(0, 0, 0, 0.5);border:none;overflow:hidden}.page-arrow-container.svelte-1g7h3l7 .page-arrow-relative.svelte-1g7h3l7{position:absolute;top:0;left:0;bottom:0;padding:5px;margin:auto}.page-arrow-container-right.svelte-1g7h3l7.svelte-1g7h3l7{right:10px;left:auto}.glide__slides.svelte-1g7h3l7.svelte-1g7h3l7{height:100%}.carousel-container.svelte-1g7h3l7.svelte-1g7h3l7{width:100%;height:70vh;display:flex;position:relative}",
  map: null
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
				<div${add_attribute("data-glide-dir", `${$currentPage.page}`, 0)} class="${"glide "}"${add_attribute("this", carousel, 0)}><div class="${"glide__track svelte-1g7h3l7"}" data-glide-el="${"track"}"><ul class="${"glide__slides svelte-1g7h3l7"}">${each(page === "left" ? left : right, (img) => {
    return `<li class="${"glide__slide"}"><div class="${"slide-image-container svelte-1g7h3l7"}"><img loading="${"lazy"}" class="${"carousel-image lazy svelte-1g7h3l7"}"${add_attribute("src", img.url, 0)} alt="${""}"></div>
								</li>`;
  })}</ul></div></div>
				<button class="${"page-arrow-container page-arrow-container-" + escape(page) + " svelte-1g7h3l7"}"><div class="${"page-arrow-relative page-arrow-relative svelte-1g7h3l7"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(" + (page === "left" ? "-90deg" : "90deg") + "); height:100%; "
  }, {}, {})}</div></button></div>

			${validate_component(CarouselThumbs, "CarouselThumbs").$$render($$result, { page }, {}, {})}</div></div>
</div>`;
});
var ContactUs_svelte_svelte_type_style_lang = "";
const css$g = {
  code: ".success-message.svelte-15wztcz.svelte-15wztcz{color:white}.bu-button.svelte-15wztcz.svelte-15wztcz{background-color:#a4632e}.form-container.svelte-15wztcz.svelte-15wztcz{width:100%;max-width:500px}.form-container.svelte-15wztcz .bu-field.svelte-15wztcz{margin:15px}.form-container.svelte-15wztcz .bu-field .svelte-15wztcz::placeholder{color:black;font-size:0.8em;opacity:0.5}.container.svelte-15wztcz.svelte-15wztcz{width:100%;height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column}h5.svelte-15wztcz.svelte-15wztcz{text-transform:uppercase;color:white;font-family:Orator}",
  map: null
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
  map: null
};
const Credits = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { page } = $$props;
  let scrollContainer;
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$f);
  return `<div class="${"page svelte-y4i8f3"}"><div class="${"container svelte-y4i8f3"}" style="${"justify-content: " + escape(page === "left" ? "flex-end" : "flex-start")}"><div style="${"align-items:" + escape(page === "left" ? "flex-end" : "flex-start")}" class="${"sub-container svelte-y4i8f3"}"><div class="${"title-container svelte-y4i8f3"}" style="${"justify-content: " + escape(page === "left" ? "flex-end" : "flex-start")}">${page === "left" ? `<div class="${"title-text-container svelte-y4i8f3"}"><h5 class="${"svelte-y4i8f3"}">Developmen</h5></div>` : `<div class="${"title-text-container svelte-y4i8f3"}"><h5 class="${"svelte-y4i8f3"}">t Credits</h5></div>`}</div>
			<div class="${"content-container svelte-y4i8f3"}"${add_attribute("this", scrollContainer, 0)}>${page === "left" ? `<div class="${"credits-container-sub svelte-y4i8f3"}">${each(creditsContent.slice(0, 2), (credit) => {
    return `<div class="${"credits-container svelte-y4i8f3"}"><h5 class="${"header svelte-y4i8f3"}">${escape(credit.header)}</h5>
								${each(credit.paragraphs, (p) => {
      return `<p class="${"svelte-y4i8f3"}">${escape(p)}</p>`;
    })}
							</div>`;
  })}</div>` : `<div class="${"credits-container-sub svelte-y4i8f3"}">${each(creditsContent.slice(2, 6), (credit) => {
    return `<div class="${"credits-container svelte-y4i8f3"}"><h5 class="${"header svelte-y4i8f3"}">${escape(credit.header)}</h5>
								${each(credit.paragraphs, (p) => {
      return `<p class="${"svelte-y4i8f3"}">${escape(p)}</p>`;
    })}
							</div>`;
  })}</div>`}</div></div></div>
</div>`;
});
var GalleryPreview_svelte_svelte_type_style_lang = "";
const css$e = {
  code: ".image-container.svelte-cfqce8.svelte-cfqce8{height:100%;padding-right:5px}.image-container.svelte-cfqce8 img.svelte-cfqce8{height:100%;object-fit:cover;width:100%}",
  map: null
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
  code: '.blur.svelte-b0adzm.svelte-b0adzm{left:0;right:0;z-index:0;position:relative;cursor:pointer}.blur.svelte-b0adzm.svelte-b0adzm::before{pointer-events:none;position:absolute;content:"";height:100%;display:block;left:0;right:0;top:0;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)){.blur.svelte-b0adzm.svelte-b0adzm::before{background:rgba(0, 0, 0, 0.5)}}.image-container.svelte-b0adzm.svelte-b0adzm{height:100%}.image-container.svelte-b0adzm .main-image.svelte-b0adzm{width:100%;object-fit:cover;height:100%}.play-button.svelte-b0adzm.svelte-b0adzm{position:absolute;width:160px;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:auto;z-index:5;object-fit:cover}',
  map: null
};
const ImagePage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { imageInd } = $$props;
  const images2 = [...pageLayout["image-pages"]];
  if ($$props.imageInd === void 0 && $$bindings.imageInd && imageInd !== void 0)
    $$bindings.imageInd(imageInd);
  $$result.css.add(css$d);
  $$unsubscribe_modal();
  return `<div class="${"page"}"><div class="${"image-container " + escape(images2[imageInd].type === "video" ? "blur" : "") + " svelte-b0adzm"}">${images2[imageInd].type === "video" ? `<img alt="${""}" src="${"playButton.png"}" class="${"play-button svelte-b0adzm"}">` : ``}

		<img${add_attribute("data-src", images2[imageInd].image.url, 0)} alt="${""}" class="${"main-image lazy svelte-b0adzm"}"></div>
</div>`;
});
var TextPage_svelte_svelte_type_style_lang = "";
const css$c = {
  code: ".container.svelte-1wjvxy1.svelte-1wjvxy1{margin:auto;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;height:100%}@media(max-width: 1400px){.container.svelte-1wjvxy1.svelte-1wjvxy1{padding:30px;max-width:100%}.container.svelte-1wjvxy1 .text-content.svelte-1wjvxy1{width:100%;max-width:100%}}.container.svelte-1wjvxy1 .header.svelte-1wjvxy1{text-transform:uppercase;color:white}@media(max-width: 650px){.container.svelte-1wjvxy1.svelte-1wjvxy1{width:100%;height:100%;display:none}}@media(max-width: 950px){.container.svelte-1wjvxy1 .text-content.svelte-1wjvxy1{padding-top:67px}}.text-content.svelte-1wjvxy1.svelte-1wjvxy1{max-width:50%;display:flex;flex-direction:column;width:100%;overflow:hidden}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1{height:100%;overflow:auto}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar{width:20px}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar-track{background-color:transparent}.text-content.svelte-1wjvxy1 .text-container.svelte-1wjvxy1::-webkit-scrollbar-thumb{background-color:#d6dee1;border-radius:20px;border:6px solid transparent;background-clip:content-box}",
  map: null
};
const TextPage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { index } = $$props;
  let { bgColor } = $$props;
  let scrollContainer;
  if ($$props.index === void 0 && $$bindings.index && index !== void 0)
    $$bindings.index(index);
  if ($$props.bgColor === void 0 && $$bindings.bgColor && bgColor !== void 0)
    $$bindings.bgColor(bgColor);
  $$result.css.add(css$c);
  return `<div style="${"background-color: " + escape(bgColor) + ";"}" class="${"page container svelte-1wjvxy1"}"><div class="${"text-content svelte-1wjvxy1"}"><div class="${"bu-content bu-is-large"}"><h3 class="${"header bu-content-header  svelte-1wjvxy1"}">${escape(textPages[index].header)}</h3></div>
		<div class="${"bu-content text-container svelte-1wjvxy1"}"><div class="${"scroll-container-text"}"${add_attribute("this", scrollContainer, 0)}><div class="${"text-p-container"}">${each(textPages[index].paragraphs, (text, i) => {
    return `<p${add_attribute("key", i, 0)} class="${"$1"}">${escape(text)}
						</p>`;
  })}</div></div></div></div>
</div>`;
});
var LeftContainer_svelte_svelte_type_style_lang = "";
const css$b = {
  code: ".bg-image-container.svelte-x4nibx.svelte-x4nibx{width:100%;height:100%;position:absolute;z-index:1}.bg-image-container.svelte-x4nibx .bg-image.svelte-x4nibx{width:100%;height:100%}.container.svelte-x4nibx.svelte-x4nibx{position:relative;align-items:center;transition:all 1s ease-out;height:100vh;max-width:50vw;width:100%}.container.svelte-x4nibx .logo-wrapper.svelte-x4nibx{width:50vw;height:100vh;display:flex;align-items:center;justify-content:flex-end;z-index:2;position:relative}.container.svelte-x4nibx .logo-wrapper .logo-container.svelte-x4nibx{max-width:33%}.container.svelte-x4nibx .logo-wrapper .logo-container .image-logo.svelte-x4nibx{object-fit:contain;width:100%}@media(max-width: 650px){.container.svelte-x4nibx .logo-wrapper.svelte-x4nibx{width:100%;max-width:100%;justify-content:center}.container.svelte-x4nibx .logo-wrapper .logo-container.svelte-x4nibx{max-width:40%}.container.svelte-x4nibx .logo-wrapper .logo-container .image-logo.svelte-x4nibx{width:100%}}@media(max-width: 650px){.container.svelte-x4nibx.svelte-x4nibx{max-width:100%}}@media(max-width: 650px){.image-logo.svelte-x4nibx.svelte-x4nibx{display:none}.container.svelte-x4nibx.svelte-x4nibx{width:100vw}.container.svelte-x4nibx.svelte-x4nibx{transform:translateY(0) !important;justify-content:center}}",
  map: null
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
  map: null
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
	<div class="${"glide svelte-ecj6uw"}"${add_attribute("this", glider, 0)}><div class="${"glide__track svelte-ecj6uw"}" data-glide-el="${"track"}"><ul class="${"glide__slides svelte-ecj6uw"}">${each(images2[name], (img, i) => {
    return `<li class="${"glide__slide svelte-ecj6uw"}"><div class="${"image-container svelte-ecj6uw"}">${img.url ? `<img loading="${"lazy"}" class="${"carousel-image svelte-ecj6uw"}"${add_attribute("src", img.url, 0)} alt="${""}">` : ``}</div>
					</li>`;
  })}</ul></div>
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
  map: null
};
const GallerySelected = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  let { img } = $$props;
  let { index } = $$props;
  createEventDispatcher();
  if ($$props.img === void 0 && $$bindings.img && img !== void 0)
    $$bindings.img(img);
  if ($$props.index === void 0 && $$bindings.index && index !== void 0)
    $$bindings.index(index);
  $$result.css.add(css$9);
  $$unsubscribe_galleryImg();
  return `<div class="${[
    escape($galleryImg.currPhase) + " image-container svelte-16g7mu0",
    $galleryImg.selected === index ? "overlay-image" : ""
  ].join(" ").trim()}"><img loading="${"lazy"}"${add_attribute("src", img.url, 0)} alt="${""}" class="${"svelte-16g7mu0"}">
</div>`;
});
var Gallery_svelte_svelte_type_style_lang = "";
const css$8 = {
  code: '.flex-column.svelte-y9p1ko.svelte-y9p1ko{display:flex;width:100%;gap:5px;flex-direction:column}.flex-container.svelte-y9p1ko.svelte-y9p1ko{width:100%;height:100%;gap:5px;display:flex;flex-wrap:wrap;overflow:auto}.phase-label-container.svelte-y9p1ko.svelte-y9p1ko{color:white;display:flex;gap:10px;align-items:center;padding:0.5rem;font-family:Orator}.phase-label-container.svelte-y9p1ko h5.svelte-y9p1ko{width:fit-content;position:relative;cursor:pointer}.phase-label-container.svelte-y9p1ko .phase-label.svelte-y9p1ko::after{content:"";display:block;width:100%;height:1px;background-color:white}',
  map: null
};
const Gallery = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $galleryImg, $$unsubscribe_galleryImg;
  $$unsubscribe_galleryImg = subscribe(galleryImg, (value) => $galleryImg = value);
  let selected;
  const images2 = pageLayout.bts;
  $$result.css.add(css$8);
  $$unsubscribe_galleryImg();
  return `<div class="${"page"}"><div class="${"phase-label-container svelte-y9p1ko"}">${each(images2, (phase, i) => {
    return `<h5 class="${["svelte-y9p1ko", i === $galleryImg.currPhase ? "phase-label" : ""].join(" ").trim()}">phase ${escape(i + 1)}
			</h5>`;
  })}</div>
	<div class="${"flex-container " + escape($galleryImg.currPhase) + " svelte-y9p1ko"}">${each(images2[$galleryImg.currPhase].images, (img, i) => {
    return `${validate_component(GallerySelected, "GallerySelected").$$render($$result, { img, selected, index: i }, {}, {})}`;
  })}
		${$galleryImg.currPhase === "phase-1" ? `` : ``}</div>
</div>`;
});
var RightContainer_svelte_svelte_type_style_lang = "";
const css$7 = {
  code: ".bg-image-container.svelte-1ppt77p.svelte-1ppt77p{width:100%;height:100%;position:absolute;z-index:1;margin:auto}.bg-image-container.svelte-1ppt77p .bg-image.svelte-1ppt77p{width:100%;height:100%}.container.svelte-1ppt77p.svelte-1ppt77p{position:relative;align-items:center;transform:translateY(-1000vh);transition:all 1s ease-out;height:100vh;max-width:50vw;width:100%}.container.svelte-1ppt77p .logo-wrapper.svelte-1ppt77p{width:50vw;height:100vh;display:flex;align-items:center;justify-content:flex-start;z-index:2;position:relative}.container.svelte-1ppt77p .logo-wrapper .logo-container.svelte-1ppt77p{max-width:33%}.container.svelte-1ppt77p .logo-wrapper .logo-container .image-logo.svelte-1ppt77p{object-fit:contain;width:100%}@media(max-width: 650px){.container.svelte-1ppt77p .logo-wrapper.svelte-1ppt77p{width:100%;max-width:100%;justify-content:center}.container.svelte-1ppt77p .logo-wrapper .logo-container.svelte-1ppt77p{max-width:40%}.container.svelte-1ppt77p .logo-wrapper .logo-container .image-logo.svelte-1ppt77p{width:100%}}@media(max-width: 650px){.container.svelte-1ppt77p.svelte-1ppt77p{max-width:100%}}@media(max-width: 650px){.image-logo.svelte-1ppt77p.svelte-1ppt77p{display:none}.container.svelte-1ppt77p.svelte-1ppt77p{width:100vw}.container.svelte-1ppt77p.svelte-1ppt77p{transform:translateY(0) !important;justify-content:center}}",
  map: null
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
  map: null
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
  code: '.bu-card-image.video.svelte-14jugcy.svelte-14jugcy{cursor:pointer}.main-image.svelte-14jugcy.svelte-14jugcy{object-fit:cover}h5.svelte-14jugcy.svelte-14jugcy{font-family:Orator}.font-white.svelte-14jugcy.svelte-14jugcy{color:white}.square-place-holder.svelte-14jugcy.svelte-14jugcy{width:100%}.square-place-holder.svelte-14jugcy img.svelte-14jugcy{width:100%;object-fit:cover}.card-content.svelte-14jugcy.svelte-14jugcy{background-color:transparent}.play-button-container.svelte-14jugcy.svelte-14jugcy{position:absolute;width:25%;top:50%;left:50%;transform:translate(-50%, -50%);height:auto;z-index:5;object-fit:cover}.content.svelte-14jugcy.svelte-14jugcy{max-height:20rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}.card-container.svelte-14jugcy.svelte-14jugcy{display:flex;flex-direction:column;background-color:transparent}.card-container.svelte-14jugcy:nth-child(4) .show-more.svelte-14jugcy{display:none !important}.blur.svelte-14jugcy.svelte-14jugcy{left:0;right:0;z-index:0;position:relative}.blur.svelte-14jugcy.svelte-14jugcy::before{pointer-events:none;position:absolute;content:"";height:100%;display:block;left:0;right:0;top:0;z-index:2;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)){.blur.svelte-14jugcy.svelte-14jugcy::before{background:rgba(0, 0, 0, 0.5)}}.show-more.svelte-14jugcy.svelte-14jugcy{display:block;max-height:100%}',
  map: null
};
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => value);
  let { index } = $$props;
  let { image } = $$props;
  let { type } = $$props;
  let { page } = $$props;
  let mainText;
  onDestroy(() => {
  });
  if ($$props.index === void 0 && $$bindings.index && index !== void 0)
    $$bindings.index(index);
  if ($$props.image === void 0 && $$bindings.image && image !== void 0)
    $$bindings.image(image);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$5);
  $$unsubscribe_modal();
  return `<div class="${"bu-card card-container svelte-14jugcy"}"${add_attribute("id", navToLink[index + 1], 0)}><div class="${["bu-card-image svelte-14jugcy", type === "video" ? "video" : ""].join(" ").trim()}"><figure class="${"bu-image bu-is-4by3 " + escape(type === "video" ? "blur" : "") + " svelte-14jugcy"}">${type === "video" ? `<div class="${"play-button-container svelte-14jugcy"}"><figure class="${"bu-image bu-is-square "}"><img src="${"playButton.png"}" alt="${""}"></figure></div>` : ``}
			<img loading="${"lazy"}" class="${"main-image svelte-14jugcy"}"${add_attribute("src", image.url, 0)} alt="${""}"></figure></div>
	<div class="${"card-content bu-card-content svelte-14jugcy"}"><div class="${"bu-media"}"><div class="${"bu-media-left"}"><figure class="${"bu-image bu-is-48x48"}"><div class="${"square-place-holder svelte-14jugcy"}" style="${"height: 100%; width:100%;"}"><img src="${"mobile-logo.png"}" alt="${""}" class="${"svelte-14jugcy"}"></div></figure></div>
			${textPages[index] ? `<h5 class="${"title is-4 font-white svelte-14jugcy"}">${escape(textPages[index].header)}</h5>` : ``}</div>
		<div class="${"content bu-is-clipped content font-white " + escape("") + " svelte-14jugcy"}"${add_attribute("this", mainText, 0)}>${textPages[index] ? `${each(textPages[index].paragraphs, (p) => {
    return `${escape(p)}`;
  })}` : ``}</div>
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
  map: null
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
  map: null
};
const CardCarousel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { index } = $$props;
  let { page } = $$props;
  let { images: images2 } = $$props;
  let carousel;
  let slider;
  let mainText;
  let glideContainer;
  spring(0, { stiffness: 0.1, damping: 0.89 });
  onDestroy(() => {
  });
  if ($$props.index === void 0 && $$bindings.index && index !== void 0)
    $$bindings.index(index);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.images === void 0 && $$bindings.images && images2 !== void 0)
    $$bindings.images(images2);
  $$result.css.add(css$3);
  return `<div${add_attribute("id", navToLink[index + 2], 0)} class="${"bu-card card-container svelte-15wnr6z"}"><div class="${"carousel-container svelte-15wnr6z"}"><div class="${"glide"}"${add_attribute("this", carousel, 0)}><div class="${"indicator svelte-15wnr6z"}">${``}</div>
			<div class="${"glide__track"}" data-glide-el="${"track"}"><ul class="${"glide__slides"}"${add_attribute("this", slider, 0)}>${each(images2, (img, i) => {
    return `<li style="${"width:" + escape("") + "px"}" class="${"glide__slide"}"${add_attribute("this", glideContainer, 0)}><div class="${"glide-image-container svelte-15wnr6z"}">${validate_component(PinchZoom, "PinchZoom").$$render($$result, { img: img.url }, {}, {})}</div>
						</li>`;
  })}</ul></div>
			<div class="${"glide__arrows"}" data-glide-el="${"controls"}"><button class="${"glide__arrow page-arrow-container glide__arrow--left arrow-left svelte-15wnr6z"}"><div class="${"page-arrow-relative svelte-15wnr6z"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button>
				<button class="${"glide__arrow page-arrow-container glide__arrow--right arrow-right svelte-15wnr6z"}"><div class="${"page-arrow-relative svelte-15wnr6z"}">${validate_component(Arrow, "Arrow").$$render($$result, {
    styleP: "object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
  }, {}, {})}</div></button></div></div></div>
	<div class="${"card-content bu-card-content svelte-15wnr6z"}"><div class="${"bu-media"}"><div class="${"bu-media-left"}"><figure class="${"bu-image bu-is-48x48"}"><div class="${"square-place-holder svelte-15wnr6z"}" style="${"height: 100%; width:100%;"}"><img src="${"mobile-logo.png"}" alt="${""}" class="${"svelte-15wnr6z"}"></div></figure></div>
			${textPages[index] ? `<h5 class="${"title is-4 font-white svelte-15wnr6z"}">${escape(textPages[index].header)}</h5>` : ``}</div>
		<div class="${"content bu-is-clipped content font-white " + escape("") + " svelte-15wnr6z"}"${add_attribute("this", mainText, 0)}>${textPages[index] ? `${each(textPages[index].paragraphs, (p) => {
    return `<p>${escape(p)}</p>`;
  })}` : ``}</div>
		<br>
		${``}</div>
</div>`;
});
var CardCredits_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: '.credits-title.svelte-1muos5l.svelte-1muos5l{font-family:Orator;font-size:1.5em}.mobile-container.svelte-1muos5l.svelte-1muos5l{width:100%;padding:20px;text-align:center}.mobile-container.svelte-1muos5l .mobile-header-container.svelte-1muos5l{font-size:1.6em;margin-bottom:1rem}.mobile-container.svelte-1muos5l .mobile-credits-container.svelte-1muos5l{margin-bottom:2rem;opacity:0}.mobile-container.svelte-1muos5l .mobile-credits-container.svelte-1muos5l:not(:last-child)::after{content:"";display:block;width:50px;height:1px;padding:20px;margin:auto;border-bottom:1px solid white}h5.svelte-1muos5l.svelte-1muos5l{font-size:1em;margin-bottom:20px;color:white}@media(max-width: 1040px){h5.svelte-1muos5l.svelte-1muos5l{margin-bottom:10px;font-size:0.7em}}p.svelte-1muos5l.svelte-1muos5l{color:white;font-family:"Roboto", sans-serif;font-size:0.8em}',
  map: null
};
const CardCredits = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<div id="${"credits"}" class="${"mobile-container svelte-1muos5l"}"><div class="${"mobile-header-container svelte-1muos5l"}"><h5 class="${"credits-title svelte-1muos5l"}">development credits</h5></div>
  ${each(creditsContent, (credit) => {
    return `<div class="${"mobile-credits-container svelte-1muos5l"}"><h5 class="${"bu-header svelte-1muos5l"}">${escape(credit.header)}</h5>
      ${each(credit.paragraphs, (p) => {
      return `<p class="${"svelte-1muos5l"}">${escape(p)}</p>`;
    })}
    </div>`;
  })}
</div>`;
});
var CardGallery_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: '.container.svelte-iyyz4g.svelte-iyyz4g{max-height:500px;overflow:hidden;height:100%;display:flex;justify-content:center;flex-direction:column;align-items:center;padding:20px;gap:20px;margin-bottom:20px}.curr-phase-container.svelte-iyyz4g.svelte-iyyz4g{display:flex;color:white;gap:10px;text-transform:uppercase}.curr-phase-container.svelte-iyyz4g h5.svelte-iyyz4g{cursor:pointer}.curr-phase-container.svelte-iyyz4g .phase-label.svelte-iyyz4g::after{content:"";display:block;width:100%;height:1px;background-color:white}@keyframes svelte-iyyz4g-example{0%{opacity:0}100%{width:100%}}.bu-title.svelte-iyyz4g.svelte-iyyz4g{font-family:Orator;color:white;font-weight:200}.gallery-container.svelte-iyyz4g.svelte-iyyz4g{display:grid;width:100%;gap:6px;overflow-y:auto;grid-template-columns:repeat(4, minmax(50px, 1fr))}.image-container.svelte-iyyz4g.svelte-iyyz4g{position:relative;padding-bottom:100%}.image-container.svelte-iyyz4g img.svelte-iyyz4g{height:100%;object-fit:cover;width:100%;border-radius:4px;animation-fill-mode:forwards;position:absolute}',
  map: null
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
		<div class="${"curr-phase-container svelte-iyyz4g"}">${each(data.phases, (phase, i) => {
    return `<h5 class="${["svelte-iyyz4g", $galleryImg.currPhase === i ? "phase-label" : ""].join(" ").trim()}">phase ${escape(i + 1)}
				</h5>`;
  })}</div>
		<div class="${"gallery-container svelte-iyyz4g"}">${each(data.phases[$galleryImg.currPhase].images, (image, i) => {
    return `<div class="${"image-container svelte-iyyz4g"}"><img${add_attribute("src", image.url, 0)} loading="${"lazy"}" alt="${""}" class="${"svelte-iyyz4g"}">
				</div>`;
  })}</div></div>
</div>`;
});
var CardContainer_svelte_svelte_type_style_lang = "";
const css = {
  code: ".bg-image-container.svelte-1fu2nnh.svelte-1fu2nnh{position:absolute;z-index:1;width:100%;height:100%}.bg-image-container.svelte-1fu2nnh .bg-image.svelte-1fu2nnh{width:100%;object-fit:cover;height:100%}.contact-us-container.svelte-1fu2nnh.svelte-1fu2nnh{width:100%;padding:30px;height:100vh}.card-container.svelte-1fu2nnh.svelte-1fu2nnh{position:relative;background-color:#2c2a2b}.logo-wrapper.svelte-1fu2nnh.svelte-1fu2nnh{z-index:2;position:relative;width:100vw;height:100vh;display:flex;justify-content:center;align-items:center}.logo-wrapper.svelte-1fu2nnh .logo-container.svelte-1fu2nnh{max-width:55%}.logo-wrapper.svelte-1fu2nnh .logo-container .image-logo.svelte-1fu2nnh{object-fit:contain;width:100%}",
  map: null
};
const CardContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cardLayout = [];
  $$result.css.add(css);
  return `<div class="${"card-wrapper"}"><div class="${"bg-image-container svelte-1fu2nnh"}"><img class="${"bg-image svelte-1fu2nnh"}" src="${"horses.jpg"}" alt="${""}"></div>
	<div id="${"home"}" class="${"logo-wrapper svelte-1fu2nnh"}"><div class="${"logo-container svelte-1fu2nnh"}"><img class="${"image-logo svelte-1fu2nnh"}" src="${"homeLogo.png"}" alt="${""}"></div></div>
	<div class="${"card-container svelte-1fu2nnh"}">${each(cardLayout, (card, i) => {
    return `${cardLayout[i].type === "bg-pages" || cardLayout[i].type === "video" ? `${validate_component(Card, "Card").$$render($$result, {
      type: card.type,
      image: card.images.filter((item) => {
        return item.url;
      })[0],
      page: card,
      index: i
    }, {}, {})}` : `${cardLayout[i].type === "behind-the-scenes" ? `${validate_component(CardGallery, "CardGallery").$$render($$result, { data: card }, {}, {})}` : `${validate_component(CardCarousel, "CardCarousel").$$render($$result, {
      images: card.images.filter((item) => {
        return item.url;
      }),
      page: card,
      index: i
    }, {}, {})}`}`}`;
  })}
		${validate_component(CardCredits, "CardCredits").$$render($$result, {}, {}, {})}
		<div id="${"contact"}" class="${"contact-us-container svelte-1fu2nnh"}">${validate_component(ContactUs, "ContactUs").$$render($$result, {}, {}, {})}</div></div>
</div>`;
});
const prerender = true;
async function load({ fetch }) {
  const categories = (await (await fetch("/api2/api/categories")).json()).reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});
  const imagePages = await fetch("/api2/api/bg-pages");
  const carouselRenders = await fetch("/api2/api/carousel-renders");
  const pageCarousels = await fetch("/api2/api/page-carousels");
  const bts = await fetch("/api2/api/behind-the-scenes");
  const mobile = await fetch("/api2/api/mobile");
  pageLayout["image-pages"] = await imagePages.json();
  pageLayout["carousel-renders"] = await carouselRenders.json();
  pageLayout["page-carousels"] = await pageCarousels.json();
  pageLayout["bts"] = await bts.json();
  pageLayout["mobile"] = await mobile.json();
  pageLayout["mobile"] = pageLayout["mobile"].map((item) => {
    item["type"] = categories[item.category].category;
    return item;
  });
  galleryImg.update((s) => {
    s.imageToDisplay = pageLayout["bts"][0].images[0].url;
    return s;
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
            if (Array.isArray(obj[key])) {
              obj[key] = obj[key].sort((a, b) => {
                return a.order - b.order;
              });
            }
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
      {
        return item;
      }
    });
  }
  changeAllUrls(changeUrls(pageLayout));
  return {};
}
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $modal, $$unsubscribe_modal;
  $$unsubscribe_modal = subscribe(modal, (value) => $modal = value);
  let { pagesData } = $$props;
  onDestroy(() => {
  });
  if ($$props.pagesData === void 0 && $$bindings.pagesData && pagesData !== void 0)
    $$bindings.pagesData(pagesData);
  $$unsubscribe_modal();
  return `<div>${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})}

	${validate_component(ScrollContainer, "ScrollContainer").$$render($$result, { pageLayout: pagesData }, {}, {})}

	${validate_component(CardContainer, "CardContainer").$$render($$result, {}, {}, {})}

	${$modal.visibility && $modal.content ? `${validate_component(Modal, "Modal").$$render($$result, {}, {}, {})}` : ``}
	${validate_component(Socials, "Socials").$$render($$result, {}, {}, {})}
</div>`;
});
export { Routes as default, load, prerender };
