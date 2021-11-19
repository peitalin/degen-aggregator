// Simple JS script taken from https://blog.sixeyed.com/docker-healthchecks-why-not-to-use-curl-or-iwr/
// It runs INSIDE the container, thus expects to connect at the port that the server starts up with
// (not the one docker-compose would re-map to on the outside)

var http = require("http");

var options = {
  host: "localhost",
  port: "80",
  timeout: 4000,
  path: "/_health"
};

var request = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on("error", function(err) {
  console.log("ERROR", err);
  process.exit(1);
});

request.end();
