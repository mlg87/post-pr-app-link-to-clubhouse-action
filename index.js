const fetch = require("node-fetch");
const github = require("@actions/github");
const core = require("@actions/core");

const getStoryIdFromBranch = (ref) => {
  let id = null;
  if (ref) {
    const chPatternMatch = ref.match(/ch[0-9]{5,}/);
    if (chPatternMatch) {
      const idMatch = chPatternMatch[0].match(/[0-9]{5,}/);
      id = idMatch ? idMatch[0] : null;
    }
  }
  return id;
};

(async () => {
  try {
    const { pull_request, repository } = github.context.payload;
    const appBaseUrl = core.getInput("app-base-url");
    const shortcutToken = core.getInput("shortcut-token");
    const linkText = core.getInput("link-text");
    if (!pull_request) {
      console.log("No pull_request info in payload, exiting");
      return null;
    }
    const appUrl = `${appBaseUrl}/pr-${pull_request.number}-${repository.name}`;
    const storyId = getStoryIdFromBranch(pull_request.head.ref);
    const url = `https://api.app.shortcut.com/api/v3/stories/${storyId}/comments`;
    const body = {
      text: `[${linkText}](${appUrl})`,
    };
    const headers = {
      "Content-Type": "application/json",
      "Shortcut-Token": shortcutToken,
    };
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
    if (res.ok) {
      console.log(
        `Successfully posted PR app link to Shortcut story: ${storyId}`
      );
    } else {
      console.log("Was not able to post PR app link to Shortcut story");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
