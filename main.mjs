import {GraphQLClient} from 'graphql-request';
import * as queries from "./src/queries.js";
import * as obs from "./src/obs.js"

//check that arguments are correctly given
exit(process.argv.length !== 5, "Invalid number of arguments. Require 3 (<api token> <tournament slug> <event name>)");
const apiToken = process.argv[2]
const tournamentSlug = process.argv[3];
const eventName = process.argv[4];


const graphQLClient = new GraphQLClient('https://api.start.gg/gql/alpha', {
    headers: {
        authorization: 'Bearer ' + apiToken,
    },
});

//get the event id for the given tournament and event
const eventId = await queries.getEventId(graphQLClient, tournamentSlug, eventName);
if (eventId >= 0) console.log("Event id of \'" + eventName + "\' of \'" + tournamentSlug + "\' : " + eventId);
exit(eventId === -1, 'Event not found. (If it takes more than 1 word, you need to add quotes. ex: "Ultimate singles")');
exit(eventId === -2, "Tournament not found. (slug = identifier in the url, ex: pound-2022)");
exit(eventId === -3, "Application exited.");

//main loop: get the streamed set and update the files in obs-files
setInterval(async function () {
    const set = await queries.getStreamedSet(graphQLClient, eventId);
    if (set === -1) {
        console.log("Streamed set not found !");
        return;
    }

    let round = set.fullRoundText,
        name1 = set.slots[0].entrant.name,
        name2 = set.slots[1].entrant.name,
        score1 = set.slots[0].standing.stats.score.value === null ? 0 : set.slots[0].standing.stats.score.value,
        score2 = set.slots[1].standing.stats.score.value === null ? 0 : set.slots[1].standing.stats.score.value;

    //if it is Grand Final, we specify which player come from loser side
    if(round === "Grand Final") name2 += " (L)";

    let err = obs.writeSet(round, name1, score1, name2, score2);

    if (err) console.log(err)
    else console.log("Updated successfully");
}, 5 * 1000); //every 5 seconds


function exit(cond, msg) {
    if (cond) {
        console.log(msg);
        process.exit(1);
    }
}
