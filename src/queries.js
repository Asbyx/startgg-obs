import {gql, GraphQLClient} from 'graphql-request'

let graphQLClient;
/**
 * Initialise the requester with the given api_token
 */
export function initRequester(api_token){
    graphQLClient = new GraphQLClient('https://api.start.gg/gql/alpha', {
        headers: {
            authorization: 'Bearer ' + api_token,
        },
    });
}

/**
 * Getter for the set currently started and streamed
 * @returns {Promise<number>} the set id in the start.gg api. Error codes: -1 if not on-going streamed set has been found | -2 if an error occurred while requesting the set
 */
export async function getStreamedSet(eventId){
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
    let resp;
    try {
        resp = await graphQLClient.request(query, vars);
    } catch (e) {
        const json = JSON.parse(e.message.substring(e.message.indexOf("{")));
        if(json.response.message !== undefined) console.log("Error when queried the streamed set: \x1b[31m" + json.response.message + "\x1b[0m");
        else console.log(e);
        return -2;
    }

    //extract the set which has a stream
    for (let i = 0; i < resp.event.sets.nodes.length; ++i) {
        const set = resp.event.sets.nodes[i];
        if (set.stream !== null){
            return set;
        }
    }
    return -1;
}

/**
 * Return the event id corresponding to the given event in the given tournament
 * @returns {Promise<number>} id of the event. Error codes: -1 : event not found | -2 : tournament not found | -3 request error
 */
export async function getEventId(tournamentSlug, eventSlug) {
    const query = gql`
        query getEventId($tournament: String){
          tournament(slug: $tournament){
            id
            name
            events {
                slug
                id
            }
          }
        }
        `
    const vars = {
        tournament: tournamentSlug //application argument
    }

    let resp;
    try {
        resp = await graphQLClient.request(query, vars);
    } catch (e) {
        const json = JSON.parse(e.message.substring(e.message.indexOf("{")));
        console.log("Error when queried the tournament: \x1b[31m" + json.response.message + "\x1b[0m");
        return -3;
    }

    if (resp.tournament === null) return -2;
    //extracting the correct id
    let eventId = -1;
    for (let i = 0; i < resp.tournament.events.length; ++i) {
        if (resp.tournament.events[i].slug.endsWith(eventSlug)) eventId = resp.tournament.events[i].id;
    }
    return eventId;
}