"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// A screen-covering triangle has no moving geometry boundaries. Each artwork
// gets its own aspect-preserving UV crop, including a bounded parallax margin.
const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragment = `
uniform sampler2D warmMap,coolMap;
uniform float aspect,progress,time;
uniform vec2 pointer;
varying vec2 vUv;
vec2 cover(vec2 uv,float imageAspect){
  vec2 crop=vec2(min(aspect/imageAspect,1.),min(imageAspect/aspect,1.));
  return .5+(uv-.5)*crop*.94+pointer*crop*.014;
}
void main(){
  vec2 uv=vUv+vec2(sin(vUv.y*8.+time*.12),cos(vUv.x*7.+time*.1))*.0006;
  vec3 warm=texture2D(warmMap,cover(uv,1.5)).rgb;
  vec3 cool=texture2D(coolMap,cover(uv,1672./941.)).rgb;
  gl_FragColor=vec4(mix(warm,cool,progress),1.);
  #include <colorspace_fragment>
}`;

export default function CloudScene() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = mount.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const initialize = () => {
      cleanup();
      if (motion.matches) return;
      let renderer: THREE.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({alpha:true, antialias:false, powerPreference:"low-power"}); }
      catch { return; }
      gsap.registerPlugin(ScrollTrigger);
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.5));
      renderer.domElement.style.opacity = "0";
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute([0,0,2,0,0,2],2));
      let alive = true, ready = 0, visible = false;
      const loaded = () => { if(alive && ++ready === 2) { renderer.domElement.style.opacity = "1"; render(); } };
      const loader = new THREE.TextureLoader();
      const warm = loader.load("/images/clouds-orange.jpg", loaded);
      const cool = loader.load("/images/clouds-blue.png", loaded);
      warm.colorSpace = cool.colorSpace = THREE.SRGBColorSpace;
      const pointer = new THREE.Vector2();
      const target = new THREE.Vector2();
      const material = new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{warmMap:{value:warm},coolMap:{value:cool},aspect:{value:1},progress:{value:0},time:{value:0},pointer:{value:pointer}}});
      scene.add(new THREE.Mesh(geometry,material));
      const resize = new ResizeObserver(([entry]) => {
        const {width,height}=entry.contentRect;
        if(!width || !height) return;
        material.uniforms.aspect.value=width/height;
        renderer.setSize(width,height,false);
      });
      resize.observe(host);
      const move = (e:PointerEvent) => {
        const box=host.getBoundingClientRect();
        target.set(THREE.MathUtils.clamp((e.clientX-box.left)/box.width-.5,-.5,.5),THREE.MathUtils.clamp(.5-(e.clientY-box.top)/box.height,-.5,.5));
      };
      host.parentElement!.addEventListener("pointermove",move);
      const trigger=ScrollTrigger.create({trigger:host.parentElement,start:"top top",end:"bottom top",onUpdate:self=>{material.uniforms.progress.value=self.progress*.3;}});
      const render = (time=0,delta=16.67) => {
        if(!alive || !visible || document.hidden || ready < 2) return;
        pointer.lerp(target,1-Math.exp(-delta/180));
        material.uniforms.time.value=time;
        renderer.render(scene,camera);
      };
      const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:"80px"}); observer.observe(host);
      const lost=(e:Event)=>{e.preventDefault();renderer.domElement.style.opacity="0";visible=false;};
      renderer.domElement.addEventListener("webglcontextlost",lost);
      const restored=()=>{visible=true;renderer.domElement.style.opacity="1";};
      renderer.domElement.addEventListener("webglcontextrestored",restored);
      gsap.ticker.add(render);
      cleanup=()=>{alive=false;gsap.ticker.remove(render);trigger.kill();resize.disconnect();observer.disconnect();host.parentElement?.removeEventListener("pointermove",move);renderer.domElement.removeEventListener("webglcontextlost",lost);renderer.domElement.removeEventListener("webglcontextrestored",restored);geometry.dispose();material.dispose();warm.dispose();cool.dispose();renderer.dispose();renderer.domElement.remove();};
    };
    initialize(); motion.addEventListener("change",initialize);
    return ()=>{cleanup();motion.removeEventListener("change",initialize);};
  },[]);
  return <div ref={mount} className="cloud-scene" aria-hidden="true" />;
}
