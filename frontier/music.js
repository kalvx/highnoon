const music=document.getElementById('frontier-music');
const musicToggle=document.getElementById('music-toggle');
const musicLabel=document.getElementById('music-label');
const maximumPlays=3;
let completedPlays=0,finishedMusic=false,startingMusic=false,userMuted=false;
try{userMuted=sessionStorage.getItem('frontier-sound')==='off';}catch{}
music.volume=.16;
music.loop=false;
function renderMusic(){
 const playing=!music.paused&&!music.ended;
 musicLabel.textContent=playing?'Sound on':'Sound off';
 musicToggle.setAttribute('aria-pressed',String(playing));
 musicToggle.setAttribute('aria-label',playing?'Turn background sound off':'Turn background sound on');
}
function removeStartListeners(){document.removeEventListener('pointerdown',startOnInteraction);document.removeEventListener('keydown',startOnInteraction);}
async function startMusic(){
 if(userMuted||finishedMusic||startingMusic||!music.paused)return;
 startingMusic=true;
 try{await music.play();removeStartListeners();}catch{}finally{startingMusic=false;renderMusic();}
}
function startOnInteraction(event){if(event.target?.closest?.('#music-toggle'))return;startMusic();}
musicToggle.addEventListener('click',()=>{
 if(!music.paused){userMuted=true;music.pause();try{sessionStorage.setItem('frontier-sound','off');}catch{}}
 else{userMuted=false;if(finishedMusic){completedPlays=0;finishedMusic=false;music.currentTime=0;}try{sessionStorage.setItem('frontier-sound','on');}catch{}startMusic();}
 renderMusic();
});
music.addEventListener('ended',()=>{
 completedPlays++;
 if(completedPlays>=maximumPlays){finishedMusic=true;music.pause();removeStartListeners();renderMusic();return;}
 music.currentTime=0;startMusic();
});
music.addEventListener('play',renderMusic);music.addEventListener('pause',renderMusic);music.addEventListener('error',renderMusic);
document.addEventListener('pointerdown',startOnInteraction,{passive:true});document.addEventListener('keydown',startOnInteraction);
renderMusic();startMusic();
