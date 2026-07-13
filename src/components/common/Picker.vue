<template>
  <div class="picker" ref="root" @keydown.esc.stop="closeDropdown">
    <label v-if="label" class="picker-label" :class="{ required }">{{ label }}</label>
    <div class="picker-input-wrap">
      <input
        ref="input"
        type="text"
        class="picker-input"
        :class="{ error: !!error, disabled: disabled }"
        :value="inputText"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        autocomplete="off"
        @input="onInput"
        @focus="onFocus"
        @keydown.down.prevent="highlightNext"
        @keydown.up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="picker-clear"
        aria-label="Очистить"
        @click="clear"
      >
        ×
      </button>
    </div>
    <div v-if="error" class="picker-error">{{ error }}</div>

    <div v-if="dropdownOpen" class="picker-dropdown">
      <div v-if="loading" class="picker-dropdown-status">Поиск...</div>
      <div v-else-if="!options.length" class="picker-dropdown-status">Ничего не найдено</div>
      <button
        v-for="(option, index) in options"
        :key="option.id"
        type="button"
        class="picker-option"
        :class="{ active: index === highlightedIndex }"
        @mousedown.prevent="selectOption(option)"
        @mouseenter="highlightedIndex = index"
      >
        {{ option.value }}
      </button>
    </div>
  </div>
</template>

<script>
/**
 * Универсальный picker по EntityLinkDto { id, value }.
 * Поиск: родитель передаёт async search(query) -> EntityLinkDto[].
 */
export default {
  name: 'Picker',

  props: {
    modelValue: {
      type: Object,
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Начните вводить...'
    },
    /** async (query: string) => Array<{ id, value }> */
    search: {
      type: Function,
      required: true
    },
    debounceMs: {
      type: Number,
      default: 350
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    /** Минимальная длина запроса перед поиском (0 = искать и пустую строку) */
    minChars: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      inputText: this.modelValue?.value || '',
      options: [],
      loading: false,
      dropdownOpen: false,
      highlightedIndex: -1,
      debounceTimer: null,
      searchSeq: 0
    }
  },

  watch: {
    modelValue: {
      deep: true,
      handler(value) {
        const nextText = value?.value || ''
        if (nextText !== this.inputText && document.activeElement !== this.$refs.input) {
          this.inputText = nextText
        }
      }
    }
  },

  mounted() {
    document.addEventListener('click', this.onDocumentClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick)
    this.clearDebounce()
  },

  methods: {
    onDocumentClick(event) {
      if (!this.$refs.root?.contains(event.target)) {
        this.closeDropdown()
      }
    },

    onFocus() {
      if (this.disabled || this.readonly) return
      this.runSearch(this.inputText)
    },

    onInput(event) {
      this.inputText = event.target.value
      if (this.modelValue) {
        this.$emit('update:modelValue', null)
      }
      this.scheduleSearch(this.inputText)
    },

    scheduleSearch(query) {
      this.clearDebounce()
      this.debounceTimer = setTimeout(() => {
        this.runSearch(query)
      }, this.debounceMs)
    },

    clearDebounce() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
        this.debounceTimer = null
      }
    },

    async runSearch(query) {
      if (this.disabled || this.readonly) return

      const normalized = (query || '').trim()
      if (normalized.length < this.minChars) {
        this.options = []
        this.dropdownOpen = true
        this.loading = false
        return
      }

      const seq = ++this.searchSeq
      this.loading = true
      this.dropdownOpen = true

      try {
        const result = await this.search(normalized)
        if (seq !== this.searchSeq) return
        this.options = Array.isArray(result) ? result : []
        this.highlightedIndex = this.options.length ? 0 : -1
      } catch (error) {
        if (seq !== this.searchSeq) return
        console.error('Picker search failed:', error)
        this.options = []
        this.highlightedIndex = -1
      } finally {
        if (seq === this.searchSeq) {
          this.loading = false
        }
      }
    },

    selectOption(option) {
      this.$emit('update:modelValue', option)
      this.inputText = option?.value || ''
      this.closeDropdown()
    },

    selectHighlighted() {
      if (this.highlightedIndex < 0 || this.highlightedIndex >= this.options.length) return
      this.selectOption(this.options[this.highlightedIndex])
    },

    highlightNext() {
      if (!this.options.length) return
      this.dropdownOpen = true
      this.highlightedIndex = (this.highlightedIndex + 1) % this.options.length
    },

    highlightPrev() {
      if (!this.options.length) return
      this.dropdownOpen = true
      this.highlightedIndex = this.highlightedIndex <= 0
        ? this.options.length - 1
        : this.highlightedIndex - 1
    },

    clear() {
      this.inputText = ''
      this.$emit('update:modelValue', null)
      this.options = []
      this.closeDropdown()
      this.$nextTick(() => this.$refs.input?.focus())
    },

    closeDropdown() {
      this.dropdownOpen = false
      this.highlightedIndex = -1
      // если выбранного значения нет — оставляем введённый текст как есть
      if (this.modelValue?.value) {
        this.inputText = this.modelValue.value
      }
    }
  }
}
</script>

<style scoped>
.picker {
  position: relative;
  width: 100%;
}

.picker-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.picker-label.required::after {
  content: ' *';
  color: #dc3545;
}

.picker-input-wrap {
  position: relative;
}

.picker-input {
  width: 100%;
  padding: 10px 32px 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.picker-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.picker-input.error {
  border-color: #dc3545;
}

.picker-input.disabled,
.picker-input:disabled {
  background: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.picker-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #666;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

.picker-clear:hover {
  background: #f0f0f0;
  color: #333;
}

.picker-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

.picker-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  max-height: 220px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  z-index: 20;
}

.picker-dropdown-status {
  padding: 10px 12px;
  color: #888;
  font-size: 0.9rem;
}

.picker-option {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
}

.picker-option.active,
.picker-option:hover {
  background: #e8f4f8;
}
</style>
