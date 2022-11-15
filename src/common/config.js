import fs from "fs";
import {log} from "../../main.mjs"

/**
 * Extract the data from the file config.json.
 * Returns Object : {api_token, tournament_slug, event_slug}
 * @return Object
 */
export function extract_data(){
    let data;
    try {
        data = JSON.parse(fs.readFileSync("./config.json", "utf8"));
    } catch (e) {
        log("Corrupted config file detected, fixing.", true)
        data = {}
    }

    // Detect and recover from corruption
    if (data.api_token === undefined) data.api_token = "Undefined";
    if (data.tournament_slug === undefined) data.tournament_slug = "Undefined";
    if (data.event_slug === undefined) data.event_slug = "Undefined";
    return data;
}

/**
 * Save the data in the file config.json.
 */
export function save_data(data){
    fs.writeFile("./config.json", JSON.stringify(data), err => {if(err) log(err); else log("Config have been correctly written in config.json.")});
}