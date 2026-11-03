
const http = require("node:http");
const pool = require("./database");

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // GET: Read jobs from PostgreSQL
  if (req.method === "GET" && req.url === "/api/jobs") {
    try {
      const result = await pool.query(
        "SELECT * FROM jobs ORDER BY scanned_at DESC"
      );

      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Database error" }));
    }
    return;
  }

  // POST: Save a job to PostgreSQL
  if (req.method === "POST" && req.url === "/api/jobs") {
    let body = "";

    for await (const chunk of req) {
      body += chunk;
    }

    try {
      const job = JSON.parse(body);

      if (!job.id || !job.title ||
          !["clear", "review", "restricted"].includes(job.type)) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid job data" }));
        return;
      }

      const result = await pool.query(
        `INSERT INTO jobs (id, title, eligibility_type, reason)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           eligibility_type = EXCLUDED.eligibility_type,
           reason = EXCLUDED.reason,
           scanned_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [job.id, job.title, job.type, job.reason || null]
      );

      res.writeHead(201);
      res.end(JSON.stringify({
        message: "Job saved successfully",
        job: result.rows[0]
      }));
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Could not save job" }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(3000, "127.0.0.1", () => {
  console.log("API running at http://127.0.0.1:3000");
});
