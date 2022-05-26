import { GraphQLClient } from 'graphql-request';
import * as queries from "./src/queries";
import * as obs from "./src/obs"

const graphQLClient = new GraphQLClient('https://api.start.gg/gql/alpha', {
    headers: {
        authorization: 'Bearer [API TOKEN]',
    },
});

//check that arguments are correctly given
exit(process.argv[2] === undefined, "Missing tournament slug in command arguments (slug = identifier in the url, ex: weekl-ebou-1)");
exit(process.argv[3] === undefined, "Missing event name in command arguments");
const tournamentSlug = process.argv[2];
const eventName = process.argv[3];

//get the event id for the given tournament and event
const eventId = await queries.getEventId(graphQLClient, tournamentSlug, eventName);
if(eventId !== -1 && eventId !== -2) console.log("Event id of \'" + eventName + "\' of \'" + tournamentSlug + "\' : " + eventId);
exit(eventId === -1, "Event not found.");
exit(eventId === -2, "Tournament not found.");

setInterval( async function () {
    const set = await queries.getStreamedSet(graphQLClient, eventId);
    if(set === -1) {
        console.log("Streamed set not found !");
        return;
    }

    let round = set.fullRoundText,
    name1 =  set.slots[0].entrant.name,
    name2 =  set.slots[1].entrant.name,
    score1 =  set.slots[0].standing.stats.score.value === null ? 0 : set.slots[0].standing.stats.score.value,
    score2 =  set.slots[1].standing.stats.score.value === null ? 0 : set.slots[1].standing.stats.score.value;

    let err = obs.writeSet(round, name1, score1, name2, score2);

    if(err) console.log(err)
    else console.log("Updated successfully");
}, 5 * 1000); //every 5 seconds


function exit(cond, msg){
    if(cond){
        console.log(msg);
        process.exit(1);
    }
}
