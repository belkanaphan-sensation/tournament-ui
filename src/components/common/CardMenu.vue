<template>
  <div v-if="visibleActions.length" class="card-menu" @click.stop>
    <button
      ref="menuBtn"
      type="button"
      class="menu-btn"
      @click="toggleMenu"
      aria-label="Меню"
    >
      <span class="menu-dot"></span>
      <span class="menu-dot"></span>
      <span class="menu-dot"></span>
    </button>
    <Teleport to="body">
      <div
        v-if="menuOpen"
        class="menu-dropdown"
        :style="dropdownStyle"
        @click.stop
      >
        <button
          v-for="(action, index) in visibleActions"
          :key="index"
          type="button"
          :class="['menu-item', action.class]"
          @click="handleActionClick(action)"
        >
          {{ action.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: 'CardMenu',
  props: {
    actions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      menuOpen: false,
      dropdownStyle: {}
    }
  },

  computed: {
    visibleActions() {
      return this.actions.filter(action => action.visible);
    }
  },

  methods: {
    updateDropdownPosition() {
      const btn = this.$refs.menuBtn;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      this.dropdownStyle = {
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`
      };
    },

    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      if (this.menuOpen) {
        this.updateDropdownPosition();
        this.$nextTick(() => {
          document.addEventListener('click', this.closeMenu);
          window.addEventListener('scroll', this.closeMenu, true);
          window.addEventListener('resize', this.closeMenu);
        });
      } else {
        this.removeListeners();
      }
    },

    closeMenu() {
      this.menuOpen = false;
      this.removeListeners();
    },

    removeListeners() {
      document.removeEventListener('click', this.closeMenu);
      window.removeEventListener('scroll', this.closeMenu, true);
      window.removeEventListener('resize', this.closeMenu);
    },

    handleActionClick(action) {
      this.closeMenu();
      if (typeof action.onClick === 'function') {
        action.onClick();
      }
    }
  },

  beforeUnmount() {
    this.removeListeners();
  }
}
</script>

<style scoped>
.card-menu {
  position: relative;
  flex-shrink: 0;
}

.menu-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
}

.menu-btn:hover {
  background: #f0f0f0;
}

.menu-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #666;
}

.menu-dropdown {
  position: fixed;
  min-width: 240px;
  padding: 4px 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  z-index: 9999;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 14px;
  border: none;
  border-top: 1px solid #eee;
  background: transparent;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.menu-item:first-child {
  border-top: none;
}

.menu-item:hover {
  background: #e8e8e8;
}
</style>
