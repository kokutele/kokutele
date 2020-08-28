import uuidValidate from 'uuid-validate'

export const types = [
  'small', 'audio', 'large'
]

export function validateRoomId( roomId ) {
  return uuidValidate( roomId )
}
export function validateType( type ) {
  return !!types.find( t => t === type )
}