import {exit, log} from "../../main.mjs"
import {getEventId, getStreamedSet, initRequester} from "../common/queries.js";
import {writeSet} from "../common/obs.js"
import {extract_data, save_data} from "../common/config.js";
import promptSync from 'prompt-sync';
const prompt = promptSync({sigint: true});

/**
 * Run the app in the shell
 */
export async function main_shell() {
    console.log("Welcome in the startgg-obs app ! To exit the program, close the window or type Ctr+C (or Cmd+C)\n\n");

    let data = await setupData();
    initRequester(data.api_token);
    let eventId = await getEvent(data);

    let unknown_error_timeout = 0;
    let main = setInterval(() => mainLoop(data, eventId), 2.5 * 1000);


    /**
     * Get the id of the event in start gg using given data
     */
    async function getEvent(data) {
        // Get the event id for the given tournament and event
        const eventId = await getEventId(data.tournament_slug, data.event_slug);
        // If we didn't find the event we log the corresponding error msg
        exit(eventId === -1, 'Event not found. (slug = identifier in the url, ex: ultimate-singles")', true);
        exit(eventId === -2, "Tournament not found. (slug = identifier in the url, ex: pound-2022)", true);
        exit(eventId === -3, "Application exited.", true); // Explanation already logged in getEventId

        // If we found the event, we log it
        if (eventId >= 0) log("Event id of \'" + data.event_slug + "\' of \'" + data.tournament_slug + "\' : " + eventId);

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
        } else if (set === -2) { // Happens from times to times, not a big deal
            // Detects if it is a big deal
            if (unknown_error_timeout === 10) {
                await getStreamedSet(eventId, true);
            }
            return;
        }
        else if (set === -4) exit(true, "Fatal error: application terminated");
        unknown_error_timeout = 0;

        let round = set.fullRoundText,
            name1 = set.slots[0].entrant.name,
            name2 = set.slots[1].entrant.name,
            score1 = set.slots[0].standing.stats.score.value === null ? 0 : set.slots[0].standing.stats.score.value,
            score2 = set.slots[1].standing.stats.score.value === null ? 0 : set.slots[1].standing.stats.score.value;

        // If it is Grand Final, we specify which player come from loser side
        if (round === "Grand Final") name2 += " (L) ";
        // We swap players because start.gg do it and it is extremely inconvenient
        if (round === "Grand Final Reset") {
            let tmp = name1;
            name1 = name2; name2 = tmp;

            tmp = score1;
            score1 = score2; score2 = tmp;
        }

        let err = writeSet(round, name1, score1, name2, score2);
        if (err) log(err)
        else log("Updated successfully");
    }


    /**
     * Load the data from the config.json file, ask for updates and return the data
     */
    async function setupData() {
        let data = extract_data();

        // Asking for data update
        let changing = true;
        while (changing) {
            console.log("Current settings:\n" +
                "   API token: \x1b[32m%s\x1b[0m \n" +
                "   Tournament: \x1b[32m%s\x1b[0m \n" +
                "   Event: \x1b[32m%s\x1b[0m", data.api_token, data.tournament_slug, data.event_slug);

            let resp = prompt("Are those settings correct ? [y/n]");
            if (resp.includes("n")) {
                await updateSettings(data);
            } else changing = false;
        }

        // Saving
        save_data(data);
        return data;
    }

    /**
     * Ask the user to change values in the config.json file
     */
    async function updateSettings(data) {
        console.log("Please change the settings you want to change in the format: <index> <arguments> or type exit to continue \nex: \"2 https://start.gg/tournament/pound-2022/event/ultimate-singles\"\n\n" +
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
}