const { spawn } = require("child_process");

module.exports = function (html, options = []) {
  return new Promise((resolve, reject) => {
    const bufs = [];
    const proc = spawn("/bin/sh", [
      "-o",
      "pipefail",
      "-c",
      `LD_LIBRARY_PATH=lib lib/wkhtmltopdf ${options.join(" ")} - - | cat`,
    ]);

    proc
      .on("error", (error) => {
        reject(error);
      })
      .on("exit", (code) => {
        if (code) {
          reject(new Error(`wkhtmltopdf process exited with code ${code}`));
        } else {
          resolve(Buffer.concat(bufs));
        }
      });

    proc.stdin.write(html);
    proc.stdin.end();

    proc.stdout
      .on("data", (data) => {
        bufs.push(data);
      })
      .on("error", (error) => {
        reject(error);
      });

    proc.stderr.on("data", (data) => {
      console.error(`wkhtmltopdf stderr: ${data}`);
    });
  });
};
