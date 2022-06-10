import {getEventId, getStreamedSet, initRequester} from "./src/queries.js";
import {writeSet} from "./src/obs.js"
import {setupData} from "./src/config.js";

console.log("Welcome in the startgg-obs app ! To exit the program, close the window or type Ctr+C (or Cmd+C)\n\n");

let data = await setupData();
initRequester(data.api_token);
let eventId = await getEvent(data);
let main = setInterval(() => mainLoop(data, eventId), 2.5 * 1000);


/**
 * Get the id of the event in start gg using given data
 */
async function getEvent(data){
    // Get the event id for the given tournament and event
    const eventId = await getEventId(data.tournament_slug, data.event_slug);

    // If we found the event, we log it
    if (eventId >= 0) log("Event id of \'" + data.event_slug + "\' of \'" + data.tournament_slug + "\' : " + eventId);

    // If we didn't find the event we log the Corresponding error msg
    exit(eventId === -1, 'Event not found. (slug = identifier in the url, ex: ultimate-singles")', true);
    exit(eventId === -2, "Tournament not found. (slug = identifier in the url, ex: pound-2022)", true);
    exit(eventId === -3, "Application exited.", true);

    return eventId;
}

/**
 * main loop: get the streamed set and update the files in obs-files
 */
async function mainLoop(data, eventId) {
    const set = await getStreamedSet(eventId);
    if (set === -1) {
        log("Streamed set not found ! (Usually takes 1 minute to find the set)");
        return;
    } else if (set === -2) exit(true, "Application terminated");

    let round = set.fullRoundText,
        name1 = set.slots[0].entrant.name,
        name2 = set.slots[1].entrant.name,
        score1 = set.slots[0].standing.stats.score.value === null ? 0 : set.slots[0].standing.stats.score.value,
        score2 = set.slots[1].standing.stats.score.value === null ? 0 : set.slots[1].standing.stats.score.value;

    //if it is Grand Final, we specify which player come from loser side
    if(round === "Grand Final") name2 += " (L)";

    let err = writeSet(round, name1, score1, name2, score2);
    if (err) log(err)
    else log("Updated successfully");
}

/**
 * Allow to log with time indicated, for more clarity.
 * Also display errors in red
 */
export function log(msg, error = false){
    let now = new Date(Date.now());
    console.log("[%s:%s:%s] %s%s%s", now.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}), now.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}), now.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}), msg, (error ? "\x1b[31m" : ""), "\x1b[0m");
}

/**
 * Terminate the program if given condition is true and display the given message
 */
function exit(cond, msg) {
    if (cond) {
        log(msg);
        process.exit(1);
    }
}