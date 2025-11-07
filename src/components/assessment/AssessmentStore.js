import { defineStore } from 'pinia'

export const createAssessmentStore = (id) => {
    return defineStore(`assessmentCard-${id}`, {

    state: () => ({
        id: undefined,
        participants: [],
        criterion: [],
    }),

    actions: {
        setId(id) {
            this.id = id;
        },
        setParticipants(participants) {
            this.participants = participants || []
        },
        setCriterion(criterion) {
            this.criterion = criterion || []
        }
    }
}) ()
}