const core = require('@actions/core');
const wait = require('./wait');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
    try {
        const ms = core.getInput('milliseconds');
        core.info(`Waiting ${ms} milliseconds ...`);

        const myToken = core.getInput('myToken');
        const octokit = github.getOctokit(myToken)
        const context = github.context;

        const {repository} = await octokit.graphql(`
    {
      commit(repository: "${context.repo.name}", last: 3) {
        abbreviatedOid
        author
        message
      }
    }`);
        console.log(repository);

        core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
        await wait(parseInt(ms));
        core.info((new Date()).toTimeString());

        core.setOutput('time', new Date().toTimeString());
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
