<template>
  <div>
    <div v-if="state.joined">
      <p>
        {{ state.roomName }}
      </p>
      <video autoplay :srcObject.prop="state.stream"></video>
    </div>
    <div v-else>
      <input type="text" name="room" id="room" v-model="state.roomName" />
      <button @click="joinRoom">Join room</button>
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
      roomName: 'hello',
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
video {
  background-color: #ddd !important;
  width: 640px;
  height: 480px;
}
</style>>
