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

        const {commits} = await octokit.graphql(`
        {
            repository(owner: "${context.repo.owner}", name: "${context.repo.name}") {
                defaultBranchRef {
                    target {
                        ... on Commit{
                            history(first:10){
                                edges{
                                    node{
                                        ... on Commit{
                                            message
                                            committedDate
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        `);
        console.log(JSON.stringify(commits));

        core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
        await wait(parseInt(ms));
        core.info((new Date()).toTimeString());

        core.setOutput('time', new Date().toTimeString());
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
