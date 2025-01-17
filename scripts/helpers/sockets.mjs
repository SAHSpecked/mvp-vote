import * as logging from "../helpers/logging.mjs";
import { MVPVotingCardApplication } from "../applications/mvp-voting-card-app.mjs";

export class MVPVoteSocketHandler {
  constructor() {
    this.identifier = "module.mvp-vote";
    this.#registerSocketHandlers();
  }

  #registerSocketHandlers() {
    logging.log("Registering socket handlers");
    game.socket.on(this.identifier, ({ action, payload }) => {
      this.#actionSwitch(action, payload);
    });
  }

  emit(action, payload) {
    logging.log(`Emitting ${action}...`);
    return game.socket.emit(this.identifier, { action, payload });
  }

  emitPlusSelf(action, payload) {
    logging.log(`Emitting, plus self, ${action}...`);
    this.#actionSwitch(action, payload);
    return game.socket.emit(this.identifier, { action, payload });
  }

  #actionSwitch(action, payload) {
    switch (action) {
      case "sendCards":
        this.#sendCards(payload);
        break;
      default:
        throw new Error("Unknown action");
    }
  }

  #sendCards(voteInfo) {
    logging.log("Send voting cards");
    if (voteInfo.voters.includes(game.user.id)) {
      new MVPVotingCardApplication(voteInfo).render(true);
      if (!game.user.isGM) ui.players.render();
    }
  }
}
