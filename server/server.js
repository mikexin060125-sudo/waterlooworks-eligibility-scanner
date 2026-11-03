
const http = require("node:http");

const jobs = [];

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  // GET: Retrieve all saved jobs
  if (req.method === "GET" && req.url === "/api/jobs") {
    res.writeHead(200);
    res.end(JSON.stringify(jobs));
    return;
  }

  // POST: Add a new job
  if (req.method === "POST" && req.url === "/api/jobs") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const job = JSON.parse(body);

        if (!job.id || !job.title) {
          res.writeHead(400);
          res.end(JSON.stringify({
            error: "Job ID and title are required"
          }));
          return;
        }

        jobs.push(job);

        res.writeHead(201);
        res.end(JSON.stringify({
          message: "Job saved successfully",
          job
        }));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: "Invalid JSON"
        }));
      }
    });

    return;
  }

  // Unknown route
  res.writeHead(404);
  res.end(JSON.stringify({
    error: "Route not found"
  }));
});

server.listen(3000, "127.0.0.1", () => {
  console.log("API running at http://127.0.0.1:3000");
});
