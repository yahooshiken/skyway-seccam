<template>
  <h2>Hello Vue.js with Vite.js</h2>
  <video
    @loadeddata="onLoadedData"
    ref="videoRef"
    autoplay
    :srcObject.prop="stream"
  ></video>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from "vue";
import Peer from "skyway-js";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup: () => {
    const videoRef = ref<HTMLMediaElement | null>(null);
    const stream = ref<MediaStream | null>(null);

    onMounted(async () => {
      const peer = new Peer({ key: "f6a377a0-a4e4-473e-9d8a-a490802fee85" });

      // カメラ映像取得
      stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    });

    const onLoadedData = () => {
      console.info("Loaded");
    };

    return { videoRef, stream, onLoadedData };
  },
});
</script>

<style scoped></style>
