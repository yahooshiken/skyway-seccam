<template>
  <sec-cam />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SecCam from './components/SecCam.vue';

export default defineComponent({
  name: 'App',
  components: { SecCam },
});
</script>

<style>
html,
body {
  background-color: #ffffff;
  color: #282828;
}
a {
  text-decoration: none;
}

#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
