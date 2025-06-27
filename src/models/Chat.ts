export type CHAT_STATUS = 'REGISTRATION' | 'WAIT_COMMAND'

export interface Chat {
  id: number;
  status: CHAT_STATUS
}
