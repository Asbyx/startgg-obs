import { gql } from 'graphql-request'

export async function getStreamedSet(graphQLClient, eventId){
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

export async function getEventId(graphQLClient, tournamentSlug, eventName) {
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

    let resp;
    try {
        resp = await graphQLClient.request(query, vars);
    } catch (e) {
        console.log(e.message);
        return -1;
    }

    if (resp.tournament === null) return -2;
    //extracting the correct id
    let eventId = -1;
    for (let i = 0; i < resp.tournament.events.length; ++i) {
        if (resp.tournament.events[i].name === eventName) eventId = resp.tournament.events[i].id;
    }
    return eventId;
}