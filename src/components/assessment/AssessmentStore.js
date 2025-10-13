import { defineStore } from 'pinia'

export const createAssessmentStore = (id) => {
    return defineStore(`assessmentCard-${id}`, {

    state: () => ({
        id: undefined,
        participants: [],
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