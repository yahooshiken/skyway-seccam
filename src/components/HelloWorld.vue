<template>
  <h2>skyway-seccam</h2>

  <div class="input-wrapper">
    <input
      type="text"
      v-model="state.roomName"
    />
    <button @click="joinRoom">Join room</button>
  </div>

  <div ref="remoteVideos"></div>

  <input
    type="radio"
    id="host"
    value="host"
    v-model="state.role"
  />
  <label for="host">Host</label>
  <input
    type="radio"
    id="guest"
    value="guest"
    v-model="state.role"
  />
  <label for="guest">Guest</label>

  <h3>My current role: {{ state.role }} (My Peer ID: {{ id }})</h3>
  <p>
    The <b>host</b> role can broadcast videos. The <b>guest</b> role can view
    only.
  </p>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, reactive, onUpdated } from "vue";
import Peer, { RoomStream } from "skyway-js";

export default defineComponent({
  name: "HelloWorld",
  setup: () => {
    const peer = new Peer({
      key: process.env.SKYWAY_KEY,
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

      const s: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.value = s;
    });

    onUpdated(async () => {
      if (stream.value && stream.value?.getVideoTracks().length) {
        stream.value.getVideoTracks().forEach((track) => {
          track.enabled = state.role === "host";
        });
      }
    });

    const joinRoom = () => {
      if (!peer.open) return;

      const room = peer.joinRoom(state.roomName, {
        mode: "mesh",
        stream: stream.value,
      });

      const handleOpen = (id: string) => {
        room.send({ [id]: state.role });
      };
      const handlePeerJoin = (peerId: string) => {};
      const handleStream = async (s: RoomStream) => {
        if (s.id === stream.value?.id) return;

        const newVideo = document.createElement("video");
        newVideo.srcObject = s;
        newVideo.setAttribute("data-peer-id", s.peerId);
        remoteVideos.value.append(newVideo);
        await newVideo.play().catch(console.error);
      };
      const handlePeerLeave = (peerId: string) => {
        const remoteVideo = remoteVideos.value.querySelector(
          `[data-peer-id="${peerId}"]`
        ) as HTMLMediaElement;

        if (remoteVideo && remoteVideo.srcObject) {
          const tracks = (<MediaStream>remoteVideo.srcObject).getTracks();
          tracks.forEach((track) => track.stop());
          remoteVideo.srcObject = null;
          remoteVideo.remove();
        }
      };
      const handleClose = () => {
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
      };

      room.once("open", handleOpen);
      room.on("peerJoin", handlePeerJoin);
      room.on("stream", handleStream);
      room.on("peerLeave", handlePeerLeave);
      room.once("close", handleClose);
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
