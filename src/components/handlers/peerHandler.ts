import Peer from 'skyway-js';
import { State } from '../types/state';

const peerHandler = {
  open: (peer: Peer, state: State) => {
    peer.on('open', () => {
      console.warn(peer.id);
      state.peerId = peer.id;
    });
  },
};

export default peerHandler;
