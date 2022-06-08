//todo: clean imports, make the main just calls of function to make it super clear

import {GraphQLClient} from 'graphql-request';
import * as queries from "./src/queries.js";
import * as obs from "./src/obs.js"
import fs from "fs";
import promptSync from 'prompt-sync';

const prompt = promptSync({sigint: true});

var data = JSON.parse(fs.readFileSync("./config.json", "utf8"));

var changing = true;
while (changing) {
    console.log("Current settings:\n" +
        "   API token: \x1b[32m%s\x1b[0m \n" +
        "   Tournament: \x1b[32m%s\x1b[0m \n" +
        "   Event: \x1b[32m%s\x1b[0m", data.api_token, data.tournament_slug, data.event_slug);

    let resp = prompt("Are those settings correct [y/n]");
    if (resp.includes("n")) {
        await updateSettings();
    } else changing = false;
}
fs.writeFile("./config.json", JSON.stringify(data), err => {if(err) console.log(err); else console.log("Data have been correctly updated and written in config.json.")});

async function updateSettings() {
    console.log("Please change the settings you want to change in the format: <index> <arguments> ex: \"1 0123456789\"\n" +
        "   1: API token\n" +
        "   2: URL of the event in start.gg (may not work every time, in case of failure use the slugs)\n" +
        "   3: Slugs of the tournament (names in the url, ex: \"3 pound-2022 ultimate-singles)\"\n");
    let resp = prompt("> ");
    switch (resp.charAt(0)) {
        case "1":
            data.api_token = resp.substring(2);
            break;

        case "2":
            let url = resp.substring(11).split("/");
            data.tournament_slug = url[2];
            data.event_slug = url[4];
            break;

        case "3":
            let args = resp.substring(2).split(" ")
            data.tournament_slug = args[0];
            data.event_slug = args[1];
            break;
    }
    console.log("\n");
}

const graphQLClient = new GraphQLClient('https://api.start.gg/gql/alpha', {
    headers: {
        authorization: 'Bearer ' + data.api_token,
    },
});

//get the event id for the given tournament and event
const eventId = await queries.getEventId(graphQLClient, data.tournament_slug, data.event_slug);
if (eventId >= 0) console.log("Event id of \'" + data.event_slug + "\' of \'" + data.tournament_slug + "\' : " + eventId);
exit(eventId === -1, 'Event not found. (slug = identifier in the url, ex: ultimate-singles")');
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
}, 2.5 * 1000); //every 2.5 seconds



function exit(cond, msg) {
    if (cond) {
        console.log(msg);
        process.exit(1);
    }
}