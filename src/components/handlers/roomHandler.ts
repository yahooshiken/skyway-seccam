import { MeshRoom } from 'skyway-js';
import isEqual from 'lodash.isequal';
import { State } from '../types/state';

type Room = MeshRoom;

const roomHandler = {
  open: (room: Room, state: State) => {
    room.once('open', () => {
      console.warn('Room open');
      const { peerId, role } = state;
      state.peers = { [peerId]: role };
      room.send(state.peers);
    });
  },
  peerJoin: (room: Room) => {
    room.on('peerJoin', (peerId: string) => {
      console.warn(`Peer join: ${peerId}`);
    });
  },
  peerLeave: (room: Room) => {
    room.on('peerLeave', (peerId: string) => {
      console.warn(`Peer leave: ${peerId}`);
    });
  },
  stream: (room: Room, state: State) => {
    room.on('stream', (stream: MediaStream) => {
      console.warn('Stream');
      console.info(stream);
      state.stream = stream;
    });
  },
  data: (room: Room, state: State) => {
    room.on('data', ({ src, data }) => {
      console.warn(`Data from ${src} is ${data}.`);

      const requireUpdate = !isEqual({ ...state.peers }, data);

      if (requireUpdate) {
        state.peers = { ...state.peers, ...data };
        room.send(state.peers);
      }
    });
  },
  close: (room: Room) => {
    room.once('close', () => {
      console.warn('Room close');
    });
  },
};

export default roomHandler;
