<template>
  <div class="app-layout">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from './NavBar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  padding-top: 0;
}
</style>
