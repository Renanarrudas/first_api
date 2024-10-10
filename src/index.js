const http = require("http");
const { URL } = require("url");
const routes = require("./routes");
const bodyParser = require("./helpers/bodyParser")

const server = http.createServer((req, res) => {
  console.log(`Request Method: ${req.method} | Endpoint: ${req.url}`);
  const parsedUrl = new URL(`http://localhost:4000${req.url}`);

  let { pathname } = parsedUrl;

  const splitEndpoint = pathname.split("/").filter(Boolean);
  let id = null;

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }
  
  const route = routes.find((routeObject) => {
    return routeObject.endpoint === pathname && routeObject.method === req.method;
  });  

  if (route) {
    req.query = Object.fromEntries(parsedUrl.searchParams);
    req.params = { id };

    res.send = (statusCode, body) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      bodyParser(req, () => route.handler(req, res))
    } else {
      route.handler(req, res);
    }

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(`Cannot ${req.method} ${req.url}`);
  }
});

server.listen(4000, () =>
  console.log("Server running on port http://localhost:4000")
);
