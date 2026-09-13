"use client";
import {useEffect,useRef} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

export default function WorldAtmosphere(){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const media=gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)",()=>{
      const el=host.current!;
      const ctx=gsap.context(()=>{
        gsap.timeline({scrollTrigger:{id:"world-timeline",trigger:"main",start:"top top",end:"bottom bottom",scrub:.2,invalidateOnRefresh:true}})
          .to(el,{"--drift":1,"--light":.25,duration:.28,ease:"none"})
          .to(el,{"--drift":2.2,"--light":.7,duration:.34,ease:"none"})
          .to(el,{"--drift":3.2,"--light":.38,duration:.22,ease:"none"})
          .to(el,{"--drift":4,"--light":.85,duration:.16,ease:"none"});
      },el);
      return()=>ctx.revert();
    });
    return()=>media.revert();
  },[]);
  return <div className="world-atmosphere" ref={host} aria-hidden="true"><i/><i/><i/><span/><span/></div>;
}
