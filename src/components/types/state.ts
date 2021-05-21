import { MeshRoom } from 'skyway-js';

export const ROLES = { HOST: 'HOST', GUEST: 'GUEST' } as const;
export type Role = keyof typeof ROLES;

export interface State {
  peerId: string;
  joined: boolean;
  roomName: string;
  room: MeshRoom | undefined;
  role: Role;
  stream: MediaStream | undefined;
  peers: { [key: string]: string };
}
