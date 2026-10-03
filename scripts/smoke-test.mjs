import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const profile = {
  name: "Test Student",
  degree: "BS IT",
  year: "3rd Year",
  school: "",
  graduation: "2027",
  career: "Frontend Developer",
  skills: { HTML: "Advanced", CSS: "Intermediate", JavaScript: "Beginner" },
  certifications: [],
  projects: [],
};
async function post(body) {
  return fetch(`${base}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
assert.equal((await fetch(base)).status, 200);
assert.equal(
  (await post({ mode: "roadmap", profile: { name: "Invalid" } })).status,
  400,
);
const roadmap = await post({ mode: "roadmap", profile });
assert.equal(roadmap.status, 200);
const data = await roadmap.json();
assert.equal(data.source, "template");
assert.equal(
  data.items.find((i) => i.title === "Learn HTML").status,
  "completed",
);
assert.equal(
  data.items.find((i) => i.title === "Learn JavaScript").status,
  "in_progress",
);
assert.ok(data.items.some((i) => i.title === "Learn React"));
assert.equal(new Set(data.items.map((i) => i.id)).size, data.items.length);
const advisor = await post({
  mode: "advisor",
  profile,
  items: data.items,
  question: "What should I learn next?",
});
assert.equal(advisor.status, 200);
assert.match((await advisor.json()).text, /JavaScript/);
const invalid = await post({
  mode: "advisor",
  profile,
  question: "x".repeat(2001),
});
assert.equal(invalid.status, 400);
const writing = await post({
  mode: "writing",
  profile,
  writingKind: "Professional About Me",
});
assert.equal(writing.status, 200);
assert.match((await writing.json()).text, /Test Student/);
console.log(
  "Passed: page response, input validation, guest fallback, career personalization, proficiency mapping, unique IDs, advisor context, question limit.",
);
