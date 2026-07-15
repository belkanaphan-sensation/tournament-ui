<template>
  <div
    class="display-page"
    :class="[schemeClass, { 'is-empty': isEmptyDisplay }]"
    :style="fontStyleVars"
  >
    <button
      type="button"
      class="hidden-logout-btn"
      aria-label="Logout"
      @click="handleLogout"
    ></button>

    <div class="display-body">
      <Transition name="display-fade" mode="out-in">
        <div v-if="isEmptyDisplay" key="empty" class="empty-fullscreen">
          <img
            class="empty-fullscreen-image"
            :src="emblemSrc"
            alt=""
          />
        </div>

        <div v-else :key="contentTransitionKey" class="display-content">
          <img
            class="festival-emblem festival-emblem-left"
            :src="emblemSrc"
            alt="Эмблема фестиваля"
          />
          <img
            class="festival-emblem festival-emblem-right"
            :src="emblemSrc"
            alt="Эмблема фестиваля"
          />

          <div class="display-header">
            <h1 class="activity-title">{{ activityName }}</h1>
            <h2 class="milestone-title">{{ milestoneName }}</h2>
          </div>

          <div
            class="rounds-grid"
            :style="{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }"
          >
            <div
              v-for="displayRound in visibleRounds"
              :key="displayRound.round?.id"
              class="round-column"
            >
              <h3 class="round-title">{{ displayRound.round?.value }}</h3>

              <div
                class="sides-grid"
                :class="{
                  'single-side': getLeaders(displayRound).length === 0 || getFollowers(displayRound).length === 0
                }"
              >
                <div
                  v-if="getLeaders(displayRound).length"
                  class="side-column leaders"
                >
                  <div class="side-header">Партнеры</div>
                  <div
                    class="numbers-list"
                    :ref="(el) => bindNumbersList(el, displayRound.round?.id, 'leaders')"
                    :style="getNumbersListStyle(displayRound.round?.id)"
                  >
                    <div
                      v-for="contestant in getLeaders(displayRound)"
                      :key="contestant.id"
                      class="number-item"
                      :class="{ 'number-only': !showParticipantName }"
                    >
                      <span class="contestant-number">{{ contestant.number }}</span>
                      <span v-if="formatName(contestant, 'LEADER')" class="contestant-name">
                        {{ formatName(contestant, 'LEADER') }}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  v-if="getFollowers(displayRound).length"
                  class="side-column followers"
                >
                  <div class="side-header">Партнерши</div>
                  <div
                    class="numbers-list"
                    :ref="(el) => bindNumbersList(el, displayRound.round?.id, 'followers')"
                    :style="getNumbersListStyle(displayRound.round?.id)"
                  >
                    <div
                      v-for="contestant in getFollowers(displayRound)"
                      :key="contestant.id"
                      class="number-item"
                      :class="{ 'number-only': !showParticipantName }"
                    >
                      <span class="contestant-number">{{ contestant.number }}</span>
                      <span v-if="formatName(contestant, 'FOLLOWER')" class="contestant-name">
                        {{ formatName(contestant, 'FOLLOWER') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import { tournamentDisplayApi } from '@/services/tournamentDisplayApi.js'
import { authApi } from '@/services/authApi.js'
import emblemLight from '@/assets/emblems/emblem-light.png'
import emblemDark from '@/assets/emblems/emblem-dark.png'

const FONT_SIZES = {
  activity: {
    S: 'clamp(1.4rem, 2.5vw, 2.4rem)',
    M: 'clamp(1.8rem, 3.2vw, 3.2rem)',
    L: 'clamp(2.4rem, 4.5vw, 4.8rem)',
    XL: 'clamp(3rem, 5.5vw, 6rem)'
  },
  milestone: {
    S: 'clamp(1rem, 1.8vw, 1.6rem)',
    M: 'clamp(1.4rem, 2.5vw, 2.6rem)',
    L: 'clamp(1.8rem, 3.2vw, 3.4rem)',
    XL: 'clamp(2.2rem, 4vw, 4.2rem)'
  },
  round: {
    S: 'clamp(1rem, 1.6vw, 1.5rem)',
    M: 'clamp(1.3rem, 2vw, 2.2rem)',
    L: 'clamp(1.6rem, 2.6vw, 2.8rem)',
    XL: 'clamp(2rem, 3.2vw, 3.6rem)'
  },
  side: {
    S: 'clamp(0.75rem, 1vw, 1rem)',
    M: 'clamp(0.85rem, 1.1vw, 1.2rem)',
    L: 'clamp(1rem, 1.4vw, 1.5rem)',
    XL: 'clamp(1.2rem, 1.8vw, 1.8rem)'
  },
  participant: {
    S: 'clamp(1.2rem, 2vw, 2rem)',
    M: 'clamp(1.6rem, 2.6vw, 2.8rem)',
    L: 'clamp(2.2rem, 3.5vw, 4rem)',
    XL: 'clamp(2.8rem, 4.5vw, 5.2rem)'
  },
  name: {
    S: 'clamp(0.8rem, 1.2vw, 1.2rem)',
    M: 'clamp(1rem, 1.5vw, 1.6rem)',
    L: 'clamp(1.2rem, 1.9vw, 2rem)',
    XL: 'clamp(1.5rem, 2.4vw, 2.6rem)'
  }
}

const DEFAULT_CONFIG = {
  roundsDisplayMode: 'ALL',
  slideIntervalSec: 8,
  roundsPerSlide: 1,
  colorScheme: 'DARK',
  activityFontSize: 'L',
  milestoneFontSize: 'M',
  roundFontSize: 'M',
  sideFontSize: 'S',
  participantFontSize: 'L',
  nameFontSize: 'M',
  showSurname: false,
  showName: false
}

export default {
  name: 'Display',

  data() {
    return {
      displayRounds: [],
      config: { ...DEFAULT_CONFIG },
      isLoading: true,
      slideIndex: 0,
      slideTimer: null,
      _displayFetchId: 0,
      contentViewKey: 0,
      /** roundId -> число колонок для списков сторон */
      roundColumns: {},
    }
  },

  computed: {
    activityName() {
      return this.visibleRounds[0]?.activity?.value
        || this.displayRounds[0]?.activity?.value
        || ''
    },

    milestoneName() {
      return this.visibleRounds[0]?.milestone?.value
        || this.displayRounds[0]?.milestone?.value
        || ''
    },

    schemeClass() {
      return this.config.colorScheme === 'LIGHT' ? 'scheme-light' : 'scheme-dark'
    },

    emblemSrc() {
      return this.config.colorScheme === 'LIGHT' ? emblemLight : emblemDark
    },

    fontStyleVars() {
      return {
        '--font-activity': this.resolveFont('activity', this.config.activityFontSize),
        '--font-milestone': this.resolveFont('milestone', this.config.milestoneFontSize),
        '--font-round': this.resolveFont('round', this.config.roundFontSize),
        '--font-side': this.resolveFont('side', this.config.sideFontSize),
        '--font-participant': this.resolveFont('participant', this.config.participantFontSize),
        '--font-name': this.resolveFont('name', this.config.nameFontSize)
      }
    },

    isSlideshow() {
      return this.config.roundsDisplayMode === 'SLIDESHOW'
    },

    showParticipantName() {
      return !!(this.config.showName || this.config.showSurname)
    },

    roundsPerSlide() {
      const value = Number(this.config.roundsPerSlide)
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
    },

    slideCount() {
      if (!this.isSlideshow) return 1
      return Math.max(1, Math.ceil(this.displayRounds.length / this.roundsPerSlide))
    },

    visibleRounds() {
      if (!this.isSlideshow) {
        return this.displayRounds
      }
      const start = this.slideIndex * this.roundsPerSlide
      return this.displayRounds.slice(start, start + this.roundsPerSlide)
    },

    columnCount() {
      return Math.max(1, this.visibleRounds.length)
    },

    isEmptyDisplay() {
      // Пока нет раундов (в т.ч. во время первой загрузки) — заставка,
      // чтобы появление данных анимировалось плавно
      return this.displayRounds.length === 0
    },

    /** Ключ для fade: смена данных (SSE) и смена слайда в SLIDESHOW */
    contentTransitionKey() {
      return this.isSlideshow
        ? `${this.contentViewKey}-${this.slideIndex}`
        : String(this.contentViewKey)
    }
  },

  async mounted() {
    await this.loadDisplay()
    this.startSlideshowIfNeeded()
    this.bindDisplayUpdatedListener()
  },

  beforeUnmount() {
    this.unbindAllNumbersLists()
    this.unbindDisplayUpdatedListener()
    this.stopSlideshow()
  },

  methods: {
    /**
     * Колонки = ceil(макс. число людей на стороне / сколько рядов реально влезает в высоту списка).
     * Высоту берём из DOM (ResizeObserver), а не из эвристики по окну —
     * иначе при крупных шрифтах/других отступах один экран влезает, другой вылезает.
     */
    bindNumbersList(el, roundId, side) {
      if (!this._numbersObservers) {
        this._numbersObservers = new Map()
      }
      const key = `${roundId}:${side}`

      if (!el || roundId == null) {
        const prev = this._numbersObservers.get(key)
        if (prev) {
          prev.observer.disconnect()
          this._numbersObservers.delete(key)
        }
        return
      }

      const prev = this._numbersObservers.get(key)
      if (prev?.el === el) {
        this.updateRoundColumns(roundId)
        return
      }
      if (prev) {
        prev.observer.disconnect()
      }

      const observer = new ResizeObserver(() => {
        this.updateRoundColumns(roundId)
      })
      observer.observe(el)
      this._numbersObservers.set(key, { el, observer, roundId, side })
      this.$nextTick(() => this.updateRoundColumns(roundId))
    },

    unbindAllNumbersLists() {
      if (!this._numbersObservers) return
      for (const entry of this._numbersObservers.values()) {
        entry.observer.disconnect()
      }
      this._numbersObservers.clear()
    },

    estimateRowHeightPx() {
      const size = this.config?.participantFontSize || 'L'
      const numberRow = { S: 34, M: 42, L: 54, XL: 66 }[size] || 54
      const nameExtra = this.showParticipantName
        ? ({ S: 6, M: 8, L: 10, XL: 12 }[size] || 10)
        : 0
      const paddingAndGap = 10
      return numberRow + nameExtra + paddingAndGap
    },

    getDisplayRoundById(roundId) {
      return this.visibleRounds.find((r) => r.round?.id === roundId)
        || this.displayRounds.find((r) => r.round?.id === roundId)
    },

    getSideMaxCount(displayRound) {
      if (!displayRound) return 0
      return Math.max(
        this.getLeaders(displayRound).length,
        this.getFollowers(displayRound).length
      )
    },

    updateRoundColumns(roundId) {
      if (roundId == null || !this._numbersObservers) return

      const displayRound = this.getDisplayRoundById(roundId)
      const count = this.getSideMaxCount(displayRound)
      if (!count) {
        if (this.roundColumns[roundId] !== 1) {
          this.roundColumns = { ...this.roundColumns, [roundId]: 1 }
        }
        return
      }

      let availableHeight = 0
      let measuredRowHeight = 0
      for (const entry of this._numbersObservers.values()) {
        if (entry.roundId !== roundId || !entry.el) continue
        availableHeight = availableHeight
          ? Math.min(availableHeight, entry.el.clientHeight)
          : entry.el.clientHeight

        const item = entry.el.querySelector('.number-item')
        if (item?.offsetHeight) {
          measuredRowHeight = Math.max(measuredRowHeight, item.offsetHeight)
        }
      }
      if (availableHeight <= 0) return

      // Реальная высота строки (+ gap), иначе fallback по размеру шрифта из конфига
      const rowHeight = measuredRowHeight > 0
        ? measuredRowHeight + 6
        : this.estimateRowHeightPx()
      const maxRows = Math.max(1, Math.floor(availableHeight / rowHeight))
      const columns = Math.min(6, Math.max(1, Math.ceil(count / maxRows)))

      if (this.roundColumns[roundId] !== columns) {
        this.roundColumns = { ...this.roundColumns, [roundId]: columns }
      }
    },

    getNumbersListStyle(roundId) {
      const columns = this.roundColumns[roundId] || 1
      return {
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }
    },

    bindDisplayUpdatedListener() {
      if (!window.$sse) return
      this._onDisplayNotification = ({ message }) => {
        if (message === 'DISPLAY_UPDATED') {
          this.refreshDisplay()
        }
      }
      window.$sse.on('notification', this._onDisplayNotification)
    },

    unbindDisplayUpdatedListener() {
      if (!window.$sse || !this._onDisplayNotification) return
      window.$sse.off('notification', this._onDisplayNotification)
      this._onDisplayNotification = null
    },

    async loadDisplay() {
      this.isLoading = true
      try {
        await this.fetchDisplayData()
      } finally {
        this.isLoading = false
      }
    },

    async refreshDisplay() {
      try {
        await this.fetchDisplayData()
        this.startSlideshowIfNeeded()
      } catch (error) {
        console.error('Failed to refresh display after SSE event:', error)
      }
    },

    async fetchDisplayData() {
      const requestId = ++this._displayFetchId
      const [rounds, config] = await Promise.all([
        tournamentDisplayApi.getDisplayRounds(),
        tournamentDisplayApi.getPrimaryDisplayConfig()
      ])
      // Игнорируем устаревший ответ, если уже ушёл более новый запрос
      if (requestId !== this._displayFetchId) {
        return
      }
      // Пустой массив тоже применяем — иначе на экране останутся старые раунды
      const hadRounds = this.displayRounds.length > 0
      this.displayRounds = Array.isArray(rounds) ? rounds : []
      this.config = { ...DEFAULT_CONFIG, ...(config && typeof config === 'object' ? config : {}) }
      this.slideIndex = 0
      this.roundColumns = {}
      // Плавная смена при обновлении по SSE/refresh, если контент уже был на экране
      if (hadRounds && this.displayRounds.length > 0) {
        this.contentViewKey += 1
      }
      this.$nextTick(() => {
        for (const r of this.visibleRounds) {
          if (r.round?.id != null) this.updateRoundColumns(r.round.id)
        }
      })
    },

    resolveFont(role, size) {
      return FONT_SIZES[role]?.[size] || FONT_SIZES[role].M
    },

    startSlideshowIfNeeded() {
      this.stopSlideshow()
      if (!this.isSlideshow || this.slideCount <= 1) return

      const intervalMs = Math.max(1, Number(this.config.slideIntervalSec) || 8) * 1000
      this.slideTimer = setInterval(() => {
        this.slideIndex = (this.slideIndex + 1) % this.slideCount
      }, intervalMs)
    },

    stopSlideshow() {
      if (this.slideTimer) {
        clearInterval(this.slideTimer)
        this.slideTimer = null
      }
    },

    getLeaders(displayRound) {
      return (displayRound.contestants || []).filter(contestant =>
        contestant.participants?.some(p => p.partnerSide === 'LEADER')
      )
    },

    getFollowers(displayRound) {
      return (displayRound.contestants || []).filter(contestant =>
        contestant.participants?.some(p => p.partnerSide === 'FOLLOWER')
      )
    },

    formatName(contestant, partnerSide) {
      const participant = contestant.participants?.find(p => p.partnerSide === partnerSide)
        || contestant.participants?.[0]

      const parts = []
      if (this.config.showSurname && participant?.surname) {
        parts.push(participant.surname)
      }
      if (this.config.showName && participant?.name) {
        parts.push(participant.name)
      }
      return parts.join(' ')
    },

    handleLogout() {
      this.stopSlideshow()
      if (window.$sse) {
        window.$sse.disconnect()
      }
      localStorage.removeItem('userInfo')
      authApi.logout()
      this.$router.push({ name: 'LoginPage' })
    }
  }
}
</script>

<style scoped>
.display-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  padding: 0;
  box-sizing: border-box;
}

.hidden-logout-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 48px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: default;
  z-index: 10;
}

.festival-emblem {
  position: absolute;
  top: 1.5vh;
  height: clamp(72px, 12vh, 140px);
  width: auto;
  object-fit: contain;
  pointer-events: none;
  z-index: 5;
}

.festival-emblem-left {
  left: 1.5vw;
}

.festival-emblem-right {
  right: 1.5vw;
}

.scheme-dark {
  background: #0a0a0a;
  color: #f5f5f5;
  --panel-bg: #141414;
  --panel-border: #2a2a2a;
  --title-color: #ffffff;
  --subtitle-color: #b0b0b0;
  --muted-color: #9a9a9a;
  --item-bg: #1c1c1c;
  --item-color: #ffffff;
  --empty-color: #555;
  --divider: #333;
}

.scheme-light {
  background: #f5f5f5;
  color: #222;
  --panel-bg: #ffffff;
  --panel-border: #e0e0e0;
  --title-color: #111;
  --subtitle-color: #555;
  --muted-color: #666;
  --item-bg: #f0f0f0;
  --item-color: #111;
  --empty-color: #999;
  --divider: #ddd;
}

.display-header {
  flex-shrink: 0;
  text-align: center;
  margin-bottom: 2vh;
}

.activity-title {
  margin: 0 0 0.6vh;
  color: var(--title-color);
  font-size: var(--font-activity);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.01em;
}

.milestone-title {
  margin: 0;
  color: var(--subtitle-color);
  font-size: var(--font-milestone);
  font-weight: 500;
  line-height: 1.2;
}

.display-body {
  flex: 1;
  min-height: 0;
  position: relative;
  width: 100%;
}

.display-content {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 2vh 2vw;
  box-sizing: border-box;
}

.display-fade-enter-active,
.display-fade-leave-active {
  transition: opacity 0.7s ease;
}

.display-fade-enter-from,
.display-fade-leave-to {
  opacity: 0;
}

.empty-fullscreen {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
}

.empty-fullscreen-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
}

.rounds-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  gap: 0.7vw;
  width: 100%;
  overflow: hidden;
}

.round-column {
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 1.2vh 1vw;
  box-sizing: border-box;
  overflow: hidden;
}

.round-title {
  flex-shrink: 0;
  margin: 0 0 1.2vh;
  padding-bottom: 0.8vh;
  border-bottom: 1px solid var(--divider);
  text-align: center;
  color: var(--title-color);
  font-size: var(--font-round);
  font-weight: 700;
}

.sides-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8vw;
  overflow: hidden;
}

.sides-grid.single-side {
  grid-template-columns: 1fr;
}

.side-column {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.side-header {
  flex-shrink: 0;
  text-align: center;
  font-size: var(--font-side);
  font-weight: 600;
  color: var(--muted-color);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.8vh;
  padding-bottom: 0.5vh;
  border-bottom: 1px solid var(--panel-border);
}

.numbers-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-auto-rows: min-content;
  align-content: start;
  gap: 0.5vh 0.5vw;
  overflow: hidden;
}

.number-item {
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  gap: 0.4em;
  max-width: 100%;
  background: var(--item-bg);
  border-radius: 12px;
  padding: 0.55vh 0.6vw;
  text-align: left;
  color: var(--item-color);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.03em;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
}

.number-item.number-only {
  justify-content: center;
  text-align: center;
}

.contestant-number {
  font-size: var(--font-participant);
  flex-shrink: 0;
}

.contestant-name {
  font-size: var(--font-name);
  font-weight: 600;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-side {
  text-align: center;
  color: var(--empty-color);
  font-size: var(--font-participant);
  padding: 1vh 0;
}

@media (max-width: 1100px) {
  .rounds-grid {
    grid-template-columns: 1fr;
  }
}
</style>
