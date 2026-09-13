"use client";
import {useEffect,useRef,type RefObject} from "react";
import {gsap} from "gsap";
import * as THREE from "three";

const fragment=`
uniform sampler2D artwork;
uniform float progress,time,aspect;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float softNoise(vec2 p){return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.01);}
void main(){
  vec2 uv=vUv;
  float enter=smoothstep(0.,.27,progress);
  float exit=smoothstep(.3,1.,progress);
  vec3 result=vec3(0.);float alpha=0.;
  for(int i=0;i<3;i++){
    float layer=float(i);float speed=1.+layer*.55;
    vec2 p=(uv-.5)*vec2(aspect,1.);
    p/=1.+exit*speed*.9;
    p+=vec2((layer-1.)*exit*.48,time*.006*(layer+1.));
    float variation=softNoise(p*(3.2+layer)+layer*8.7);
    float aperture=1.-smoothstep(.04+exit*.9,.3+exit*1.1,length((uv-.5)*vec2(1.,.72)));
    float density=(.18+smoothstep(.23,.78,variation)*.95)*enter*(1.-exit)*(.95-aperture*exit);
    vec2 crop=vec2(min(aspect/(1672./941.),1.),min((1672./941.)/aspect,1.));
    vec2 sampleUv=.5+p*crop*.5+vec2(layer*.06, -.13+variation*.07);
    vec3 cloud=texture2D(artwork,clamp(sampleUv,.01,.99)).rgb;
    // The artwork supplies light and tint, while low-frequency density prevents
    // recognizable duplicated photographs from appearing in the foreground fog.
    cloud=mix(cloud,vec3(.72,.79,.84),.9);
    float a=clamp(density*.82,0.,.9);
    result+=cloud*a*(1.-alpha);alpha+=a*(1.-alpha);
  }
  gl_FragColor=vec4(result/max(alpha,.001),alpha);
  #include <colorspace_fragment>
}`;

export default function Atmosphere({journey}:{journey:RefObject<{progress:number}>}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const mount=host.current!;
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    let dispose=()=>{};
    const setup=()=>{
      dispose();if(media.matches)return;
      let renderer:THREE.WebGLRenderer;
      try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:"low-power"});}catch{return;}
      renderer.setPixelRatio(Math.min(devicePixelRatio,1));mount.appendChild(renderer.domElement);
      const scene=new THREE.Scene(),camera=new THREE.Camera();
      const geometry=new THREE.PlaneGeometry(2,2);
      let ready=false,visible=false,alive=true;
      const texture=new THREE.TextureLoader().load("/images/clouds-blue.png",()=>{ready=true;});texture.colorSpace=THREE.SRGBColorSpace;
      const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",fragmentShader:fragment,uniforms:{artwork:{value:texture},progress:{value:0},time:{value:0},aspect:{value:1}}});
      scene.add(new THREE.Mesh(geometry,material));
      const resize=new ResizeObserver(([entry])=>{const{width,height}=entry.contentRect;if(width&&height){renderer.setSize(width,height,false);material.uniforms.aspect.value=width/height;}});resize.observe(mount);
      const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(mount);
      const tick=(time:number)=>{if(!alive||!visible||!ready||document.hidden)return;material.uniforms.progress.value=journey.current.progress;material.uniforms.time.value=time;renderer.render(scene,camera);};gsap.ticker.add(tick);
      const lost=(e:Event)=>{e.preventDefault();mount.style.opacity="0";};const restore=()=>{mount.style.opacity="1";};
      renderer.domElement.addEventListener("webglcontextlost",lost);renderer.domElement.addEventListener("webglcontextrestored",restore);
      dispose=()=>{alive=false;gsap.ticker.remove(tick);resize.disconnect();observer.disconnect();geometry.dispose();material.dispose();texture.dispose();renderer.dispose();renderer.domElement.remove();};
    };
    setup();media.addEventListener("change",setup);return()=>{dispose();media.removeEventListener("change",setup);};
  },[journey]);
  return <div className="atmosphere-canvas" ref={host} aria-hidden="true"/>;
}
