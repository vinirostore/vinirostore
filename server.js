const http = require("http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const hostname = "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((request, response) => {
    const origin = request.headers.origin;

    // Allow the Vini RO Netlify frontend to call the Render backend
    if (origin === "https://vini-ro-store.netlify.app") {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type"
      );
      response.setHeader("Vary", "Origin");
    }

    // Handle browser CORS preflight requests
    if (request.method === "OPTIONS") {
      response.statusCode = 204;
      response.end();
      return;
    }

    handle(request, response);
  }).listen(port, hostname, () => {
    console.log(`VINI RO is running on port ${port}`);
  });
}).catch((error) => {
  console.error("Unable to start VINI RO", error);
  process.exit(1);
});