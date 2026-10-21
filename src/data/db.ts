import Dexie, { type Table } from 'dexie';

export interface Room {
  id: string;
  name: string;
  light?: string;
  orientation?: string;
}

export interface Plant {
  id: string;
  name: string;
  roomId?: string;
  stage: 'plant'; // évoluera en v1.5 pour les boutures
  parentId?: string;
  motifId: string; // Lien vers le dessin embarqué
  waterEveryDays: { summer: number; winter: number };
  notes?: string;
  createdAt: string; // Format YYYY-MM-DD
  archivedAt?: string;
}

export interface CareEvent {
  id: string;
  plantId: string;
  date: string; // Format YYYY-MM-DD
  type: 'water' | 'postpone' | 'note';
  until?: string; // Pour les reports
  note?: string;
}

export interface DayLog {
  date: string; // Format YYYY-MM-DD (Clé primaire)
  tempC?: number;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  note?: string;
}

export class BotanicaDatabase extends Dexie {
  rooms!: Table<Room, string>;
  plants!: Table<Plant, string>;
  careEvents!: Table<CareEvent, string>;
  dayLog!: Table<DayLog, string>;

  constructor() {
    super('BotanicaArcanaDB');
    this.version(1).stores({
      rooms: 'id, name',
      plants: 'id, roomId, motifId, archivedAt',
      careEvents: 'id, plantId, date, type',
      dayLog: 'date',
    });
  }
}

export const db = new BotanicaDatabase();