<template>
  <div
    class="display-page"
    :class="schemeClass"
    :style="fontStyleVars"
  >
    <button
      type="button"
      class="hidden-logout-btn"
      aria-label="Logout"
      @click="handleLogout"
    ></button>

    <div class="display-header">
      <h1 class="activity-title">{{ activityName }}</h1>
      <h2 class="milestone-title">{{ milestoneName }}</h2>
    </div>

    <div v-if="!isLoading && visibleRounds.length === 0" class="empty-state">
      Нет раундов для отображения
    </div>

    <div
      v-else
      class="rounds-grid"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }"
    >
      <div
        v-for="displayRound in visibleRounds"
        :key="displayRound.round?.id"
        class="round-column"
      >
        <h3 class="round-title">{{ displayRound.round?.value }}</h3>

        <div class="sides-grid">
          <div class="side-column leaders">
            <div class="side-header">Партнеры</div>
            <div class="numbers-list">
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
              <div v-if="getLeaders(displayRound).length === 0" class="empty-side">—</div>
            </div>
          </div>

          <div class="side-column followers">
            <div class="side-header">Партнерши</div>
            <div class="numbers-list">
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
              <div v-if="getFollowers(displayRound).length === 0" class="empty-side">—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tournamentDisplayApi } from '@/services/tournamentDisplayApi.js'
import { authApi } from '@/services/authApi.js'

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
      slideTimer: null
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
    }
  },

  async mounted() {
    await this.loadDisplay()
    this.startSlideshowIfNeeded()
  },

  beforeUnmount() {
    this.stopSlideshow()
  },

  methods: {
    async loadDisplay() {
      this.isLoading = true
      try {
        const [rounds, config] = await Promise.all([
          tournamentDisplayApi.getDisplayRounds(),
          tournamentDisplayApi.getPrimaryDisplayConfig()
        ])
        this.displayRounds = Array.isArray(rounds) ? rounds : []
        this.config = { ...DEFAULT_CONFIG, ...(config || {}) }
        this.slideIndex = 0
      } finally {
        this.isLoading = false
      }
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
  padding: 2vh 2vw;
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

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--muted-color);
  font-size: var(--font-round);
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5vh;
  overflow: hidden;
}

.number-item {
  flex: 0 0 auto;
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
