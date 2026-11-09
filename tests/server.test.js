
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");

const base = "http://127.0.0.1:3000";

test("API can save and retrieve a job", async () => {
  const server = spawn(
    process.execPath,
    ["server/server.js"],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  try {
    await Promise.race([
      once(server.stdout, "data"),
      once(server, "exit").then(() => {
        throw new Error("Server exited unexpectedly");
      })
    ]);

    const response = await fetch(`${base}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "495120",
        title: "IT Business Operations Co-op",
        type: "clear"
      })
    });

    assert.equal(response.status, 201);

    const saved = await response.json();
    assert.equal(saved.job.id, "495120");

    const getResponse = await fetch(`${base}/api/jobs`);
    assert.equal(getResponse.status, 200);
    const jobs = await getResponse.json();
    const savedJob = jobs.find(job => job.id === "495120");
    assert.ok(savedJob, "Saved job should exist");
    assert.equal(savedJob.eligibility_type, "clear");
  } finally {
    server.kill();
  }
});
