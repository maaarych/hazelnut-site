"use strict";
// Використання: npm run order-status -- HZ-261101-1234 confirmed
// Статуси: processing | confirmed | delivered | cancelled
const { setStatus, STATUSES } = require("../server.js");

const [id, status] = process.argv.slice(2);
if (!id || !STATUSES.includes(status)) {
  console.error("Використання: npm run order-status -- <HZ-номер> <" + STATUSES.join("|") + ">");
  process.exit(1);
}
try {
  setStatus(id, status);
  console.log(id + " → " + status);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
