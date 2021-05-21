<template>
  <div class="seccam-wrapper">
    <div v-if="state.joined">
      <p class="room-name">
        {{ state.roomName }}
      </p>
      <div class="video-wrapper">
        <div v-if="!state.stream" class="video-overlay">
          <p class="main-message">Not avalilable now.</p>
          <p class="sub-message">There is no streamer,</p>
        </div>
        <video class="video" autoplay :srcObject.prop="state.stream"></video>
      </div>
    </div>
    <div v-else>
      <div>
        <input
          autofocus
          type="text"
          name="room"
          id="room"
          v-model="state.roomName"
          class="input"
          placeholder="Room name"
        />
        <button :disabled="state.roomName === ''" class="join-button" @click="joinRoom">
          JOIN
        </button>
      </div>
      <p class="description">
        <a v-if="state.role === 'GUEST'" href="#" @click="toggleRole">You want to broadcast?</a>
        <a v-else href="#" @click="toggleRole">You are ready to broadcast</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, reactive } from 'vue';
import Peer, { MeshRoom } from 'skyway-js';
import { peerHandler, roomHandler } from './handlers';
import { ROLES, State } from './types/state';

const LOG_LEVEL = { none: 0, error: 1, warn: 2, full: 3 } as const;

export default defineComponent({
  name: 'sec-cam',
  setup: () => {
    const peer = new Peer({ key: import.meta.env.VITE_SKYWAY_KEY, debug: LOG_LEVEL.none });
    const state = reactive<State>({
      peerId: '',
      joined: false,
      roomName: 'Room name',
      role: ROLES.GUEST,
      room: undefined,
      stream: undefined,
      peers: {},
    });

    const toggleRole = () => {
      const { role } = state;
      if (role === ROLES.HOST) {
        state.role = ROLES.GUEST;
      } else if (role === ROLES.GUEST) {
        state.role = ROLES.HOST;
      }
    };

    onMounted(() => {
      peerHandler.open(peer, state);
    });

    onUpdated(async () => {
      const { role, joined, room, stream } = state;

      if (!stream && joined && role === ROLES.HOST) {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        room?.replaceStream(localStream);
        state.stream = localStream;
      }
    });

    const joinRoom = async () => {
      if (!peer.open) return;

      state.joined = true;

      const room = peer.joinRoom<MeshRoom>(state.roomName, { mode: 'mesh' });
      state.room = room;

      roomHandler.open(room, state);
      roomHandler.peerJoin(room);
      roomHandler.peerLeave(room);
      roomHandler.stream(room, state);
      roomHandler.data(room, state);
      roomHandler.close(room);
    };

    return { state, toggleRole, joinRoom };
  },
});
</script>

<style  scoped>
.room-name {
  margin-bottom: 12px;
  text-align: left;
  font-size: 2rem;
  font-weight: bold;
}
.video-wrapper {
  position: relative;
  width: 640px;
  height: 480px;
}
.video {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1 !important;
  background: rgb(142, 158, 171);
  background: linear-gradient(105deg, rgba(142, 158, 171, 0.7), rgba(238, 242, 243, 1)) !important;
  background-size: 400% 400%;
}
.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 100%;
  z-index: 2;
}
.main-message {
  margin: 6px auto;
  font-size: 2rem;
  font-weight: bold;
}
.sub-message {
  margin: 6px auto;
  color: #666;
  font-size: 1.4rem;
}
.seccam-wrapper {
  max-width: 80%;
  height: 90vh;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-wrapper {
  display: flex;
  justify-content: space-between;
}
.input {
  width: 75%;
  margin-right: 2rem;
  font-weight: 800;
  font-size: 8rem;
  outline: none;
  border: none;
  border-bottom: solid #282828 0.6rem;
}
.join-button {
  min-width: 120px;
  margin: 0 auto;
  padding: 28px 40px;
  border: none;
  border-radius: 40px;
  font-weight: 800;
  font-size: 2rem;
  box-sizing: border-box;
  box-shadow: 0 9px 18px rgba(0, 0, 0, 0.2);
  text-align: center;
  background: #bd3381;
  color: white;
  transform: translatez(0);
  transition: all 0.25s ease-out 0s;
}
.join-button:disabled {
  background: #888;
  box-shadow: none;
}
.description {
}
</style>>
