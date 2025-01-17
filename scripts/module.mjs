import { MODULE_ID } from "./constants.mjs";
import * as logging from "./helpers/logging.mjs";
import { MVPVoteSocketHandler } from "./helpers/sockets.mjs";
import { MVPVoteSetupApplication } from "./applications/mvp-vote-setup-app.mjs";

async function setupVote() {
  new MVPVoteSetupApplication().render(true);
  if (!game.user.isGM) ui.players.render();
}

Hooks.once("init", () => {
  logging.log("Initializing...");
  game.modules.get(MODULE_ID).socketHandler = new MVPVoteSocketHandler();
});

Hooks.once("setup", () => {
  logging.log("Setting up...");

  globalThis.MVPVote = {
    setupVote,
  };
});
