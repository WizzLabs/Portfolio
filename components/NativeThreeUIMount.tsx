"use client";
import {useEffect,useRef} from "react";

type Props={source:string;className?:string;title:string;interactive?:boolean;preventWheel?:boolean;onReady?:(root:ShadowRoot)=>void};
export default function NativeThreeUIMount({source,className="",title,interactive=true,preventWheel=false,onReady}:Props){const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{const element=host.current;if(!element)return;let cancelled=false;const abort=new AbortController();const cleanups:(()=>void)[]=[];
  fetch(source,{signal:abort.signal}).then(r=>r.text()).then(html=>{if(cancelled)return;const parsed=new DOMParser().parseFromString(html,"text/html"),shadow=element.shadowRoot??element.attachShadow({mode:"open"}),root=document.createElement("div");shadow.replaceChildren();root.className="threeui-root";const styles=[...parsed.querySelectorAll("style")].map(node=>node.textContent||"").join("\n").replaceAll(":root",":host, .threeui-root").replace(/(^|[},])\s*html\s*,\s*body/g,"$1 :host, .threeui-root").replace(/(^|[},])\s*body(?=[\s:{.#\[])/g,"$1 .threeui-root").replaceAll("position:fixed","position:absolute");const style=document.createElement("style");style.textContent=`:host{position:absolute;inset:0;display:block;overflow:hidden}.threeui-root{position:absolute;inset:0;overflow:hidden}${styles}`;shadow.append(style,root);[...parsed.body.childNodes].filter(n=>n.nodeName!=="SCRIPT").forEach(n=>root.append(document.importNode(n,true)));
   const scoped=new Proxy(document,{get(target,key){if(key==="body"||key==="documentElement")return root;if(key==="querySelector")return shadow.querySelector.bind(shadow);if(key==="querySelectorAll")return shadow.querySelectorAll.bind(shadow);if(key==="getElementById")return(id:string)=>shadow.getElementById(id);const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value;}});
   [...parsed.scripts].forEach(script=>{if(!script.textContent)return;try{new Function("document",script.textContent)(scoped)}catch(error){console.error(`ThreeUI ${title} initialization failed`,error)}});element.dataset.ready="true";onReady?.(shadow);
  }).catch(error=>{if(error.name!=="AbortError")console.error(`ThreeUI ${title} source failed`,error)});
  return()=>{cancelled=true;abort.abort();cleanups.forEach(fn=>fn());element.shadowRoot?.replaceChildren();element.replaceChildren()};
 },[source,title,onReady]);
 return <div ref={host} className={`native-threeui ${className}`} role="group" aria-label={title} data-lenis-prevent-wheel={preventWheel?"":undefined} style={{pointerEvents:interactive?"auto":"none"}}/>}
