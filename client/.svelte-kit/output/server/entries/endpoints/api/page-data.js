import "../../../chunks/host-ef40cb6e.js";
import "path";
import "cookie";
import "axios";
import fs from "fs";
async function post({ request }) {
  await request.json();
  fs.writeFileSync("/test.txt", "hi");
  return {
    status: 200
  };
}
export { post };
