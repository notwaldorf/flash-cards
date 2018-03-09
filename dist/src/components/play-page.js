import{html,LitElement,renderAttributes,connect,repeat,store,saveShowAnswer,saveShowSettings,saveSaySettings,showNewCard,getRight,getWrong,saveAvailableTypes}from'./my-app.js';const settingsIcon=html`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>`,audioIcon=html`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;var myIcons={settingsIcon:settingsIcon,audioIcon:audioIcon};class ACard extends LitElement{render(a){return renderAttributes(this,{correct:a.isAnswered&&a.correct,incorrect:a.isAnswered&&!a.correct}),html`
    <style>
      :host {
        display: block;
        min-height: 300px;
        text-align: center;
        border-radius: 3px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
       }
       .question {
         font-size: 4.5em;
         font-weight: bold;
         xfont-family: "Noto Sans Japanese";
       }
       .hint {
         font-size: 1em;
         color: #499FFA;
       }
       input {
         font-size: 3rem;
         background: none;
         color: black;
         box-shadow: none;
         border: 0;
         padding: 0;
         border-bottom: 2px solid #E4E4E4;
         width: 100%;
         text-align: center;
       }
       button {
         box-shadow: none;
         border: none;
         cursor: pointer;
       }
       button.green {
         background: #4CAF50;
         color: white;
         font-size: 1em;
         text-transform: uppercase;
         font-weight: bold;
         letter-spacing: 1px;
         padding: 8px 18px;
         margin: 36px 0;
         border-radius: 4px;
       }
       button.say {
         background: transparent;
         vertical-align: middle;
       }
       :host([correct]) {
        outline: 20px solid #64D989;
        outline-offset: -20px;
       }
       :host([incorrect]) {
        outline: 20px solid #E9404B;
        outline-offset: -20px;
       }
     </style>

     <div class="question">${a.question}</div>
     <input autofocus
        placeholder="${a.showAnswer?a.answer:'answer'}"
        on-keypress="${(a)=>this._inputKeypress(a)}"
        value="${a._inputValue}">
     <div class="hint">
       ${a.hint}
       <button class="say"
          hidden?="${!a._hasSpeechSynthesis}"
          on-click="${()=>this._say()}">
          ${audioIcon}
      </button>
     </div>
     <button class="green" on-click="${()=>this.submit()}">${a.isAnswered?'next':'submit'}</button>
    `}static get properties(){return{question:String,hint:String,answer:String,isAnswered:String,correct:Boolean,showAnswer:Boolean,saySettings:String,_hasSpeechSynthesis:Boolean,_inputValue:String}}constructor(){super(),this.isAnswered=!1}ready(){super.ready(),this._button=this.shadowRoot.querySelector('button.green'),this._input=this.shadowRoot.querySelector('input'),!1 in window?this._hasSpeechSynthesis=!1:(speechSynthesis.onvoiceschanged=()=>{this._voice=this._getVoice(speechSynthesis.getVoices())},this._voice=this._getVoice(speechSynthesis.getVoices()))}didRender(a,b){'question'in b&&'start'===this.saySettings&&this._say()}_getVoice(){this._hasSpeechSynthesis=!0;let a=speechSynthesis.getVoices().filter((a)=>'Google \u65E5\u672C\u8A9E'===a.name)[0];return a?a:(a=speechSynthesis.getVoices().filter((a)=>'Kyoko'===a.name)[0],a?a:void(this._hasSpeechSynthesis=!1))}submit(){this.isAnswered?(this._inputValue='',this._input.focus(),this.dispatchEvent(new CustomEvent('next-question',{bubbles:!0,composed:!0}))):(this.correct=this._input.value===this.answer,this._inputValue=this.answer,this._button.focus(),'end'===this.saySettings&&this._say(),this.dispatchEvent(new CustomEvent('answered',{bubbles:!1,composed:!0,detail:{correct:this.correct}}))),this.isAnswered=!this.isAnswered}_say(){if(this._voice){var a=new SpeechSynthesisUtterance;a.text=this.question,a.lang='jp',a.voice=this._voice,window.speechSynthesis.speak(a)}}_inputKeypress(a){13==a.keyCode&&this.submit()}}window.customElements.define('a-card',ACard);class CheckBox extends LitElement{render({label:a,checked:b}){return html`
      <style>
        :host {
          display: inline-block;
          position: relative;
          padding-left: 30px;
          margin-bottom: 12px;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Hide the browser's default checkbox */
        .container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        /* Create a custom checkbox */
        .checkmark {
          cursor: pointer;
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: transparent;
          border: 2px solid black;
        }

        /* Create the checkmark/indicator (hidden when not checked) */
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        /* Show the checkmark when checked */
        .container input:checked ~ .checkmark:after {
          display: block;
        }

        /* Style the checkmark/indicator */
        .container .checkmark:after {
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid black;
          border-width: 0 3px 3px 0;
          -webkit-transform: rotate(45deg);
          -ms-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      </style>
      <label class="container">${a}
        <input type="checkbox" checked="${b}" on-change="${(a)=>this._checkedChanged(a)}">
        <span class="checkmark"></span>
      </label>
    `}static get properties(){return{label:String,checked:Boolean}}constructor(){super(),this.checked=!1}_checkedChanged(a){this.checked=a.currentTarget.checked,this.dispatchEvent(new CustomEvent('checked-changed',{bubbles:!1,composed:!0}))}}window.customElements.define('check-box',CheckBox);class FlashCards extends connect(store)(LitElement){static get properties(){return{cards:Object,card:Object,showAnswer:Boolean,showSettings:String,saySettings:String,categories:Array,showSettingsPage:Boolean}}render({card:a,cards:b,showAnswer:c,showSettings:d,saySettings:e,categories:f,showSettingsPage:g}){return html`
      <style>
      :host {
        display: block;
        box-sizing: border-box;
        padding: 60px 20px;
        position: relative;
      }

      [hidden] {
        display: none !important;
      }

      .settings-btn {
        position: absolute;
        right: 40px;
        top: 40px;
        background-color: #FAE1D6;
        text-align: center;
        border-radius: 50%;
        padding: 6px;
        border: 6px solid #fff;
        cursor: pointer;
        z-index: 1;
      }
      #settings {
        min-height: 540px;
        border-radius: 3px;
        background: white;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
           0 1px 8px 0 rgba(0, 0, 0, 0.12),
           0 3px 3px -2px rgba(0, 0, 0, 0.4);
        padding: 20px;
      }
      a-card, #settings {
        box-sizing: border-box;
        max-width: 400px;
        width: 100%;
      }
      h4 {
        line-height: 1;
      }
      </style>
      <button class="settings-btn" on-click=${()=>this._toggleShowSettings()}">${settingsIcon}</button>

      <div id="settings" hidden?="${!g}">
        <check-box id="answer" label="show answer" checked="${c}"></check-box>

        <h4>Pick from</h4>
        ${repeat(Object.keys(b),(a)=>html`
            <check-box label="${a}" checked="${-1!==f.indexOf(a)}" class="categories"></check-box>
          `)}

        <h4>Ask me...</h4>
        <check-box id="all" class="show-settings"
            label="all cards"
            checked="${'all'==d}">
        </check-box><br>
        <check-box id="onlyNew" class="show-settings"
            label="only cards I haven't seen"
            checked="${'onlyNew'==d}">
        </check-box><br>
        <check-box id="mostlyWrong" class="show-settings"
            label="only cards I've gotten mostly wrong"
            checked="${'mostlyWrong'==d}">
        </check-box><br>
        <check-box id="mostlyRight" class="show-settings"
            label="only cards I've gotten mostly right"
            checked="${'mostlyRight'==d}">
        </check-box>

        <h4>Read answer...</h4>
        <check-box id="start" class="say-settings"
            label="when card is shown"
            checked="${'start'==e}">
        </check-box><br>
        <check-box id="end" class="say-settings"
            label="before next card is shown"
            checked="${'end'==e}">
        </check-box><br>
        <check-box id="demand" class="say-settings"
            label="only when I want to"
            checked="${'demand'==e}">

      </div>

      <a-card hidden?="${g}"
        question="${a.question}"
        answer="${a.answer}"
        hint="${a.hint}"
        showAnswer="${c}"
        saySettings="${e}">
      </a-card>
    `}constructor(){super(),this.card={question:'',answer:'',hint:''},this.showSettingsPage=!1}ready(){super.ready(),this._card=this.shadowRoot.querySelector('a-card'),this.addEventListener('checked-changed',(a)=>this._checkedChanged(a.composedPath()[0])),this.addEventListener('next-question',()=>store.dispatch(showNewCard())),this.addEventListener('answered',(a)=>{store.dispatch(a.detail.correct?getRight(this.card):getWrong(this.card))})}stateChanged(a){this.showAnswer=a.app.showAnswer,this.cards=a.data.cards,this.categories=a.data.categories,this.showSettings=a.app.showSettings,this.saySettings=a.app.saySettings;const b=a.data.activeCard;if(b&&b.index!==void 0){if(!this.cards[b.hint])return void store.dispatch(showNewCard());const a=this.cards[b.hint][b.index];this.card={question:a.jp,answer:a.en,hint:b.hint}}}_checkedChanged(a){if('answer'===a.id&&store.dispatch(saveShowAnswer(a.checked)),a.classList.contains('show-settings')&&store.dispatch(saveShowSettings(a.id,a.checked)),a.classList.contains('say-settings'))store.dispatch(saveSaySettings(a.id,a.checked));else{let a=[];const b=this.shadowRoot.querySelectorAll('.categories');for(let c=0;c<b.length;c++)b[c].checked&&a.push(b[c].label);store.dispatch(saveAvailableTypes(a))}}_toggleShowSettings(){this.showSettingsPage=!this.showSettingsPage}}window.customElements.define('play-page',FlashCards);export{myIcons as $myIcons,settingsIcon,audioIcon};