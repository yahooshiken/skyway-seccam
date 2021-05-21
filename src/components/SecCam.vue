<template>
  <div class="seccam-wrapper">
    <div v-if="state.joined">
      <div class="video-header">
        <p class="room-name">
          {{ state.roomName }}
        </p>
        <div v-if="guests.length" class="guest-avatar-group">
          <span
            class="guest-avatar"
            v-for="(guest, index) in guests"
            :key="guest"
            :style="avatarStyle(index)"
            >{{ guest }}</span
          >
          <p class="guest-num">{{ guests.length }} People</p>
        </div>
      </div>
      <div class="video-wrapper">
        <div v-if="!state.stream" class="video-overlay">
          <p class="main-message">Not avalilable now.</p>
          <p class="sub-message">There is no streamer,</p>
        </div>
        <video class="video" autoplay :srcObject.prop="state.stream"></video>
      </div>
      <div class="bye-button-wrapper">
        <button class="button" @click="closeRoom">Bye 👋</button>
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
        <button :disabled="state.roomName === ''" class="button" @click="joinRoom">JOIN 🚀</button>
      </div>
      <p class="description">
        <a v-if="state.role === 'GUEST'" href="#" @click="toggleRole"
          >You want to broadcast? Click here 📹
        </a>
        <a v-else href="#" @click="toggleRole">Now, you're ready to broadcast! 🎉</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUpdated, reactive } from 'vue';
import Peer, { MeshRoom } from 'skyway-js';
import { peerHandler, roomHandler } from './handlers';

import { ROLES, State } from './types/state';
import { LOG_LEVEL } from '../constants/loglevel';
import { COLORS } from '../constants/colors';

export default defineComponent({
  name: 'sec-cam',
  setup: () => {
    const peer = new Peer({ key: import.meta.env.VITE_SKYWAY_KEY, debug: LOG_LEVEL.none });
    const state = reactive<State>({
      peerId: '',
      joined: false,
      roomName: 'Your room',
      role: ROLES.GUEST,
      room: undefined,
      stream: undefined,
      peers: {},
    });

    const guests = computed(() => {
      return Object.entries(state.peers)
        .filter(([_, role]) => role === ROLES.GUEST)
        .map(([peerId]) => peerId.substring(0, 2));
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
      roomHandler.close(room, state);
    };

    const closeRoom = () => {
      if (!peer.open) return;

      state.room?.close();
    };

    const avatarStyle = (index: number) => {
      return { backgroundColor: COLORS[index % COLORS.length] };
    };

    return { state, guests, avatarStyle, toggleRole, joinRoom, closeRoom };
  },
});
</script>

<style  scoped>
.video-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.room-name {
  margin-bottom: 12px;
  text-align: left;
  line-height: 1.2;
  font-size: 2.8rem;
  font-weight: bold;
}
.guest-avatar {
  display: inline-flex;
  width: 32px;
  height: 32px;
  line-height: 1;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  text-align: center;
  user-select: none;
  background: red;
  color: white;
  border: solid 2px white;
  border-radius: 50%;
}
.guest-avatar:not(:first-child) {
  margin-left: -16px;
  mask: radial-gradient(circle 20px at 5px 50%, transparent 99%, #fff 100%);
}
.guest-num {
  font-size: 0.9rem;
  margin: 0 0 12px;
}
.video-wrapper {
  position: relative;
  width: 640px;
  height: 480px;
  margin-bottom: 20px;
}
@media screen and (max-width: 780px) {
  .video-wrapper {
    width: calc(100vw);
  }
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
  padding: 0 24px;
}
.input-wrapper {
  display: flex;
  justify-content: space-between;
}

.input {
  width: 75%;
  margin-right: 1.4rem;
  font-weight: 800;
  font-size: 8rem;
  outline: none;
  border: none;
  border-bottom: solid #282828 0.6rem;
}
@media screen and (max-width: 1080px) {
  .input {
    width: 100%;
    font-size: 6rem;
    margin-right: 0;
    margin-bottom: 20px;
  }
}
@media screen and (max-width: 600px) {
  .input {
    font-size: 3.2rem;
  }
}

.button {
  min-width: 150px;
  margin: 0 auto;
  padding: 20px 40px;
  border: none;
  border-radius: 40px;
  font-weight: 800;
  font-size: 1.8rem;
  box-sizing: border-box;
  box-shadow: 0 9px 18px rgba(0, 0, 0, 0.2);
  text-align: center;
  background: #bd3381;
  color: white;
  transform: translatez(0);
  transition: all 0.25s ease-out 0s;
}
.button:disabled {
  background: #888;
  box-shadow: none;
}
.bye-button-wrapper {
  text-align: right;
}
</style>>
