// Similar syntax to importing, but note that this is object destructuring rather than an actual import
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MVPVotingCardApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(voteInfo) {
    super();
    this.voteInfo = voteInfo;
  }

  static DEFAULT_OPTIONS = {
    id: "mvp-voting-card-app",
    position: {
      width: "auto",
      height: "auto",
    },
    window: {
      title: "MVP Voting Card - Choose Your MVP",
      resizable: false,
    },
  };

  static PARTS = {
    form: {
      template: "modules/mvp-vote/templates/voting-card.hbs",
    },
  };

  _prepareContext() {
    this.candidates = this.voteInfo.candidates.map((el) => {
      const user = game.users.get(el);
      const hasCharacter = user.character ? true : false;

      return {
        userId: user.id,
        userName: user.name,
        userPronouns: user.pronouns,
        color: user.color.css,
        img: hasCharacter ? user.character.prototypeToken.texture.src : user.avatar,

        actorName: user?.character?.name,
      };
    });

    // Find and remove user using splice
    const index = this.candidates.findIndex((element) => element.userId === game.user.id);
    if (index !== -1) {
      this.candidates.splice(index, 1);
    }

    return {
      candidates: this.candidates,
    };
  }

  _onRender(context, options) {
    for (const cand of this.candidates) {
      this.element
        .querySelector(`#voting-btn-${cand.userName}`)
        .addEventListener(
          "click",
          this.#vote.bind(this, this.element.querySelector(`#voting-btn-${cand.userName}`).getAttribute("name")),
        );
    }
  }

  async close() {
    super.close();
    await ChatMessage.create({
      content: `<b>${game.user.name}</b> has failed to vote.`,
    });
  }

  async #vote(id) {
    super.close();
    await ChatMessage.create({
      speaker: { alias: `MVP Vote` },
      content: `<b>${game.user.name}</b> has voted for <b>${game.users.get(id).name}</b>.`,
    });
  }
}
