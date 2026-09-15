// Render at device density, with a bounded framebuffer for large desktop displays.
export function displayMetrics(width,height,devicePixelRatio=1){
 const cssWidth=Math.max(1,width),cssHeight=Math.max(1,height);
 const ratio=Math.max(1,Math.min(devicePixelRatio||1,2,Math.sqrt(8_000_000/(cssWidth*cssHeight))));
 return {width:Math.round(cssWidth*ratio),height:Math.round(cssHeight*ratio),zoom:1/ratio};
}
