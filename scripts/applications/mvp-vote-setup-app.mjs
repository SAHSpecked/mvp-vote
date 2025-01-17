import { MODULE_ID } from "../constants.mjs";

// Similar syntax to importing, but note that this is object destructuring rather than an actual import
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MVPVoteSetupApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "mvp-vote-setup-app",
    position: {
      width: "auto",
      height: "auto",
    },
    window: {
      title: "MVP Vote Setup - Choose the Voters and Candidates",
      resizable: false,
    },
  };

  static PARTS = {
    form: {
      template: "modules/mvp-vote/templates/vote-setup.hbs",
    },
  };

  _prepareContext() {
    const users = game.users.contents.map((el) => {
      const isPlayer = el.role === 1 || el.role === 2 ? true : false;
      const hasCharacter = el.character ? true : false;
      const preChecked = isPlayer && el.active ? `checked` : ``;

      return {
        userId: el.id,
        userName: el.name,
        userPronouns: el.pronouns,
        color: el.color.css,
        img: hasCharacter ? el.character.prototypeToken.texture.src : el.avatar,

        isPlayer: isPlayer,

        actorId: hasCharacter ? el.character.id : undefined,
        actorName: hasCharacter ? el.character.name : isPlayer ? undefined : "GM",

        active: el.active,
        preChecked: preChecked,
      };
    });

    return {
      users,
    };
  }

  _onRender(context, options) {
    this.element.querySelector("#requestVote-btn").addEventListener("click", this.#requestVote.bind(this));
    this.element.querySelector("#cancel-btn").addEventListener("click", this.#cancel.bind(this));
  }

  async #requestVote(args) {
    const VERSION = game.release.generation;

    let voteInfo = {
      voters: [],
      candidates: [],
    };

    const users = game.users.contents.map((el) => {
      return {
        userId: el.id,
        userName: el.name,
      };
    });

    for (const user of users) {
      const vote = this.element.querySelector(`[id="${user.userName}Vote"]`).checked;
      const candidate = this.element.querySelector(`[id="${user.userName}Cand"]`).checked;
      if (vote) {
        voteInfo.voters.push(user.userId);
      }
      if (candidate) {
        voteInfo.candidates.push(user.userId);
      }
    }

    super.close();

    let vA = ``;
    for (const [i, vI] of voteInfo.voters.entries()) {
      vA += `${game.users.get(vI).name}`;

      if (i !== voteInfo.voters.length - 1) {
        vA += `, `;
      }
    }

    let cA = ``;
    for (const [i, vI] of voteInfo.candidates.entries()) {
      cA += `${game.users.get(vI).name}`;

      if (i !== voteInfo.candidates.length - 1) {
        cA += `, `;
      }
    }

    await ChatMessage.create({
      speaker: { alias: `MVP Vote Request` },
      content: `<b>${game.user.name}</b> has requested MVP votes.<br><br>
        <b>Voters</b><br>
        ${vA}<br><br>
        <b>Candidates</b><br>
        ${cA}
        `,
    });

    game.modules.get(MODULE_ID).socketHandler.emitPlusSelf("sendCards", voteInfo);
  }

  #cancel() {
    super.close();
  }
}
