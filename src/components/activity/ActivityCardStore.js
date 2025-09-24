import { defineStore } from 'pinia'

export const createActivityCardStore = (id) => {
    return defineStore(`activityCard-${id}`, {

    state: () => ({
        id: undefined,
        name: undefined,
        description: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        state: undefined,
        stateDisplayValue: undefined,
        completedCount: undefined,
        allCount: undefined
    }),

    actions: {
        setId(id) {
            this.id = id;
        },
        setName(name) {
            this.name = name ?? '';
        },
        setDescription(description) {
            this.description = description ?? '';
        },
        setStartDateTime(startDateTime) {
            this.startDateTime = startDateTime ?? '';
        },
        setEndDateTime(endDateTime) {
            this.endDateTime = endDateTime ?? '';
        },
        setState(state) {
            this.state = state ?? '';
        },
        setStateDisplayValue(stateDisplayValue) {
            this.stateDisplayValue = stateDisplayValue ?? '';
        },
        setAllCount(allCount) {
            this.allCount = allCount ?? '';
        },
        setCompletedCount(completedCount) {
            this.completedCount = completedCount ?? '';
        }
    }
}) ()
}