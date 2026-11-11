export function createAudio(){
 const available='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 let enabled=available;
 function stop(){if(available)window.speechSynthesis.cancel();}
 return {available,get enabled(){return enabled;},stop,toggle(){enabled=!enabled&&available;stop();return enabled;},speak(text){stop();if(enabled){const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.95;window.speechSynthesis.speak(utterance);}}};
}
