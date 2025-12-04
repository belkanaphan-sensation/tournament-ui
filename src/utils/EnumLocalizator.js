export const occasionStateEnum = {
    DRAFT: "Черновик",
    PLANNED: "Запланирован",
    IN_PROGRESS: "В процессе",
    COMPLETED: "Завершено"
}

export const activityStateEnum = {
    DRAFT: "Черновик",
    PLANNED: "Запланирован",
    IN_PROGRESS: "В процессе",
    COMPLETED: "Завершено",
    REGISTRATION_CLOSED: "Завершена регистрация",
    SUMMARIZING: "Подсчет результатов",
}

export const milestoneStateEnum = {
    DRAFT: "Черновик",
    PLANNED: "Запланирован",
    IN_PROGRESS: "В процессе",
    COMPLETED: "Завершено",
    PENDING: "Ожидает Старта",
    SUMMARIZING: "Подсчет результатов",
    SKIPPED: "Пропущен"
}

export const roundStateEnum = {
    OPENED: "Открыт",
    CLOSED: "Закрыт",
}

export const userStatusEnum = {
    ACTIVE: "Активный",
    BLOCKED: "Заблокирован",
    BANNED: "Забанен",
    DELETED: "Удален"
}

export const roleEnum = {
    SUPERADMIN: 'Супер админ',
    ADMIN: 'Админ',
    OCCASION_ADMIN: 'Админ мероприятия',
    USER: 'Пользователь',
    READER: 'Шпион'
}

export const positionEnum = {
    JUDGE_CHIEF: 'Главный судья',
    JUDGE: 'Судья',
    PARTICIPANT: 'Участник',
    ORGANIZER: 'Организатор',
    OBSERVER: 'Наблюдатель'
}

export const roundResultStatusEnum = {
    NOT_READY: 'Оценка раунда не завершена',
    READY: 'Оценка раунда завершена'
}

export const partnerSideEnum = {
    LEADER: 'Партнер',
    FOLLOWER: 'Партнерша'
}

export const passStatusEnum = {
    PASSED: 'Прошел',
    PENDING: 'Ожидает решения',
    FAILED: 'Не прошел'
}