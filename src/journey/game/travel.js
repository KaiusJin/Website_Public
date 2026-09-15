import {REGION_WIDTH} from '../data/regions.js';
export const OUTDOOR_ROUTE=[0,1,2,4,5,6];
export const LIBRARY_DOOR_X=2*REGION_WIDTH+1960;
export function neighboringRegion(index,direction){const i=OUTDOOR_ROUTE.indexOf(index);return i<0?null:OUTDOOR_ROUTE[i+Math.sign(direction)]??null;}
export function arrivalPosition(index,direction){return index*REGION_WIDTH+(direction>0?160:REGION_WIDTH-160);}
export function canEnterLibrary(x,y,mode,ground){return mode==='walking'&&Math.abs(x-LIBRARY_DOOR_X)<240&&y>=ground-45;}
