import "../../../chunks/host-b5b4a144.js";
import fs from "fs";
async function post({ request }) {
  await request.json();
  fs.writeFileSync("/test.txt", "hi");
  return {
    status: 200
  };
}
export { post };