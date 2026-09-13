"use client";
import {useEffect,useRef} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Atmosphere from "./Atmosphere";
import Toolkit from "./Toolkit";
import {FilmstripBackdrop} from "./ThreeUIScenes";

// One existing pinned environment: upcoming filmstrip, cloud passage, then Toolkit.
// Only foreground layers move. The screen-filling sky stays attached to the viewport.
export default function ProjectJourney(){
  const root=useRef<HTMLElement>(null);
  const journey=useRef({progress:0});
  const projectTravel=useRef(0);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const media=gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)",()=>{
      const ctx=gsap.context(()=>{
        const tl=gsap.timeline({scrollTrigger:{id:"project-entry",trigger:root.current,start:"top top",end:()=>"+="+innerHeight*(innerWidth<700?4.2:6),pin:root.current!.querySelector(".journey-viewport"),scrub:.18,invalidateOnRefresh:true,anticipatePin:1,onUpdate:self=>{
          const p=self.progress;
          journey.current.progress=Math.min(1,p/.2);
          projectTravel.current=Math.max(0,Math.min(1,(p-.2)/.62));
          root.current?.style.setProperty("--journey",String(projectTravel.current));
        }}});
        tl.to(".journey-viewport",{"--canopy":0,duration:.18,ease:"none"},0)
          .fromTo(".journey-cloud.back",{scale:1,opacity:.4},{scale:1.32,opacity:0,duration:.17,ease:"none"},.04)
          .fromTo(".journey-cloud.front",{scale:1.1,yPercent:12,opacity:.65},{scale:1.75,yPercent:36,opacity:0,duration:.18,ease:"none"},.03)
          .fromTo(".journey-cloud.side",{scale:1.1,xPercent:-8,opacity:.35},{scale:1.5,xPercent:-22,opacity:0,duration:.17,ease:"none"},.05)
          .fromTo(".upcoming-intro",{opacity:0,y:46,filter:"blur(10px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.14,ease:"none"},.12)
          .fromTo(".threeui-filmstrip",{opacity:0,scale:1.1,yPercent:8,filter:"blur(12px)"},{opacity:.94,scale:1,yPercent:0,filter:"blur(0px)",duration:.16,ease:"none"},.11)
          .to([".upcoming-intro",".threeui-filmstrip"],{yPercent:0,opacity:1,duration:.25,ease:"none"},.27)
          .to(".upcoming-intro",{opacity:0,yPercent:-28,filter:"blur(7px)",duration:.14,ease:"none"},.52)
          .to(".threeui-filmstrip",{opacity:0,scale:.82,yPercent:-24,filter:"blur(13px)",duration:.18,ease:"none"},.52)
          .fromTo(".toolkit-content",{opacity:0,y:62},{opacity:1,y:0,duration:.17,ease:"power1.out"},.64)
          .fromTo(".skill-stars",{yPercent:10,opacity:.18},{yPercent:-8,opacity:.8,duration:.34,ease:"none"},.61)
          .fromTo(".skill-cluster",{y:24,opacity:.3},{y:0,opacity:1,duration:.17,stagger:.028,ease:"none"},.67)
          .fromTo(".project-horizon",{xPercent:0},{xPercent:-18,duration:.62,ease:"none"},.2)
          .fromTo(".project-exit-mist",{opacity:0,yPercent:30,scale:1},{opacity:.9,yPercent:0,scale:1.25,duration:.12,ease:"power1.in"},.89)
          .to(".toolkit-content",{opacity:0,y:-40,duration:.1,ease:"power1.in"},.91)
          .to(".journey-viewport",{"--exit-light":1,duration:.11,ease:"none"},.89);
      },root);
      return()=>{ctx.revert();journey.current.progress=0;};
    });
    return()=>media.revert();
  },[]);
  return <section className="project-journey" id="skills" ref={root} aria-label="Upcoming work and Toolkit">
    <div className="journey-viewport">
      <div id="work" className="upcoming-intro"><p className="eyebrow">UPCOMING EXPLORATIONS</p><h2>Explorations<br/><em>in progress.</em></h2><p className="upcoming-copy">From AI and automation prototypes to creative coding, game experiments, and interactive UI — this is where interesting questions get their first answer.</p></div>
      <FilmstripBackdrop progress={projectTravel}/>
      <Toolkit/>
      <div className="project-horizon" aria-hidden="true"/>
      <div className="journey-cloud back" aria-hidden="true"/><div className="journey-cloud side" aria-hidden="true"/><div className="journey-cloud front" aria-hidden="true"/>
      <Atmosphere journey={journey}/>
      <div className="project-exit-mist" aria-hidden="true"/>
    </div>
  </section>;
}
