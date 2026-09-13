import type React from "react";
const skillGroups=[
 {name:"AI",skills:["AI Development","Prompt Engineering","AI Agent Development","LLM Integration","AI Automation","Automation Engineering"]},
 {name:"Software",skills:["Software Development","C/C++","Python","JavaScript","System Design","Debugging","Technical Problem Solving"]},
 {name:"Creative Technology",skills:["Three.js","WebGL","GSAP","Creative Technology","UI / UX","Product Design"]},
 {name:"Hardware",skills:["IoT","Hardware / Software Integration","Rapid Prototyping","Game Development"]},
];

// The existing constellation content is mounted once, inside the cloud journey.
export default function Toolkit(){return <section className="skills toolkit-content" aria-labelledby="toolkit-title"><div className="skill-stars" aria-hidden="true"><i/><i/><i/><i/></div><p className="eyebrow">03 / TOOLKIT</p><h2 id="toolkit-title">A practice in <em>constant motion.</em></h2><div className="skill-constellation">{skillGroups.map((group,index)=><section className={`skill-cluster cluster-${index+1}`} key={group.name} aria-labelledby={`skill-${index}`}><h3 id={`skill-${index}`}>{group.name}</h3><div>{group.skills.map((skill,i)=><span className={skill==="AI Development"||skill==="Prompt Engineering"?"skill-major":""} key={skill} style={{"--star-index":i} as React.CSSProperties}>{skill}</span>)}</div></section>)}</div></section>;}
