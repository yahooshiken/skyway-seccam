import { MeshRoom } from 'skyway-js';
import isEqual from 'lodash.isequal';
import { State } from '../types/state';

type Room = MeshRoom;

const roomHandler = {
  open: (room: Room, state: State) => {
    room.once('open', () => {
      const { peerId, role } = state;
      state.peers = { [peerId]: role };
      room.send(state.peers);
    });
  },
  peerJoin: (room: Room) => {
    room.on('peerJoin', (peerId: string) => {});
  },
  peerLeave: (room: Room) => {
    room.on('peerLeave', (peerId: string) => {});
  },
  stream: (room: Room, state: State) => {
    room.on('stream', (stream: MediaStream) => {
      state.stream = stream;
    });
  },
  data: (room: Room, state: State) => {
    room.on('data', ({ src, data }) => {
      const requireUpdate = !isEqual({ ...state.peers }, data);

      if (requireUpdate) {
        state.peers = { ...state.peers, ...data };
        room.send(state.peers);
      }
    });
  },
  close: (room: Room, state: State) => {
    room.once('close', () => {
      const { peerId } = state;
      const copiedPeers = { ...state.peers };
      delete copiedPeers[peerId];
      room.send({ ...copiedPeers });

      state.stream = undefined;
      state.room = undefined;
      state.joined = false;
      state.roomName = 'See you!';
      state.peers = {};
    });
  },
};

export default roomHandler;
