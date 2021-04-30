<template>
  <h2>skyway-seccam</h2>

  <div class="input-wrapper">
    <input type="text" v-model="state.roomName" />
    <button @click="joinRoom">Join room</button>
  </div>

  <div ref="remoteVideos"></div>

  <input type="radio" id="host" value="host" v-model="state.role" />
  <label for="host">Host</label>
  <input type="radio" id="guest" value="guest" v-model="state.role" />
  <label for="guest">Guest</label>

  <h3>My current role: {{ state.role }} (My Peer ID: {{ id }})</h3>
  <p>
    The <b>host</b> role can broadcast videos. The <b>guest</b> role can view
    only.
  </p>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, reactive, onUpdated } from "vue";
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
    const peer = new Peer({
      key: "f6a377a0-a4e4-473e-9d8a-a490802fee85",
      debug: 3,
    });

    const id = ref();
    const stream = ref<MediaStream | undefined>();
    const remoteVideos = ref();

    const state = reactive({
      roomName: "",
      role: "guest",
      remoteVideos: [],
    });

    onMounted(async () => {
      peer.on("open", () => {
        id.value = peer.id;
      });

      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.value = s;
    });

    onUpdated(async () => {
      if (stream.value) {
        stream.value.getVideoTracks()[0].enabled = state.role === "host";
      }
    });

    const joinRoom = () => {
      console.warn("Join");
      if (!peer.open) return;

      const room = peer.joinRoom(state.roomName, {
        mode: "mesh",
        stream: stream.value,
      });

      room.once("open", () => {
        console.warn("Joined");
      });

      room.on("peerJoin", (peerId: string) => {
        console.warn(`${peerId} Joined`);
      });

      room.on("stream", async (s) => {
        if (s.id === stream.value?.id) return;

        const newVideo = document.createElement("video");
        newVideo.srcObject = s;
        newVideo.setAttribute("data-peer-id", s.peerId);
        remoteVideos.value.append(newVideo);
        await newVideo.play().catch(console.error);
      });

      room.on("peerLeave", (peerId: string) => {
        const remoteVideo = remoteVideos.value.querySelector(
          `[data-peer-id="${peerId}"]`
        ) as HTMLMediaElement;

        if (remoteVideo && remoteVideo.srcObject) {
          const tracks = (<MediaStream>remoteVideo.srcObject).getTracks();
          tracks.forEach((track) => track.stop());
          remoteVideo.srcObject = null;
          remoteVideo.remove();
        }

        console.warn(`${peerId} Left`);
      });

      room.once("close", () => {
        const videoElements = Array.from(
          remoteVideos.value.children
        ) as HTMLMediaElement[];
        videoElements.forEach((video) => {
          if (video && video.srcObject) {
            const tracks = (<MediaStream>video.srcObject).getTracks();
            tracks.forEach((track) => track.stop());
            video.srcObject = null;
            video.remove();
          }
        });
      });
    };
    ``;
    return { id, stream, remoteVideos, joinRoom, state };
  },
});
</script>

<style scoped>
.input-wrapper {
  margin: 20px;
}
</style>
