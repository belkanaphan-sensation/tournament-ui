import { defineStore } from 'pinia'

export const createActivityCardStore = (id) => {
    return defineStore(`activityCard-${id}`, {

    state: () => ({
        id: undefined,
        name: undefined,
        description: undefined,
        startDate: undefined,
        endDate: undefined,
        status: undefined,
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
        setStartDate(startDate) {
            this.startDate = startDate ?? '';
        },
        setEndDate(endDate) {
            this.endDate = endDate ?? '';
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