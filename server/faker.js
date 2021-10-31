const faker = require("faker");
const fetch = require("node-fetch");

for (let i = 0; i < 5000; i++) {
  const firstName = faker.name.firstName();
  const lastName = faker.name.firstName();
  const nickname = faker.name.firstName();
  const email = faker.internet.email();
  const password = faker.internet.password();
  fetch("http://localhost:4000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: { firstName, lastName, nickname, email, password } }),
  })
    .then((res) => res.json())
    .then((data) => console.log("done", data))
    .catch((err) => console.log("error", err));
}
