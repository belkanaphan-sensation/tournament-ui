import { defineStore } from 'pinia'

export const createParticipantCardStore = (id) => {
    return defineStore(`participantCard-${id}`, {

    state: () => ({
        id: undefined,
        criteria: [],
    }),

    actions: {
        setId(id) {
            this.id = id;
        },
        setParticipants(participants) {
            this.participants = participants || []
        },
        setCriteria(criteria) {
            this.criteria = criteria || []
        }
    }
}) ()
}