function t(t,e,i,s){var r,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,i,o):r(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:c,defineProperty:h,getOwnPropertyDescriptor:l,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,g=f.trustedTypes,_=g?g.emptyScript:"",m=f.reactiveElementPolyfillSupport,v=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!c(t,e),A={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=A){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??A}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=s;const n=r.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const n=this.constructor;if(!1===s&&(r=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[v("elementProperties")]=new Map,b[v("finalized")]=new Map,m?.({ReactiveElement:b}),(f.reactiveElementVersions??=[]).push("2.1.2");const E=globalThis,w=t=>t,x=E.trustedTypes,C=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,O="?"+P,U=`<${O}>`,k=document,T=()=>k.createComment(""),N=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,M="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,I=/>/g,j=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,B=/"/g,V=/^(?:script|style|textarea|title)$/i,L=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),F=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),G=new WeakMap,q=k.createTreeWalker(k,129);function J(t,e){if(!H(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,s=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=R;for(let e=0;e<i;e++){const i=t[e];let a,c,h=-1,l=0;for(;l<i.length&&(o.lastIndex=l,c=o.exec(i),null!==c);)l=o.lastIndex,o===R?"!--"===c[1]?o=z:void 0!==c[1]?o=I:void 0!==c[2]?(V.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=j):void 0!==c[3]&&(o=j):o===j?">"===c[0]?(o=r??R,h=-1):void 0===c[1]?h=-2:(h=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?j:'"'===c[3]?B:D):o===B||o===D?o=j:o===z||o===I?o=R:(o=j,r=void 0);const d=o===j&&t[e+1].startsWith("/>")?" ":"";n+=o===R?i+U:h>=0?(s.push(a),i.slice(0,h)+S+i.slice(h)+P+d):i+P+(-2===h?e:d)}return[J(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[c,h]=K(t,e);if(this.el=Z.createElement(c,i),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=q.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=h[n++],i=s.getAttribute(t).split(P),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?et:"?"===o[1]?it:"@"===o[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(P)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(V.test(s.tagName)){const t=s.textContent.split(P),e=t.length-1;if(e>0){s.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],T()),q.nextNode(),a.push({type:2,index:++r});s.append(t[e],T())}}}else if(8===s.nodeType)if(s.data===O)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(P,t+1));)a.push({type:7,index:r}),t+=P.length-1}r++}}static createElement(t,e){const i=k.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===F)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=N(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,s)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??k).importNode(e,!0);q.currentNode=s;let r=q.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Y(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(r=q.nextNode(),n++)}return q.currentNode=k,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),N(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==F&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>H(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new X(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new Z(t)),e}k(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new Y(this.O(T()),this.O(T()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){const r=this.strings;let n=!1;if(void 0===r)t=Q(this,t,e,0),n=!N(t)||t!==this._$AH&&t!==F,n&&(this._$AH=t);else{const s=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=Q(this,s[i+o],e,o),a===F&&(a=this._$AH[o]),n||=!N(a)||a!==this._$AH[o],a===W?t=W:t!==W&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class st extends tt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??W)===F)return;const i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const nt=E.litHtmlPolyfillSupport;nt?.(Z,Y),(E.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;class at extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new Y(e.insertBefore(T(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const ct=ot.litElementPolyfillSupport;ct?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},lt={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:$},dt=(t=lt,e,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function pt(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return pt({...t,state:!0,attribute:!1})}const ft=new Set(["ispindel","tilt_ble","plaato","brewfather","grainfather","brewpi","fermentrack","inkbird","rapt_pill"]),gt=new Set(["SG","°P","°Brix","Brix","Plato","P","sg"]),_t=["gravity","wort","specific_gravity","brix","plato"],mt=["temperature","temp","wort_temperature"];function vt(t,e){return Object.values(t.entities).filter(t=>t.device_id===e&&!t.hidden&&void 0===t.entity_category)}function yt(t){return 1111.14*t-616.868-630.272*t**2+135.997*t**3}let $t=class extends at{constructor(){super(...arguments),this.preview=!1}static{this.styles=o`
    ha-card {
      height: 100%;
    }
    .card-header {
      padding: 16px 16px 0;
    }
    .card-header .name {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .card-header .device-model {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    .card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .primary-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .secondary-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .metric {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .metric-label {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.4em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .metric.gravity .metric-value {
      color: var(--primary-color);
    }
    .metric.temperature .metric-value {
      color: var(--warning-color, #ff9800);
    }
    .metric.abv .metric-value {
      color: var(--success-color, #4caf50);
    }
    .metric-secondary {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    ha-history-graph {
      margin: 0 -4px;
    }
    .unconfigured {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .unconfigured ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.5;
    }
    .unconfigured p {
      margin: 0;
      font-size: 0.9em;
    }
  `}static async getConfigElement(){return await Promise.resolve().then(function(){return xt}),document.createElement("fermentation-tracker-card-editor")}static getStubConfig(t){return{type:"custom:fermentation-tracker-card"}}setConfig(t){if(!t)throw new Error("Invalid configuration");this._config=t,this._gravityEntityId=t.gravity_entity,this._tempEntityId=t.temperature_entity}getCardSize(){return 4}willUpdate(t){super.willUpdate(t),(t.has("hass")||t.has("_config"))&&this._config?.device_id&&(this._config.gravity_entity||(this._gravityEntityId=function(t,e){const i=vt(t,e).filter(t=>t.entity_id.startsWith("sensor.")),s=i.find(e=>{const i=t.states[e.entity_id]?.attributes.unit_of_measurement;return"string"==typeof i&&gt.has(i)});if(s)return s.entity_id;const r=i.find(t=>_t.some(e=>t.entity_id.toLowerCase().includes(e)));return r?.entity_id}(this.hass,this._config.device_id)),this._config.temperature_entity||(this._tempEntityId=function(t,e){const i=vt(t,e).filter(t=>t.entity_id.startsWith("sensor.")),s=i.find(e=>"temperature"===t.states[e.entity_id]?.attributes.device_class);if(s)return s.entity_id;const r=i.find(t=>mt.some(e=>t.entity_id.toLowerCase().includes(e)));return r?.entity_id}(this.hass,this._config.device_id)))}render(){if(!this._config)return W;if(!this._config.device_id)return L`
        <ha-card>
          <div class="unconfigured">
            <ha-icon icon="mdi:flask-outline"></ha-icon>
            <p>Click the edit icon to select your fermentation device.</p>
          </div>
        </ha-card>
      `;const t=this._gravityEntityId?this.hass.states[this._gravityEntityId]:void 0,e=this._tempEntityId?this.hass.states[this._tempEntityId]:void 0,i=t?parseFloat(t.state):void 0,s=e?parseFloat(e.state):void 0,r=this.hass.devices[this._config.device_id],n=r?.name_by_user??r?.name??"Fermentation Vessel",o=this._config.name??n,a=this._config.gravity_unit,c=this._formatGravityConverted(i,a),h=this._config.original_gravity,l=h&&i?function(t,e){return(t-e)/(t-1)*100}(h,i):void 0,d=h&&i?function(t,e){return 131.25*(t-e)}(h,i):void 0,p="string"==typeof e?.attributes.unit_of_measurement?e.attributes.unit_of_measurement:"°C";return L`
      <ha-card>
        <div class="card-header">
          <div class="name">${o}</div>
          ${r?.model?L`<div class="device-model">${r.model}</div>`:W}
        </div>
        <div class="card-content">
          <div class="primary-metrics">
            <div class="metric gravity">
              <span class="metric-label">Gravity</span>
              <span class="metric-value">
                ${void 0===i||isNaN(i)?"—":i.toFixed(4)}
              </span>
              ${void 0!==c?L`<span class="metric-secondary">${c}</span>`:W}
            </div>
            <div class="metric temperature">
              <span class="metric-label">Temperature</span>
              <span class="metric-value">
                ${void 0!==s?`${s.toFixed(1)} ${p}`:"—"}
              </span>
            </div>
          </div>

          ${h?L`
                <div class="secondary-metrics">
                  <div class="metric">
                    <span class="metric-label">OG</span>
                    <span class="metric-value">${h.toFixed(3)}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Attenuation</span>
                    <span class="metric-value">
                      ${void 0!==l?`${l.toFixed(1)}%`:"—"}
                    </span>
                  </div>
                  <div class="metric abv">
                    <span class="metric-label">ABV</span>
                    <span class="metric-value">
                      ${void 0!==d?`${d.toFixed(2)}%`:"—"}
                    </span>
                  </div>
                </div>
              `:W}

          ${!1!==this._config.show_graph&&this._gravityEntityId?L`
                <ha-history-graph
                  .hass=${this.hass}
                  .entities=${[{entity:this._gravityEntityId,name:"Gravity"}]}
                  .hoursToShow=${72}
                  .showNames=${!1}
                ></ha-history-graph>
              `:W}
        </div>
      </ha-card>
    `}_formatGravityConverted(t,e){if(void 0!==t&&!isNaN(t)&&e)return"Plato"===e?`${yt(t).toFixed(1)} °P`:"Brix"===e?`${function(t){return yt(t)}(t).toFixed(1)} °Bx`:void 0}};t([pt({attribute:!1})],$t.prototype,"hass",void 0),t([pt({type:Boolean})],$t.prototype,"preview",void 0),t([ut()],$t.prototype,"_config",void 0),t([ut()],$t.prototype,"_gravityEntityId",void 0),t([ut()],$t.prototype,"_tempEntityId",void 0),$t=t([ht("fermentation-tracker-card")],$t),window.customCards??=[],window.customCards.push({type:"fermentation-tracker-card",name:"Fermentation Tracker",description:"Displays live data from iSpindel, Tilt Hydrometer and other fermentation devices",preview:!0,documentationURL:"https://github.com/agentgonzo/homeassistant-fermentation-tracker"});var At=Number.isNaN||function(t){return"number"==typeof t&&t!=t};function bt(t,e){return t===e||!(!At(t)||!At(e))}function Et(t,e){if(t.length!==e.length)return!1;for(var i=0;i<t.length;i++)if(!bt(t[i],e[i]))return!1;return!0}let wt=class extends at{constructor(){super(...arguments),this._configEntryDomains={},this._deviceFilter=function(t,e){void 0===e&&(e=Et);var i=null;function s(){for(var s=[],r=0;r<arguments.length;r++)s[r]=arguments[r];if(i&&i.lastThis===this&&e(s,i.lastArgs))return i.lastResult;var n=t.apply(this,s);return i={lastResult:n,lastArgs:s,lastThis:this},n}return s.clear=function(){i=null},s}(t=>e=>{const i=e.primary_config_entry;if(i){const e=t[i];if(e&&ft.has(e))return!0}return!!e.config_entries.some(e=>{const i=t[e];return void 0!==i&&ft.has(i)})||(s=this.hass,r=e.id,vt(s,r).some(t=>{const e=s.states[t.entity_id];if(!e)return!1;const i=e.attributes.unit_of_measurement;if("string"==typeof i&&gt.has(i))return!0;const r=t.entity_id.toLowerCase();return _t.some(t=>r.includes(t))}));var s,r})}static{this.styles=o`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    ha-device-picker,
    ha-textfield,
    ha-select {
      display: block;
      width: 100%;
    }
    .row {
      display: flex;
      gap: 16px;
    }
    .row > * {
      flex: 1;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      margin: 0;
    }
    .section-label {
      font-size: 0.85em;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: -8px;
    }
  `}setConfig(t){this._config=t}async firstUpdated(){const t=await this.hass.callWS({type:"config_entries/get"});this._configEntryDomains=Object.fromEntries(t.entries.map(t=>[t.entry_id,t.domain]))}render(){if(!this.hass||!this._config)return W;const t=this._deviceFilter(this._configEntryDomains);return L`
      <div class="card-config">
        <ha-device-picker
          .hass=${this.hass}
          .value=${this._config.device_id??""}
          .label=${"Fermentation Device"}
          .deviceFilter=${t}
          @value-changed=${this._deviceChanged}
        ></ha-device-picker>

        ${this._config.device_id?L`
              <ha-textfield
                .label=${"Card title (optional)"}
                .value=${this._config.name??""}
                .configValue=${"name"}
                @change=${this._valueChanged}
              ></ha-textfield>

              <div class="row">
                <ha-select
                  .label=${"Also show gravity as"}
                  .value=${this._config.gravity_unit??""}
                  .configValue=${"gravity_unit"}
                  @selected=${this._selectChanged}
                  @closed=${t=>t.stopPropagation()}
                >
                  <mwc-list-item value="">SG only</mwc-list-item>
                  <mwc-list-item value="Plato">+ Plato (°P)</mwc-list-item>
                  <mwc-list-item value="Brix">+ Brix (°Bx)</mwc-list-item>
                </ha-select>

                <ha-textfield
                  type="number"
                  .label=${"Original Gravity (SG)"}
                  .value=${this._config.original_gravity?.toString()??""}
                  .configValue=${"original_gravity"}
                  placeholder="e.g. 1.052"
                  min="0.990"
                  max="1.200"
                  step="0.001"
                  @change=${this._numberChanged}
                ></ha-textfield>
              </div>

              <ha-formfield .label=${"Show gravity trend graph"}>
                <ha-switch
                  .checked=${!1!==this._config.show_graph}
                  .configValue=${"show_graph"}
                  @change=${this._switchChanged}
                ></ha-switch>
              </ha-formfield>

              <div class="section-label">Entity overrides (optional)</div>

              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._config.gravity_entity??""}
                .label=${"Gravity entity (auto-detected if blank)"}
                .configValue=${"gravity_entity"}
                allow-custom-entity
                @value-changed=${this._entityPickerChanged}
              ></ha-entity-picker>

              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._config.temperature_entity??""}
                .label=${"Temperature entity (auto-detected if blank)"}
                .configValue=${"temperature_entity"}
                allow-custom-entity
                @value-changed=${this._entityPickerChanged}
              ></ha-entity-picker>
            `:L`<p class="hint">Select a fermentation device above to configure the card.</p>`}
      </div>
    `}_deviceChanged(t){if(t.stopPropagation(),!this._config)return;const e=t.detail.value;this._fireConfigChanged({...this._config,device_id:e||void 0,gravity_entity:void 0,temperature_entity:void 0})}_valueChanged(t){if(!this._config)return;const e=t.target;this._fireConfigChanged({...this._config,[e.configValue]:e.value})}_numberChanged(t){if(!this._config)return;const e=t.target,i=e.value?parseFloat(e.value):void 0;this._fireConfigChanged({...this._config,[e.configValue]:i})}_selectChanged(t){if(t.stopPropagation(),!this._config)return;const e=t.target,i=e.value||void 0;this._fireConfigChanged({...this._config,[e.configValue]:i})}_switchChanged(t){if(!this._config)return;const e=t.target;this._fireConfigChanged({...this._config,[e.configValue]:e.checked})}_entityPickerChanged(t){if(t.stopPropagation(),!this._config)return;const e=t.target,i=t.detail.value||void 0;this._fireConfigChanged({...this._config,[e.configValue]:i})}_fireConfigChanged(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};t([pt({attribute:!1})],wt.prototype,"hass",void 0),t([ut()],wt.prototype,"_config",void 0),t([ut()],wt.prototype,"_configEntryDomains",void 0),wt=t([ht("fermentation-tracker-card-editor")],wt);var xt=Object.freeze({__proto__:null,get FermentationCardEditor(){return wt}});
