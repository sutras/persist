import child_process from "node:child_process";
import open from "open";

const port = "8183";

child_process.exec("tsc -w");

child_process
  .spawn("http-server", ["--color", "-p", port])
  .on("spawn", () => {
    open(`http://127.0.0.1:${port}/test/index.html`, {
      app: { name: "microsoft edge" },
    });
  })
  .stdout.pipe(process.stdout);
