let t="off";const a=new Set;function r(e){if(e!==t){t=e;for(const n of a)n()}}function i(e){return a.add(e),()=>a.delete(e)}function s(){return t}export{r as a,s as g,i as s};
