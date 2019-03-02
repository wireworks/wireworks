import { Byte } from "./byte";

export type Bit8 = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export const BIT8_ZERO: Bit8 = [false, false, false, false, false, false, false, false];
export const BIT8_FULL: Bit8 = [true, true, true, true, true, true, true, true];

export const BYTE_ZERO: Byte = new Byte(BIT8_ZERO)
export const BYTE_FULL: Byte = new Byte(BIT8_FULL)

export type Byte4 = [Byte, Byte, Byte, Byte]

export const BYTE4_ZERO: Byte4 = [BYTE_ZERO.clone(), BYTE_ZERO.clone(), BYTE_ZERO.clone(), BYTE_ZERO.clone()]
export const BYTE4_FULL: Byte4 = [BYTE_FULL.clone(), BYTE_FULL.clone(), BYTE_FULL.clone(), BYTE_FULL.clone()]