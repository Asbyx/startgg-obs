import { GraphQLClient, gql } from 'graphql-request'
import fs from 'fs';

const graphQLClient = new GraphQLClient('https://api.smash.gg/gql/alpha', { //fixme: may have to be changed soon
    headers: {
        authorization: 'Bearer [TODO: FILL HERE YOUR START GG API TOKEN]',
    },
});

//check that arguments are correctly given
exit(process.argv[2] === undefined, "Missing tournament slug in command arguments (slug = identifier in the url, ex: weekl-ebou-1)");
exit(process.argv[3] === undefined, "Missing event name in command arguments");
const tournamentSlug = process.argv[2];
const eventName = process.argv[3];

//get the event id for the given tournament and event
const eventId = await getEventId(tournamentSlug, eventName);
console.log("Event id of \'" + eventName + "\' of \'" + tournamentSlug + "\' : " + eventId);
exit(eventId === -1, "Event not found.") // fixme: unprecise: we don't know if it is an error from the slug or the event name

setInterval( async function () {
    const set = await getStreamedSet(eventId);
    exit(set === -1, "Streamed set not found");

    const variables = {
        round: set.fullRoundText,
        name1: set.slots[0].entrant.name,
        name2: set.slots[1].entrant.name,
        score1: set.slots[0].standing.stats.score.value === null ? 0 : set.slots[0].standing.stats.score.value,
        score2: set.slots[1].standing.stats.score.value === null ? 0 : set.slots[1].standing.stats.score.value,
    }

    fs.writeFile("round.txt", variables.round, (err) => {
        if (err) console.log(err);
    });
    fs.writeFile("name1.txt", variables.name1, (err) => {
        if (err) console.log(err);
    });
    fs.writeFile("name2.txt", variables.name2, (err) => {
        if (err) console.log(err);
    });
    fs.writeFile("score1.txt", variables.score1.toString(), (err) => {
        if (err) console.log(err);
    });
    fs.writeFile("score2.txt", variables.score2.toString(), (err) => {
        if (err) console.log(err);
    });
    console.log("Updated successfully");
}, 10 * 1000); //every 10 seconds

async function getStreamedSet(eventId){
    const query = gql`
    query getInProgressSets($id: ID) {
        event(id: $id){
            sets (filters: {
                state: 2 # = in progress
            }){
                nodes {
                    stream {
                        id
                    }
                    fullRoundText
                    slots {
                        entrant {
                            name
                        }
                        standing {
                            stats {
                                score {
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    `;
    const vars = {
        id: eventId
    };
    const resp = await graphQLClient.request(query, vars);

    //extract the set which has a stream
    for (let i = 0; i < resp.event.sets.nodes.length; ++i) {
        const set = resp.event.sets.nodes[i];
        if (set.stream !== null){
            return set;
        }
    }
    return -1;
}

async function getEventId(tournamentSlug, eventName) {
    const query = gql`
        query getEventId($tournament: String){
          tournament(slug: $tournament){
            id
            name
            events {
                name
                id
            }
          }
        }
        `
    const vars = {
        tournament: tournamentSlug //application argument
    }
    const resp = await graphQLClient.request(query, vars);

    //extracting the correct id
    let eventId = -1;
    for (let i = 0; i < resp.tournament.events.length; ++i) {
        if (resp.tournament.events[i].name === eventName) eventId = resp.tournament.events[i].id;
    }
    return eventId;
}


function exit(cond, msg){
    if(cond){
        console.log(msg);
        process.exit(1);
    }
}
