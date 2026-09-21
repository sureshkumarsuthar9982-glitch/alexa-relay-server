const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ESP32 relay states
let relayStates = [false, false, false, false, false, false, false, false];

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Alexa Relay Server is running",
    relays: relayStates
  });
});

// Get relay states
app.get("/relays", (req, res) => {
  res.json({
    relays: relayStates
  });
});

// Control one relay
app.post("/relay/:number", (req, res) => {
  const relayNumber = parseInt(req.params.number);

  if (relayNumber < 1 || relayNumber > 8) {
    return res.status(400).json({
      error: "Relay number must be between 1 and 8"
    });
  }

  if (typeof req.body.on !== "boolean") {
    return res.status(400).json({
      error: "Use { \"on\": true } or { \"on\": false }"
    });
  }

  relayStates[relayNumber - 1] = req.body.on;

  console.log(
    `Relay ${relayNumber}: ${req.body.on ? "ON" : "OFF"}`
  );

  res.json({
    success: true,
    relay: relayNumber,
    on: req.body.on
  });
});

// All ON
app.post("/all/on", (req, res) => {
  relayStates.fill(true);

  console.log("All relays: ON");

  res.json({
    success: true,
    relays: relayStates
  });
});

// All OFF
app.post("/all/off", (req, res) => {
  relayStates.fill(false);

  console.log("All relays: OFF");

  res.json({
    success: true,
    relays: relayStates
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
