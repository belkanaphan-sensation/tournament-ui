import { defineStore } from 'pinia'

export const createMilestoneCardStore = (id) => {
    return defineStore(`milestoneCard-${id}`, {

    state: () => ({
        id: undefined,
        name: undefined,
        description: undefined,
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