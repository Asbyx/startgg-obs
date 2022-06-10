import fs from "fs";
import promptSync from 'prompt-sync';
import {log} from "../main.mjs"
const prompt = promptSync({sigint: true});

/**
 * Load the data from the config.json file, ask for updates and return the data
 */
export async function setupData() {
    let data = JSON.parse(fs.readFileSync("./config.json", "utf8"));

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
    fs.writeFile("./config.json", JSON.stringify(data), err => {if(err) log(err); else log("Data have been correctly updated and written in config.json.")});
    return data;
}

/**
 * Ask the user to change values in the config.json file
 */
export async function updateSettings(data) {
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
