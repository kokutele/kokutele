// @flow

import uuidValidate from 'uuid-validate'

export const types:Array<string> = [
  'small', 'audio', 'large'
]

export function validateRoomId( roomId:string ):boolean {
  return uuidValidate( roomId )
}
export function validateType( type:string ):boolean {
  return !!types.find( t => t === type )
}