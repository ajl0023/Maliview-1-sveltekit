import { c as create_ssr_component } from "../../chunks/index-d30cef5f.js";
const prerender = true;
async function load({ fetch }) {
  return {};
}
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
export { _layout as default, load, prerender };
