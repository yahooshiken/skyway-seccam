<template>
  <header class="app-header">skyway-seccam</header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'app-header',
});
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  padding: 24px;
  font-weight: bold;
  font-size: 1.2rem;
}
</style>