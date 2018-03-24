import{html,PageViewElement,connect,repeat,store}from'./my-app.js';class StatsPage extends connect(store)(PageViewElement){render({cards:a,stats:b}){return html`
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          padding-top: 20px;
          --box-size: 40px;
        }
        .columns {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
        }
        .column {
          padding: 10px;
        }
        h3 {
          text-align: center;
        }
        .list {
          box-sizing: border-box;
          width: calc(5 * var(--box-size) + 5*8px) ;
          cursor: pointer;
          line-height: 1;
          text-align: center;
          font-size: 0;
        }
        .list > div {
          box-sizing: border-box;
          width: var(--box-size);
          height: var(--box-size);
          padding-top: 2px;
          display: inline-block;
          border-radius: 1.5px;
        }
        .jp {
          font-size: 20px;
          font-weight: bold;
        }
        .en {
          font-size: 12px;
          font-weight: normal;
        }
        .ellipsis {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <div class="columns">
      ${repeat(Object.keys(a),(c)=>html`
        <div class="column">
          <h3>${c}</h3>
          <div class="list">
            ${repeat(Object.keys(a[c]),(d)=>html`
              <div style$="${this._getColor(c,a[c][d].jp,b)}">
                <div class="jp ellipsis" title="${a[c][d].jp}">${a[c][d].jp}</div>
                <div class="en ellipsis" title="${a[c][d].en}">${a[c][d].en}</div>
              </div>
            `)}
          </div>
        </div>
        `)}
      </div>
    `}static get properties(){return{stats:Object,cards:Object}}stateChanged(a){this.cards=a.data.cards,this.stats=a.data.stats}_getColor(a,b,c){const d='background: rgba(255,255,255,0.6)';if(!c)return d;const e=c[a]?c[a][b]:null;if(!e)return d;const f=e.right/(e.right+e.wrong);return 0===e.right+e.wrong?d:0.5<=f?`background: rgba(76, 175, 80,${f})`:`background: rgba(255, 87, 34,${1-f})`}}window.customElements.define('stats-page',StatsPage);