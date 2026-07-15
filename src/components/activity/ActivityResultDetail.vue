<template>
    <div class="activity-result-detail-page">
        <!-- Control panel -->
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            
            <!-- Заголовок -->
            <div class="activity-details" v-if="activity">
                <div class="activity-header">
                    <div class="header-left">
                        <h1 class="activity-title">Результаты активности: {{ activity.name }}</h1>
                    </div>
                    <div class="header-actions">
                        <button 
                            v-for="(action, index) in getHeaderActions()" 
                            :key="index"
                            :class="['action-btn', action.class]"
                            @click="action.onClick"
                        >
                            {{ action.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchActivityResults">Попробовать снова</button>
            </div>

            <!-- Состояние пустых результатов -->
            <div v-if="!isLoading && !error && Object.keys(milestoneResults).length === 0" class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>Нет результатов</h3>
                <p>Для этой активности еще нет доступных результатов</p>
            </div>

            <!-- Таблицы с результатами по этапам -->
            <div v-if="Object.keys(milestoneResults).length > 0" class="results-container">
                <!-- Результаты по каждому этапу (ключ - порядковый номер этапа) -->
                <div v-for="(results, milestoneOrder) in milestoneResults" 
                     :key="milestoneOrder" 
                     class="milestone-section">
                    
                    <!-- Заголовок этапа -->
                    <div class="milestone-header">
                        <h2 class="milestone-title">
                            Этап {{ milestoneOrder }}
                            <span v-if="results[0]?.milestone" class="milestone-name">
                                - {{ results[0].milestone.value }}
                            </span>
                        </h2>
                    </div>

                    <!-- Разделение по сторонам -->
                    <div class="sides-container">
                        <!-- Таблица для Партнеров (LEADER) -->
                        <div v-if="getSideResults(results, 'LEADER').length > 0" class="side-section leader-section">
                            <div class="side-header">
                                <h3 class="side-title">
                                    <span class="side-icon">👨</span>
                                    Партнеры
                                    <span class="side-count">({{ getSideResults(results, 'LEADER').length }})</span>
                                </h3>
                            </div>

                            <div class="table-container">
                                <table class="results-table leader-table">
                                    <thead>
                                        <tr>
                                            <th>Место (ручное)</th>
                                            <th>Авто место</th>
                                            <th>Конкурсант</th>
                                            <th>Номер</th>
                                            <th>Тип</th>
                                            <th>Участники</th>
                                            <th>Решение организатора</th>
                                            <th>Решение по оценкам</th>
                                            <th>Результаты раундов</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(result, index) in getSortedResults(getSideResults(results, 'LEADER'))" 
                                            :key="result.id"
                                            :class="getResultRowClass(result)">
                                            
                                            <td class="text-center place-input-cell">
                                                <input 
                                                    type="number" 
                                                    v-model="manualPlaces[result.contestant?.id]" 
                                                    @change="saveManualPlace(result)"
                                                    class="place-input"
                                                    min="1"
                                                    :max="getMaxPlaceForSide(result)"
                                                    :title="`Введите место от 1 до ${getMaxPlaceForSide(result)}`"
                                                    placeholder="Введите место"
                                                />
                                                <div v-if="getSavedPlace(result.contestant?.id)" class="saved-place-hint">
                                                    Сохранено: {{ getSavedPlace(result.contestant?.id) }}
                                                </div>
                                            </td>
                                            
                                            <!-- Автоматическое место -->
                                            <td class="text-center auto-place-cell">
                                                <span class="auto-place-badge" :class="getAutoPlaceClass(index + 1)">
                                                    {{ index + 1 }}
                                                </span>
                                            </td>
                                            
                                            <!-- Конкурсант -->
                                            <td>
                                                <span v-if="result.contestant">
                                                    {{ result.contestant.number }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Номер конкурсанта -->
                                            <td class="text-center">
                                                <span v-if="result.contestant">
                                                    №{{ result.contestant.number }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Тип конкурсанта -->
                                            <td class="text-center">
                                                <span v-if="result.contestant" class="contestant-type">
                                                    {{ formatContestantType(result.contestant.contestantType) }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Участники -->
                                            <td>
                                                <div v-if="result.contestant?.participants" class="participants-cell">
                                                    <div v-for="participant in result.contestant.participants" 
                                                         :key="participant.participantId"
                                                         class="participant-info leader-participant">
                                                        {{ participant.name }} {{ participant.surname }}
                                                        <span v-if="participant.partnerSide" class="partner-side">
                                                            ({{ formatPartnerSide(participant.partnerSide) }})
                                                        </span>
                                                    </div>
                                                </div>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Решение организатора -->
                                            <td class="text-center">
                                                <span class="decision-badge" :class="getFinalApprovalClass(result.finallyApproved)">
                                                    {{ formatFinalApproval(result.finallyApproved) }}
                                                </span>
                                            </td>
                                            
                                            <!-- Решение по оценкам -->
                                            <td class="text-center">
                                                <span class="decision-badge" :class="getPassStatusClass(result.judgePassed)">
                                                    {{ formatPassStatus(result.judgePassed) }}
                                                </span>
                                            </td>
                                            
                                            <!-- Результаты раундов -->
                                            <td>
                                                <div v-if="result.milestoneRoundResults?.length > 0" class="rounds-cell">
                                                    <!-- Общий суммарный балл -->
                                                    <div class="total-score-summary leader-score">
                                                        <span class="total-score-label">{{ getTotalScoreLabel(result) }}</span>
                                                        <span class="total-score-value">{{ getDisplayScore(result) }}</span>
                                                    </div>
                                                    
                                                    <!-- Детали по раундам -->
                                                    <div v-for="roundResult in result.milestoneRoundResults" 
                                                         :key="roundResult.id"
                                                         class="round-result">
                                                        <div class="round-header">
                                                            <span class="round-name">
                                                                {{ roundResult.round?.value || 'Раунд' }}
                                                            </span>
                                                            <span v-if="roundResult.fromExtraRound" class="extra-round-badge">
                                                                доп.
                                                            </span>
                                                        </div>
                                                        <div class="round-details">
                                                            <span class="round-order">Порядок: {{ roundResult.roundOrder || '-' }}</span>
                                                            <span class="round-status" :class="getPassStatusClass(roundResult.judgePassed)">
                                                                {{ formatPassStatus(roundResult.judgePassed) }}
                                                            </span>
                                                            <span class="round-score">{{ getRoundScoreLabel(roundResult, result) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span v-else class="no-data">Нет данных</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Таблица для Партнерш (FOLLOWER) -->
                        <div v-if="getSideResults(results, 'FOLLOWER').length > 0" class="side-section follower-section">
                            <div class="side-header">
                                <h3 class="side-title">
                                    <span class="side-icon">👩</span>
                                    Партнерши
                                    <span class="side-count">({{ getSideResults(results, 'FOLLOWER').length }})</span>
                                </h3>
                            </div>

                            <div class="table-container">
                                <table class="results-table follower-table"> 
                                    <thead>
                                        <tr>
                                            <th>Место (ручное)</th>
                                            <th>Авто место</th>
                                            <th>Конкурсант</th>
                                            <th>Номер</th>
                                            <th>Тип</th>
                                            <th>Участники</th>
                                            <th>Решение организатора</th>
                                            <th>Решение по оценкам</th>
                                            <th>Результаты раундов</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(result, index) in getSortedResults(getSideResults(results, 'FOLLOWER'))" 
                                            :key="result.id"
                                            :class="getResultRowClass(result)">
                                            
                                            <!-- Место (ручной ввод) -->
                                            <td class="text-center place-input-cell">
                                                <input 
                                                    type="number" 
                                                    v-model="manualPlaces[result.contestant?.id]" 
                                                    @change="saveManualPlace(result)"
                                                    class="place-input"
                                                    min="1"
                                                    :max="getMaxPlaceForSide(result)"
                                                    :title="`Введите место от 1 до ${getMaxPlaceForSide(result)}`"
                                                    placeholder="Введите место"
                                                />
                                                <div v-if="getSavedPlace(result.contestant?.id)" class="saved-place-hint">
                                                    Сохранено: {{ getSavedPlace(result.contestant?.id) }}
                                                </div>
                                            </td>
                                            
                                            <!-- Автоматическое место -->
                                            <td class="text-center auto-place-cell">
                                                <span class="auto-place-badge" :class="getAutoPlaceClass(index + 1)">
                                                    {{ index + 1 }}
                                                </span>
                                            </td>
                                            
                                            <!-- Конкурсант -->
                                            <td>
                                                <span v-if="result.contestant">
                                                    {{ result.contestant.number }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Номер конкурсанта -->
                                            <td class="text-center">
                                                <span v-if="result.contestant">
                                                    №{{ result.contestant.number }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Тип конкурсанта -->
                                            <td class="text-center">
                                                <span v-if="result.contestant" class="contestant-type">
                                                    {{ formatContestantType(result.contestant.contestantType) }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Участники -->
                                            <td>
                                                <div v-if="result.contestant?.participants" class="participants-cell">
                                                    <div v-for="participant in result.contestant.participants" 
                                                         :key="participant.participantId"
                                                         class="participant-info follower-participant">
                                                        {{ participant.name }} {{ participant.surname }}
                                                        <span v-if="participant.partnerSide" class="partner-side">
                                                            ({{ formatPartnerSide(participant.partnerSide) }})
                                                        </span>
                                                    </div>
                                                </div>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Решение организатора -->
                                            <td class="text-center">
                                                <span class="decision-badge" :class="getFinalApprovalClass(result.finallyApproved)">
                                                    {{ formatFinalApproval(result.finallyApproved) }}
                                                </span>
                                            </td>
                                            
                                            <!-- Решение по оценкам -->
                                            <td class="text-center">
                                                <span class="decision-badge" :class="getPassStatusClass(result.judgePassed)">
                                                    {{ formatPassStatus(result.judgePassed) }}
                                                </span>
                                            </td>
                                            
                                            <!-- Результаты раундов -->
                                            <td>
                                                <div v-if="result.milestoneRoundResults?.length > 0" class="rounds-cell">
                                                    <!-- Общий суммарный балл -->
                                                    <div class="total-score-summary follower-score">
                                                        <span class="total-score-label">{{ getTotalScoreLabel(result) }}</span>
                                                        <span class="total-score-value">{{ getDisplayScore(result) }}</span>
                                                    </div>
                                                    
                                                    <!-- Детали по раундам -->
                                                    <div v-for="roundResult in result.milestoneRoundResults" 
                                                         :key="roundResult.id"
                                                         class="round-result">
                                                        <div class="round-header">
                                                            <span class="round-name">
                                                                {{ roundResult.round?.value || 'Раунд' }}
                                                            </span>
                                                            <span v-if="roundResult.fromExtraRound" class="extra-round-badge">
                                                                доп.
                                                            </span>
                                                        </div>
                                                        <div class="round-details">
                                                            <span class="round-order">Порядок: {{ roundResult.roundOrder || '-' }}</span>
                                                            <span class="round-status" :class="getPassStatusClass(roundResult.judgePassed)">
                                                                {{ formatPassStatus(roundResult.judgePassed) }}
                                                            </span>
                                                            <span class="round-score">{{ getRoundScoreLabel(roundResult, result) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span v-else class="no-data">Нет данных</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Участники без определенной стороны -->
                        <div v-if="getSideResults(results, 'UNKNOWN').length > 0" class="side-section unknown-section">
                            <div class="side-header">
                                <h3 class="side-title">
                                    <span class="side-icon">❓</span>
                                    Без определенной стороны
                                    <span class="side-count">({{ getSideResults(results, 'UNKNOWN').length }})</span>
                                </h3>
                            </div>

                            <div class="table-container">
                                <table class="results-table unknown-table">
                                    <thead>
                                        <tr>
                                            <th>Место (ручное)</th>
                                            <th>Авто место</th>
                                            <th>Конкурсант</th>
                                            <th>Номер</th>
                                            <th>Тип</th>
                                            <th>Участники</th>
                                            <th>Решение организатора</th>
                                            <th>Решение по оценкам</th>
                                            <th>Результаты раундов</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(result, index) in getSortedResults(getSideResults(results, 'UNKNOWN'))" 
                                            :key="result.id"
                                            :class="getResultRowClass(result)">
                                            
                                            <!-- Место (ручной ввод) -->
                                            <td class="text-center place-input-cell">
                                                <input 
                                                    type="number" 
                                                    v-model="manualPlaces[result.contestant?.id]" 
                                                    @change="saveManualPlace(result)"
                                                    class="place-input"
                                                    min="1"
                                                    :max="getMaxPlaceForSide(result)"
                                                    :title="`Введите место от 1 до ${getMaxPlaceForSide(result)}`"
                                                    placeholder="Введите место"
                                                />
                                                <div v-if="getSavedPlace(result.contestant?.id)" class="saved-place-hint">
                                                    Сохранено: {{ getSavedPlace(result.contestant?.id) }}
                                                </div>
                                            </td>
                                            
                                            <!-- Автоматическое место -->
                                            <td class="text-center auto-place-cell">
                                                <span class="auto-place-badge" :class="getAutoPlaceClass(index + 1)">
                                                    {{ index + 1 }}
                                                </span>
                                            </td>
                                            
                                            <!-- Конкурсант -->
                                            <td>
                                                <span v-if="result.contestant">
                                                    {{ result.contestant.number }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Номер конкурсанта -->
                                            <td class="text-center">
                                                <span v-if="result.contestant">
                                                    №{{ result.contestant.number }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Тип конкурсанта -->
                                            <td class="text-center">
                                                <span v-if="result.contestant" class="contestant-type">
                                                    {{ formatContestantType(result.contestant.contestantType) }}
                                                </span>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Участники -->
                                            <td>
                                                <div v-if="result.contestant?.participants" class="participants-cell">
                                                    <div v-for="participant in result.contestant.participants" 
                                                         :key="participant.participantId"
                                                         class="participant-info unknown-participant">
                                                        {{ participant.name }} {{ participant.surname }}
                                                        <span v-if="participant.partnerSide" class="partner-side">
                                                            ({{ formatPartnerSide(participant.partnerSide) }})
                                                        </span>
                                                    </div>
                                                </div>
                                                <span v-else class="no-data">-</span>
                                            </td>
                                            
                                            <!-- Решение организатора -->
                                            <td class="text-center">
                                                <span class="decision-badge" :class="getFinalApprovalClass(result.finallyApproved)">
                                                    {{ formatFinalApproval(result.finallyApproved) }}
                                                </span>
                                            </td>
                                            
                                            <!-- Решение по оценкам -->
                                            <td class="text-center">
                                                <span class="decision-badge" :class="getPassStatusClass(result.judgePassed)">
                                                    {{ formatPassStatus(result.judgePassed) }}
                                                </span>
                                            </td>
                                            
                                            <!-- Результаты раундов -->
                                            <td>
                                                <div v-if="result.milestoneRoundResults?.length > 0" class="rounds-cell">
                                                    <!-- Общий суммарный балл -->
                                                    <div class="total-score-summary unknown-score">
                                                        <span class="total-score-label">{{ getTotalScoreLabel(result) }}</span>
                                                        <span class="total-score-value">{{ getDisplayScore(result) }}</span>
                                                    </div>
                                                    
                                                    <!-- Детали по раундам -->
                                                    <div v-for="roundResult in result.milestoneRoundResults" 
                                                         :key="roundResult.id"
                                                         class="round-result">
                                                        <div class="round-header">
                                                            <span class="round-name">
                                                                {{ roundResult.round?.value || 'Раунд' }}
                                                            </span>
                                                            <span v-if="roundResult.fromExtraRound" class="extra-round-badge">
                                                                доп.
                                                            </span>
                                                        </div>
                                                        <div class="round-details">
                                                            <span class="round-order">Порядок: {{ roundResult.roundOrder || '-' }}</span>
                                                            <span class="round-status" :class="getPassStatusClass(roundResult.judgePassed)">
                                                                {{ formatPassStatus(roundResult.judgePassed) }}
                                                            </span>
                                                            <span class="round-score">{{ getRoundScoreLabel(roundResult, result) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span v-else class="no-data">Нет данных</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { activityApi } from '@/services/activityApi.js';
import { milestoneResultApi } from '@/services/milestoneResultApi.js';
import { milestoneApi } from '@/services/milestoneApi.js';
import { useRouter } from 'vue-router';

export default {
    name: 'ActivityResultDetail',

    components: {
        ControlPanel,
        UserIcon,
        LoadingOverlay
    },

    props: {
        activityId: {
            type: Number,
            required: true
        }
    },

    setup() {
        const router = useRouter();
        
        const handleBack = () => {
            router.go(-1);
        };

        return {
            handleBack
        };
    },

    data() {
        return {
            isLoading: true,
            error: null,
            activity: null,
            milestoneResults: {},
            sortBy: 'score',
            manualPlaces: {}, // { contestantId: place }
            milestones: [],
            activityResults: [] // Сохраненные результаты активности
        };
    },

    async mounted() {
        await this.fetchActivityResults();
    },

    methods: {
        async fetchActivityResults() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const activityId = this.$route.params.activityId;
                await this.fillDetail(activityId);
            } catch (err) {
                this.error = 'Не удалось загрузить результаты активности';
                console.error('Error fetching activity results:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async fillDetail(activityId) {
            this.activity = await activityApi.getActivityDetail(activityId);
            this.milestoneResults = await milestoneResultApi.getMilestoneResultByActivityId(activityId);
            this.milestones = await milestoneApi.getMilestones(activityId);
            
            // Получаем сохраненные результаты активности
            this.activityResults = await activityApi.getActivityResultsByActivityId(activityId);
            
            // Инициализируем manualPlaces из сохраненных результатов
            this.initManualPlacesFromResults();
        },

        // Инициализация manualPlaces из сохраненных результатов активности
        initManualPlacesFromResults() {
            this.manualPlaces = {};
            
            if (Array.isArray(this.activityResults)) {
                this.activityResults.forEach(result => {
                    if (result.contestant && result.contestant.id && result.place !== undefined) {
                        this.manualPlaces[result.contestant.id] = result.place;
                    }
                });
            }
            
            console.log('Manual places initialized from saved results:', this.manualPlaces);
        },

        getHeaderActions() {
            if (!this.activity) return [];

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const role = userInfo?.roles?.[0];

            const actions = [
                {
                    label: 'Сохранить',
                    class: 'default-action-btn',
                    onClick: () => this.saveActivityResult(),
                    visible: (this.activity.state === 'IN_PROGRESS' || this.activity.state === 'SUMMARIZING') && 
                            this.milestones.every(milestone => 
                                ['COMPLETED', 'SKIPPED'].includes(milestone.state)) && 
                            role === 'SUPERADMIN'
                },
            ];

            return actions.filter(action => action.visible);
        },

        async saveActivityResult() {
            const activityResultForSave = [];
            
            // Проходим по всем записям в manualPlaces
            for (const contestantId in this.manualPlaces) {
                const place = this.manualPlaces[contestantId];
                
                // Проверяем, что место указано
                if (place !== undefined && place !== null) {
                    activityResultForSave.push({
                        contestantId: Number(contestantId),
                        place: Number(place)
                    });
                }
            }

            this.isLoading = true;
            this.error = null;
            
            try {
                await activityApi.sumUpActivity(this.activity.id, activityResultForSave);
                // После сохранения обновляем данные
                await this.fillDetail(this.activity.id);
            } catch (err) {
                this.error = 'Не удалось сохранить результаты';
                console.error('Error saving activity results:', err);
                alert('Ошибка при сохранении результатов');
            } finally {
                this.isLoading = false;
            }
        },

        // Получение сохраненного места для конкурсанта
        getSavedPlace(contestantId) {
            if (!Array.isArray(this.activityResults)) return null;
            
            const savedResult = this.activityResults.find(
                result => result.contestant && result.contestant.id === contestantId
            );
            
            return savedResult ? savedResult.place : null;
        },

        // Получение результатов по стороне
        getSideResults(results, side) {
            if (!Array.isArray(results)) return [];
            
            if (side === 'UNKNOWN') {
                return results.filter(result => !this.getPrimaryPartnerSide(result));
            }
            
            return results.filter(result => {
                const primarySide = this.getPrimaryPartnerSide(result);
                return primarySide === side;
            });
        },

        // Сохранение ручного места (локальное состояние)
        saveManualPlace(result) {
            const contestantId = result.contestant?.id;
            if (!contestantId) {
                console.error('No contestantId found for result:', result);
                return;
            }
            
            const place = this.manualPlaces[contestantId];
            
            // Валидация ввода
            if (place < 1) {
                this.manualPlaces[contestantId] = undefined;
            } else if (place > this.getMaxPlaceForSide(result)) {
                this.manualPlaces[contestantId] = this.getMaxPlaceForSide(result);
            }
            
            console.log(`Saved manual place for contestant ${contestantId}: ${this.manualPlaces[contestantId]}`);
        },

        // Вспомогательный метод для определения максимального места
        getMaxPlaceForSide(result) {
            if (!this.milestoneResults || !result.milestone?.order) {
                return 100;
            }
            
            const milestoneOrder = result.milestone.order;
            const milestoneResults = this.milestoneResults[milestoneOrder];
            
            if (!Array.isArray(milestoneResults)) {
                return 100;
            }
            
            const side = this.getPrimaryPartnerSide(result);
            const sideResults = this.getSideResults(milestoneResults, side);
            return sideResults.length;
        },

        getSortedResults(results) {
            if (!Array.isArray(results)) return [];
            
            let sortedResults = [...results];
            const placeMode = this.isPlaceAssessment(results[0]);
            
            return sortedResults.sort((a, b) => {
                const scoreA = this.getDisplayScore(a);
                const scoreB = this.getDisplayScore(b);
                return placeMode ? scoreA - scoreB : scoreB - scoreA;
            });
        },

        isPlaceAssessment(result) {
            return result?.assessmentMode === 'PLACE';
        },

        getTotalScoreLabel(result) {
            return this.isPlaceAssessment(result) ? 'Итоговое место:' : 'Суммарный балл:';
        },

        getRoundScoreLabel(roundResult, result) {
            const value = roundResult?.totalScore || 0;
            return this.isPlaceAssessment(result) ? `Место: ${value}` : `Баллы: ${value}`;
        },

        /** Для PLACE — место из последнего раунда; для SCORE/PASS — сумма баллов. */
        getDisplayScore(result) {
            if (!this.isPlaceAssessment(result)) {
                return this.calculateTotalScore(result);
            }
            const rounds = result?.milestoneRoundResults;
            if (!Array.isArray(rounds) || rounds.length === 0) {
                return 0;
            }
            const lastRound = [...rounds].sort(
                (a, b) => (a.roundOrder ?? 0) - (b.roundOrder ?? 0)
            ).at(-1);
            return lastRound?.totalScore || 0;
        },

        // Получение основной стороны участника
        getPrimaryPartnerSide(result) {
            if (!result.contestant?.participants?.length) return null;
            
            if (result.contestant.contestantType === 'SINGLE') {
                return result.contestant.participants[0]?.partnerSide || null;
            }
            
            for (const participant of result.contestant.participants) {
                if (participant.partnerSide) {
                    return participant.partnerSide;
                }
            }
            
            return null;
        },

        // Расчет суммарного балла для конкурсанта
        calculateTotalScore(result) {
            if (!result.milestoneRoundResults || !Array.isArray(result.milestoneRoundResults)) {
                return 0;
            }
            
            return result.milestoneRoundResults.reduce((total, roundResult) => {
                return total + (roundResult.totalScore || 0);
            }, 0);
        },

        handleRefresh() {
            this.fetchActivityResults();
        },

        getResultRowClass(result) {
            if (result.finallyApproved === true) return 'row-approved';
            if (result.finallyApproved === false) return 'row-not-approved';
            if (result.judgePassed === 'PASSED') return 'row-judge-passed';
            if (result.judgePassed === 'NOT_PASSED') return 'row-judge-not-passed';
            return 'row-unknown';
        },

        getAutoPlaceClass(place) {
            if (place === 1) return 'auto-place-first';
            if (place === 2) return 'auto-place-second';
            if (place === 3) return 'auto-place-third';
            return 'auto-place-other';
        },

        formatContestantType(type) {
            const typeMap = {
                'SINGLE': 'Одиночный',
                'COUPLE_TRANSIENT': 'Пара (временная)',
                'COUPLE_PERSISTENT': 'Пара (постоянная)'
            };
            return typeMap[type] || type;
        },

        formatPartnerSide(side) {
            const sideMap = {
                'LEADER': 'Партнер',
                'FOLLOWER': 'Партнерша'
            };
            return sideMap[side] || side;
        },

        formatPassStatus(status) {
            if (status === null || status === undefined) return 'Не определен';
            
            const statusMap = {
                'PASSED': 'Прошел',
                'NOT_PASSED': 'Не прошел'
            };
            return statusMap[status] || status;
        },

        getPassStatusClass(status) {
            if (status === 'PASSED') return 'status-passed';
            if (status === 'NOT_PASSED') return 'status-not-passed';
            return 'status-unknown';
        },

        formatFinalApproval(approved) {
            if (approved === null || approved === undefined) return 'Не определено';
            return approved ? 'Одобрен' : 'Не одобрен';
        },

        getFinalApprovalClass(approved) {
            if (approved === true) return 'status-approved';
            if (approved === false) return 'status-not-approved';
            return 'status-unknown';
        }
    },

    watch: {
        activityId: {
            handler() {
                this.fetchActivityResults();
            },
            immediate: false
        }
    }
};
</script>

<style scoped>

.activity-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
    margin-bottom: 30px;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
    gap: 20px;
}

.header-left {
    flex: 1;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;
    white-space: nowrap;
}

.default-action-btn {
    background: #17a2b8;
    color: white;
}

.default-action-btn:hover {
    background: #1abdd6;
    color: white;
}

.activity-result-detail-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}

.header-container {
    background: white;
    padding: 15px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    padding: 20px;
}

.title-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px 30px;
    margin-bottom: 20px;
}

.title-container h1 {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
}

.subtitle {
    font-size: 1.1rem;
    color: #666;
}

.subtitle span {
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 4px;
}

/* Стили статусов активности */
.status-draft { background: #f5f5f5; color: #666; }
.status-planned { background: #e3f2fd; color: #1976d2; }
.status-in-progress { background: #fff3e0; color: #f57c00; }
.status-summarizing { background: #f3e5f5; color: #7b1fa2; }
.status-completed { background: #e8f5e8; color: #2e7d32; }
.status-unknown { background: #f5f5f5; color: #666; }

/* Стили для блока результатов */
.results-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.milestone-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px;
}

.milestone-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}

.milestone-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.milestone-name {
    font-weight: normal;
    color: #666;
}

/* Стили для таблицы */
.table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.results-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;
}

.results-table th {
    background: #f8f9fa;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #dee2e6;
    white-space: nowrap;
}

.results-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    color: #666;
    vertical-align: top;
}

.results-table tr:last-child td {
    border-bottom: none;
}

.results-table tr:hover {
    background-color: #f8f9fa;
}

.text-center {
    text-align: center;
}

.no-data {
    color: #999;
    font-style: italic;
}

/* Стили для колонки ручного ввода места */
.place-input-cell {
    width: 80px;
}

.place-input {
    width: 60px;
    padding: 6px 8px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    font-size: 0.9rem;
    text-align: center;
    transition: all 0.3s ease;
}

.place-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.place-input:hover {
    border-color: #007bff;
}

.place-input::placeholder {
    color: #aaa;
    font-size: 0.8rem;
}

/* Стили для колонки автоматического места */
.auto-place-cell {
    width: 60px;
}

.auto-place-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
}

.auto-place-first {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
}

.auto-place-second {
    background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
    color: #fff;
    box-shadow: 0 2px 8px rgba(160, 160, 160, 0.3);
}

.auto-place-third {
    background: linear-gradient(135deg, #CD7F32, #A0522D);
    color: #fff;
    box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.auto-place-other {
    background: #f0f0f0;
    color: #666;
}

/* Стили для бейджа стороны участника */
.partner-side-badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    display: inline-block;
    min-width: 80px;
}

/* Цвета для сторон */
.partner-side-badge.leader {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #bbdefb;
}

.partner-side-badge.follow {
    background: #fce4ec;
    color: #c2185b;
    border: 1px solid #f8bbd9;
}

/* Стили для строк таблицы */
.row-approved { background-color: #f0fff0; }
.row-approved:hover { background-color: #e0ffe0; }

.row-not-approved { background-color: #fff0f0; }
.row-not-approved:hover { background-color: #ffe0e0; }

.row-judge-passed { background-color: #f0f8ff; }
.row-judge-passed:hover { background-color: #e0f0ff; }

.row-judge-not-passed { background-color: #fff8f0; }
.row-judge-not-passed:hover { background-color: #fff0e0; }

.row-unknown { background-color: #f8f8f8; }
.row-unknown:hover { background-color: #f0f0f0; }

/* Стили для участников */
.participants-cell {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.participant-info {
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #007bff;
    font-size: 0.9rem;
}

.partner-side {
    font-size: 0.8rem;
    color: #6c757d;
    font-style: italic;
    margin-left: 5px;
}

/* Стили для бейджей решений */
.decision-badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    display: inline-block;
    min-width: 100px;
}

.status-passed { background: #e8f5e8; color: #2e7d32; }
.status-not-passed { background: #ffebee; color: #c62828; }
.status-approved { background: #e8f5e8; color: #2e7d32; }
.status-not-approved { background: #ffebee; color: #c62828; }
.status-unknown { background: #f5f5f5; color: #666; }

/* Стили для результатов раундов */
.rounds-cell {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.total-score-summary {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.total-score-label {
    font-size: 0.9rem;
}

.total-score-value {
    font-size: 1.2rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 4px;
}

.round-result {
    padding: 8px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #28a745;
}

.round-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.round-name {
    font-weight: 500;
    font-size: 0.9rem;
}

.extra-round-badge {
    background: #f3e5f5;
    color: #7b1fa2;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 500;
}

.round-details {
    display: flex;
    gap: 10px;
    font-size: 0.8rem;
    color: #666;
}

.round-order,
.round-score {
    background: white;
    padding: 2px 6px;
    border-radius: 3px;
}

.round-status {
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
}

.contestant-type {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Состояния пустого списка и ошибки */
.empty-state,
.error-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-bottom: 30px;
}

.empty-icon,
.error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.empty-state h3,
.error-state h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.empty-state p,
.error-state p {
    color: #666;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 20px;
}

.retry-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.3s ease;
}

.retry-btn:hover {
    background: #0056b3;
}

/* Адаптивность */
@media (max-width: 768px) {
    .content-container {
        padding: 15px;
    }
    
    .title-container {
        padding: 20px;
    }
    
    .title-container h1 {
        font-size: 1.8rem;
    }
    
    .milestone-section {
        padding: 20px;
    }
    
    .place-input {
        width: 50px;
        font-size: 0.8rem;
    }
    
    .round-details {
        flex-direction: column;
        gap: 4px;
    }
}

@media (max-width: 480px) {
    .title-container h1 {
        font-size: 1.5rem;
    }
    
    .milestone-title {
        font-size: 1.3rem;
    }
    
    .decision-badge {
        min-width: auto;
        font-size: 0.8rem;
        padding: 3px 6px;
    }
    
    .auto-place-badge {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
    }
    
    .partner-side-badge {
        min-width: 60px;
        font-size: 0.75rem;
        padding: 3px 6px;
    }
}

/* Контейнер для разделения по сторонам */
.sides-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.side-section {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* Стили для секций сторон */
.leader-section {
    border-left: 5px solid #1976d2;
    background: linear-gradient(to right, #f8f9fa, #f0f8ff);
}

.follower-section {
    border-left: 5px solid #c2185b;
    background: linear-gradient(to right, #f8f9fa, #fce4ec);
}

.unknown-section {
    border-left: 5px solid #ff9800;
    background: linear-gradient(to right, #f8f9fa, #fff3e0);
}

.side-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(0,0,0,0.1);
}

.side-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.side-icon {
    font-size: 1.5rem;
}

.side-count {
    font-size: 0.9rem;
    font-weight: normal;
    color: #666;
    margin-left: 5px;
}

/* Стили для таблиц по сторонам */
.leader-table th {
    background: #e3f2fd;
    color: #1976d2;
}

.follower-table th {
    background: #fce4ec;
    color: #c2185b;
}

.unknown-table th {
    background: #fff3e0;
    color: #ff9800;
}

/* Стили для участников в зависимости от стороны */
.leader-participant {
    border-left-color: #1976d2 !important;
    background: linear-gradient(to right, #f8f9fa, #e3f2fd) !important;
}

.follower-participant {
    border-left-color: #c2185b !important;
    background: linear-gradient(to right, #f8f9fa, #fce4ec) !important;
}

.unknown-participant {
    border-left-color: #ff9800 !important;
    background: linear-gradient(to right, #f8f9fa, #fff3e0) !important;
}

/* Стили для суммарных баллов по сторонам */
.leader-score {
    background: linear-gradient(135deg, #1976d2, #0d47a1) !important;
}

.follower-score {
    background: linear-gradient(135deg, #c2185b, #880e4f) !important;
}

.unknown-score {
    background: linear-gradient(135deg, #ff9800, #f57c00) !important;
}

/* Адаптивность для новых секций */
@media (max-width: 768px) {
    .side-section {
        padding: 15px;
    }
    
    .side-title {
        font-size: 1.1rem;
    }
    
    .sides-container {
        gap: 20px;
    }
}

@media (max-width: 480px) {
    .side-title {
        font-size: 1rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .side-count {
        margin-left: 0;
    }
}
</style>