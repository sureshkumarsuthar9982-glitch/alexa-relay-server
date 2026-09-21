const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let relayStates = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
];

let pendingCommand = null;

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Alexa Relay Server is running",
    relays: relayStates,
    pendingCommand: pendingCommand
  });
});

// Alexa request handler
app.post("/", (req, res) => {
  const request = req.body;

  console.log("Alexa request:");
  console.log(JSON.stringify(request, null, 2));

  const requestType = request?.request?.type;

  // Alexa launch request
  if (requestType === "LaunchRequest") {
    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "My voice assistant is ready."
        },
        shouldEndSession: false
      }
    });
  }

  // Alexa intent request
  if (requestType === "IntentRequest") {
    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Command received. Your voice assistant is working."
        },
        shouldEndSession: true
      }
    });
  }

  // Session ended
  if (requestType === "SessionEndedRequest") {
    return res.json({
      version: "1.0",
      response: {}
    });
  }

  return res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "I received your request."
      },
      shouldEndSession: true
    }
  });
});

// Get relay states
app.get("/relays", (req, res) => {
  res.json({
    relays: relayStates
  });
});

// ESP32 asks for a command
app.get("/command", (req, res) => {
  if (pendingCommand) {
    const command = pendingCommand;
    pendingCommand = null;

    return res.json({
      command: command
    });
  }

  res.json({
    command: null
  });
});

// Individual relay
app.post("/relay/:number", (req, res) => {
  const relayNumber = parseInt(req.params.number);
  const { on } = req.body;

  if (relayNumber < 1 || relayNumber > 8) {
    return res.status(400).json({
      error: "Relay number must be between 1 and 8"
    });
  }

  if (typeof on !== "boolean") {
    return res.status(400).json({
      error: "Use { on: true } or { on: false }"
    });
  }

  relayStates[relayNumber - 1] = on;

  pendingCommand = on
    ? `R${relayNumber}ON`
    : `R${relayNumber}OFF`;

  res.json({
    success: true,
    relay: relayNumber,
    state: on ? "ON" : "OFF",
    command: pendingCommand,
    relays: relayStates
  });
});

// All ON
app.post("/all/on", (req, res) => {
  relayStates = relayStates.map(() => true);

  pendingCommand = "ALLON";

  res.json({
    success: true,
    state: "ALL ON",
    command: pendingCommand,
    relays: relayStates
  });
});

// All OFF
app.post("/all/off", (req, res) => {
  relayStates = relayStates.map(() => false);

  pendingCommand = "ALLOFF";

  res.json({
    success: true,
    state: "ALL OFF",
    command: pendingCommand,
    relays: relayStates
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Alexa Relay Server running on port ${PORT}`);
});
