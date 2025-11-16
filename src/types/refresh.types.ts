export interface HistoryEntry {
  fechaCreacion: string;
  fechaExpiracion: string;
}

export interface HistoryResponse {
  status: string;
  message: string;
  data: HistoryEntry[];
}