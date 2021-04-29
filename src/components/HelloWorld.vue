<template>
  <h2>Hello Vue.js with Vite.js</h2>
  <video @loadeddata="onLoadedData" autoplay :srcObject.prop="stream"></video>
  <video
    @loadeddata="onLoadedData"
    autoplay
    :srcObject.prop="anotherStream"
  ></video>
  <p>My Peer ID: {{ id }}</p>
  <input type="text" v-model="state.text" />
  <button @click="onCall">Call</button>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, reactive } from "vue";
import Peer, { MediaConnection } from "skyway-js";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup: () => {
    const peer = new Peer({
      key: "f6a377a0-a4e4-473e-9d8a-a490802fee85",
      debug: 3,
    });

    const id = ref();
    const stream = ref<MediaStream | undefined>();
    const anotherStream = ref<MediaStream | undefined>();

    const state = reactive({
      text: "",
    });

    onMounted(async () => {
      peer.on("open", () => {
        id.value = peer.id;
      });

      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.value = s;
    });

    const onLoadedData = () => {
      console.info("Loaded");
    };

    const setEventListener = (connection: MediaConnection) => {
      connection.on("stream", (s) => {
        anotherStream.value = s;
      });
    };

    peer.on("call", (connection: MediaConnection) => {
      connection.answer(stream.value);
      setEventListener(connection);
    });

    const onCall = () => {
      console.warn(state.text);
      const targetPeerId = state.text;
      const mediaConnection = peer.call(targetPeerId, stream.value);
      setEventListener(mediaConnection);
    };

    return { id, stream, anotherStream, onLoadedData, onCall, state };
  },
});
</script>

<style scoped></style>
