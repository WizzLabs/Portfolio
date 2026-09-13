"use client";
import {useEffect} from "react";
import Lenis from "lenis";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

export default function SmoothScroll(){
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const media=gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)",()=>{
      const lenis=new Lenis({autoRaf:false,lerp:.12,smoothWheel:true,syncTouch:false,anchors:true,prevent:node=>node instanceof HTMLElement&&Boolean(node.closest("[data-lenis-prevent-wheel]"))});
      lenis.on("scroll",ScrollTrigger.update);
      const tick=(time:number)=>lenis.raf(time*1000);
      gsap.ticker.add(tick,false,true);
      gsap.ticker.lagSmoothing(0);
      const refresh=()=>lenis.resize();
      ScrollTrigger.addEventListener("refresh",refresh);
      return ()=>{ScrollTrigger.removeEventListener("refresh",refresh);gsap.ticker.remove(tick);lenis.destroy();gsap.ticker.lagSmoothing(500,33);};
    });
    return ()=>media.revert();
  },[]);
  return null;
}
