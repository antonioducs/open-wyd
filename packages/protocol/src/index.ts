export interface PlayerData {
    name: string;
    level: number;
    exp: number;
}

export interface GameEvent {
    type: 'SAVE_PLAYER';
    payload: PlayerData;
    timestamp: number;
}
