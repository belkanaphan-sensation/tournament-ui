<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style>
  #app {
    font-family: Arial, sans-serif;
    /* text-align: center; */
    /* padding: 20px; */
  }
</style>

<!--
<template>
  <!--<div id="app" class="mainClass">
    <div>
      <InfoPanel label="Категория" value="Любители" />
      <InfoPanel label="Этап" value="1/4" />

      <h3>Оцените следующих участников</h3>
      
      <PerformanceRatingGroups
        :initial-performances="performances"
        :available-categories="categories"
        @rating-change="handleRatingChange"
        @performance-added="handlePerformanceAdded"
      />
    </div>
  </div>
  
</template>
-->
<!-- <script>

import InfoPanel from './components/InfoPanel.vue'
import PerformanceRatingGroups from './components/PerformanceRatingGroups.vue'

export default {
  name: 'App',
  components: {
    InfoPanel,
    PerformanceRatingGroups
  },
  data() {
    return {
      performances: [
        {
          id: 'perf-1',
          number: 39,
          date: '15.12.2023',
          isCollapsed: false,
          categories: [
            { id: 'cat-1', label: 'Музыкальность', value: 8 },
            { id: 'cat-2', label: 'Техника', value: 9 },
            { id: 'cat-3', label: 'Артистизм', value: 7 },
            { id: 'cat-4', label: 'Внешний вид', value: 8 }
          ]
        }
      ],
      categories: [
        'Музыкальность', 'Техника', 'Артистизм', 'Внешний вид',
        'Сложность программы', 'Художественный образ'
      ]
    }
  },
  methods: {
    handleRatingChange(rating) {
      console.log('Оценка изменена:', rating);
    },
    handlePerformanceAdded(performance) {
      console.log('Добавлено выступление:', performance);
    }
  }
}
</script> -->

<!-- <style scoped>
.mainClass {
  padding-left: 4px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  padding-right: 4px !important;
}

</style> -->
