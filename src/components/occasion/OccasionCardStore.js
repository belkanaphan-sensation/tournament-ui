import { defineStore } from 'pinia'

export const createOccasionCardStore = (id) => {
    return defineStore(`occasionCard-${id}`, {

    state: () => ({
        name: undefined,
        startDate: undefined,
        description: undefined,
        status: undefined,
        completedCount: undefined,
        allCount: undefined
    }),

    actions: {
        setName(name) {
            this.name = name ?? '';
        },
        setStartDate(startDate) {
            this.startDate = startDate ?? '';
        },
        setDescription(description) {
            this.description = description ?? '';
        },
        setStatus(status) {
            this.status = status ?? '';
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