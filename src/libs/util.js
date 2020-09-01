// @flow
import uuidValidate from 'uuid-validate'
import platform from 'platform'

type platformType = {
  product: string;
  name: string;
  version: string;
  isMobile: boolean;
}

type isMobileType = {
  product: String;
  name: string;
}

export const types:Array<string> = [
  'small', 'audio', 'large'
]

export function getFormattedTimestamp(timestamp:number):string {
  const date = new Date(timestamp)
  const hour    = ('00' + date.getHours()  ).slice(-2)
  const minutes = ('00' + date.getMinutes()).slice(-2)
  const seconds = ('00' + date.getSeconds()).slice(-2)
  
  return `${hour}:${minutes}:${seconds}`
}



export function validateRoomId( roomId:string ):boolean {
  return uuidValidate( roomId )
}

export function validateType( type:string ):boolean {
  return !!types.find( t => t === type )
}

export function isMobile(props:isMobileType):boolean {
  const {product, name} = props

  if(
    product === 'iPhone' ||
    product === 'iPad' ||
    name === 'Chrome Mobile'
  ) {
    return true
  } else {
    return false
  }
}

export function getPlatform():platformType {
  const {
    product, name, version
  } = platform
  const _isMobile:boolean = isMobile({product, name})

  return {product: !!product? product : 'null', name, version, isMobile: _isMobile }
}