// Firebase supplies the clock offset; do not let a PC clock skew break work
// intervals, rest countdowns or capsule previews. Rules still use request.time.
let clockOffset=0;
export function setServerOffset(value){if(Number.isFinite(value))clockOffset=Math.round(value);}
export function gameNow(){return Date.now()+clockOffset;}
