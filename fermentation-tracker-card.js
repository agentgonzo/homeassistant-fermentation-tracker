function t(t,e,i,s){var r,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,i,o):r(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:h,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:l,getOwnPropertySymbols:_,getPrototypeOf:p}=Object,u=globalThis,y=u.trustedTypes,f=y?y.emptyScript:"",g=u.reactiveElementPolyfillSupport,v=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!h(t,e),b={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...l(t),..._(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=s;const n=r.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const n=this.constructor;if(!1===s&&(r=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[v("elementProperties")]=new Map,A[v("finalized")]=new Map,g?.({ReactiveElement:A}),(u.reactiveElementVersions??=[]).push("2.1.2");const E=globalThis,S=t=>t,w=E.trustedTypes,C=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,I="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,O="?"+x,T=`<${O}>`,P=document,U=()=>P.createComment(""),R=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,k="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,D=/>/g,M=RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,F=/"/g,j=/^(?:script|style|textarea|title)$/i,z=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),G=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),W=new WeakMap,V=P.createTreeWalker(P,129);function q(t,e){if(!H(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const Y=(t,e)=>{const i=t.length-1,s=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=N;for(let e=0;e<i;e++){const i=t[e];let a,h,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,h=o.exec(i),null!==h);)d=o.lastIndex,o===N?"!--"===h[1]?o=L:void 0!==h[1]?o=D:void 0!==h[2]?(j.test(h[2])&&(r=RegExp("</"+h[2],"g")),o=M):void 0!==h[3]&&(o=M):o===M?">"===h[0]?(o=r??N,c=-1):void 0===h[1]?c=-2:(c=o.lastIndex-h[2].length,a=h[1],o=void 0===h[3]?M:'"'===h[3]?F:B):o===F||o===B?o=M:o===L||o===D?o=N:(o=M,r=void 0);const l=o===M&&t[e+1].startsWith("/>")?" ":"";n+=o===N?i+T:c>=0?(s.push(a),i.slice(0,c)+I+i.slice(c)+x+l):i+x+(-2===c?e:l)}return[q(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class X{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[h,c]=Y(t,e);if(this.el=X.createElement(h,i),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=V.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(I)){const e=c[n++],i=s.getAttribute(t).split(x),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?et:"?"===o[1]?it:"@"===o[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(x)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(x),e=t.length-1;if(e>0){s.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],U()),V.nextNode(),a.push({type:2,index:++r});s.append(t[e],U())}}}else if(8===s.nodeType)if(s.data===O)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(x,t+1));)a.push({type:7,index:r}),t+=x.length-1}r++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,s){if(e===G)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=R(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Z(t,r._$AS(t,e.values),r,s)),e}class J{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??P).importNode(e,!0);V.currentNode=s;let r=V.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Q(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(r=V.nextNode(),n++)}return V.currentNode=P,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),R(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>H(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=X.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new J(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new X(t)),e}k(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new Q(this.O(U()),this.O(U()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=S(t).nextSibling;S(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,s){const r=this.strings;let n=!1;if(void 0===r)t=Z(this,t,e,0),n=!R(t)||t!==this._$AH&&t!==G,n&&(this._$AH=t);else{const s=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=Z(this,s[i+o],e,o),a===G&&(a=this._$AH[o]),n||=!R(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class st extends tt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??K)===G)return;const i=this._$AH,s=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const nt=E.litHtmlPolyfillSupport;nt?.(X,Q),(E.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;class at extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new Q(e.insertBefore(U(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const ht=ot.litElementPolyfillSupport;ht?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},dt={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:$},lt=(t=dt,e,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function _t(t){return(e,i)=>"object"==typeof i?lt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function pt(t){return _t({...t,state:!0,attribute:!1})}const ut=new Set(["SG","°P","°Brix","Brix","Plato","P","sg"]),yt=["gravity","wort","specific_gravity","brix","plato"],ft=["temperature","temp","wort_temperature"];function gt(t,e){return Object.values(t.entities).filter(t=>t.device_id===e&&!t.hidden&&void 0===t.entity_category)}function vt(t,e,i){const s=gt(t,e).filter(t=>t.entity_id.startsWith("sensor.")).find(e=>t.states[e.entity_id]?.attributes.device_class===i);return s?.entity_id}function mt(t){return 1111.14*t-616.868-630.272*t**2+135.997*t**3}function $t(t,e){return(t-e)/(t-1)*100}function bt(t,e){return 131.25*(t-e)}var At;let Et=class extends at{constructor(){super(...arguments),this.preview=!1,this._tempEntityIds=[],this._historicalValues={},this._resolvedRangeHours=72}static{At=this}static{this.AUTO_DETECT_LOOKBACK_HOURS=720}static{this.AUTO_DETECT_GAP_HOURS=6}static{this.AUTO_FALLBACK_HOURS=168}static{this.STABILITY_TOLERANCE_SG=.005}static{this.STABILITY_WINDOW_SIZE=3}static{this.STABILITY_MAX_OFFSET_HOURS=4}static{this.MIN_PLAUSIBLE_SG=.99}static{this.MAX_PLAUSIBLE_SG=1.2}static{this.SUPPORT_WINDOW_HOURS=4}static{this.SUPPORT_TOLERANCE_SG=.02}static{this.styles=o`
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
      grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
      grid-auto-flow: column;
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
    .delta {
      font-size: 0.75em;
      margin-top: 2px;
      letter-spacing: 0.02em;
      color: var(--primary-text-color);
    }
    .delta.bad {
      color: var(--error-color, #f44336);
    }
    .delta.good {
      color: var(--success-color, #4caf50);
    }
    .graph-wrapper {
      margin: 0 -4px;
    }
    .graph-wrapper > * {
      --ha-card-background: transparent;
      --ha-card-box-shadow: none;
      --ha-card-border-width: 0;
    }
    .graph-missing {
      padding: 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }
    .graph-missing a {
      color: var(--primary-color);
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
  `}static async getConfigElement(){return await Promise.resolve().then(function(){return Ct}),document.createElement("fermentation-tracker-card-editor")}static getStubConfig(t){return{type:"custom:fermentation-tracker-card"}}setConfig(t){if(!t)throw new Error("Invalid configuration");this._config=t,this._gravityEntityId=t.gravity_entity,this._tempEntityIds=t.temperature_entity??[],this._signalEntityId=t.signal_strength_entity,this._batteryEntityId=t.battery_entity}getCardSize(){return 4}willUpdate(t){if(super.willUpdate(t),(t.has("hass")||t.has("_config"))&&this._config?.device_id){const t=this._config.device_id;if(this._config.gravity_entity||(this._gravityEntityId=function(t,e){const i=gt(t,e).filter(t=>t.entity_id.startsWith("sensor.")),s=i.find(e=>{const i=t.states[e.entity_id]?.attributes.unit_of_measurement;return"string"==typeof i&&ut.has(i)});if(s)return s.entity_id;const r=i.find(t=>yt.some(e=>t.entity_id.toLowerCase().includes(e)));return r?.entity_id}(this.hass,t)),this._config.temperature_entity&&0!==this._config.temperature_entity.length)this._tempEntityIds=this._config.temperature_entity;else{const e=function(t,e){const i=gt(t,e).filter(t=>t.entity_id.startsWith("sensor.")),s=i.find(e=>"temperature"===t.states[e.entity_id]?.attributes.device_class);if(s)return s.entity_id;const r=i.find(t=>ft.some(e=>t.entity_id.toLowerCase().includes(e)));return r?.entity_id}(this.hass,t);this._tempEntityIds=e?[e]:[]}this._config.signal_strength_entity||(this._signalEntityId=vt(this.hass,t,"signal_strength")),this._config.battery_entity||(this._batteryEntityId=vt(this.hass,t,"voltage"))}if(t.has("hass")&&this._historyCard&&(this._historyCard.hass=this.hass),!1!==this._config?.show_graph&&this._gravityEntityId){const t=this._config?.chart_type??"default",e=[this._gravityEntityId,...this._tempEntityIds];"default"===t&&this._config?.show_device_info&&(this._signalEntityId&&e.push(this._signalEntityId),this._batteryEntityId&&e.push(this._batteryEntityId));const i=`${t}::main::${e.join("|")}`;if(i!==this._historyCardKey&&this._createHistoryCard(t,e,i),"apex"===t&&this._config?.show_device_info){const t=[this._signalEntityId,this._batteryEntityId].filter(t=>!!t),e=`apex::info::${t.join("|")}`;t.length>0&&e!==this._deviceInfoCardKey?this._createDeviceInfoCard(t,e):0===t.length&&(this._deviceInfoCard=void 0,this._deviceInfoCardKey=void 0)}else this._deviceInfoCard&&(this._deviceInfoCard=void 0,this._deviceInfoCardKey=void 0)}if(t.has("hass")&&this._deviceInfoCard&&(this._deviceInfoCard.hass=this.hass),this._gravityEntityId){const t=`${this._gravityEntityId}::${this._config?.time_range??"auto"}::${this._config?.time_range_custom_hours??""}`;t!==this._rangeKey&&(this._rangeKey=t,this._resolveTimeRange())}if(this._gravityEntityId){const t=`${this._resolvedRangeHours}::${[this._gravityEntityId,...this._tempEntityIds].join("|")}`;t!==this._historicalKey&&(this._historicalKey=t,this._fetchHistoricalValues())}}async _resolveTimeRange(){const t=this._config?.time_range??"auto",e={"1d":24,"3d":72,"7d":168,"14d":336,"30d":720};let i;i="custom"===t?this._config?.time_range_custom_hours??72:"auto"===t?await this._detectAutoRangeHours():e[t]??72,i!==this._resolvedRangeHours&&(this._resolvedRangeHours=i,this._historyCardKey=void 0,this._deviceInfoCardKey=void 0)}_filterIsolated(t){const e=60*At.SUPPORT_WINDOW_HOURS*60*1e3,i=At.SUPPORT_TOLERANCE_SG,s=[];for(let r=0;r<t.length;r++){const n=t[r];let o=!1;for(let s=r+1;s<t.length&&!(t[s].t-n.t>e);s++)if(Math.abs(t[s].v-n.v)<=i){o=!0;break}if(!o)for(let s=r-1;s>=0&&!(n.t-t[s].t>e);s--)if(Math.abs(t[s].v-n.v)<=i){o=!0;break}o&&s.push(n)}return s}_findStableStart(t,e){const i=At.STABILITY_TOLERANCE_SG,s=At.STABILITY_WINDOW_SIZE,r=60*At.STABILITY_MAX_OFFSET_HOURS*60*1e3,n=t[e].t,o=Math.min(t.length-s,t.length-1);for(let a=e;a<=o&&!(t[a].t-n>r);a++){let e=t[a].v,r=t[a].v;for(let i=1;i<s&&a+i<t.length;i++){const s=t[a+i].v;s<e&&(e=s),s>r&&(r=s)}if(r-e<=i)return t[a].t}return n}async _detectAutoRangeHours(){if(!this.hass||!this._gravityEntityId)return At.AUTO_FALLBACK_HOURS;const t=60*At.AUTO_DETECT_LOOKBACK_HOURS*60*1e3,e=new Date(Date.now()-t),i=new Date;try{const t=(await this.hass.callWS({type:"history/history_during_period",start_time:e.toISOString(),end_time:i.toISOString(),entity_ids:[this._gravityEntityId],minimal_response:!0,no_attributes:!0}))[this._gravityEntityId]??[];if(t.length<2)return At.AUTO_FALLBACK_HOURS;const s=[];for(const e of t){const t="number"==typeof e.lu?e.lu:0;if(t<=0)continue;const i=t<1e12?1e3*t:t,r=parseFloat(e.s);isNaN(r)||(r<At.MIN_PLAUSIBLE_SG||r>At.MAX_PLAUSIBLE_SG||s.push({t:i,v:r}))}if(s.length<2)return At.AUTO_FALLBACK_HOURS;const r=this._filterIsolated(s);r.length<2&&(console.warn("[fermentation-tracker] all plausible readings filtered as isolated; falling back to plausible set"),r.push(...s));const n=60*At.AUTO_DETECT_GAP_HOURS*60*1e3;let o=0;for(let t=r.length-1;t>0;t--)if(r[t].t-r[t-1].t>n){o=t;break}const a=this._findStableStart(r,o),h=(Date.now()-a)/36e5;return console.debug(`[fermentation-tracker] auto range: ${s.length} plausible / ${r.length} supported readings, fermentation start ${new Date(a).toISOString()} (${h.toFixed(1)}h ago)`),Math.max(1,Math.ceil(h))}catch(t){return console.error("[fermentation-tracker] auto range detection failed",t),At.AUTO_FALLBACK_HOURS}}connectedCallback(){super.connectedCallback(),this._historicalRefreshTimer=setInterval(()=>this._fetchHistoricalValues(),6e5)}disconnectedCallback(){super.disconnectedCallback(),this._historicalRefreshTimer&&(clearInterval(this._historicalRefreshTimer),this._historicalRefreshTimer=void 0)}async _fetchHistoricalValues(){if(!this.hass||!this._gravityEntityId)return;if(await this._fetchOriginalGravity(),!1===this._config?.show_delta_24h)return;const t=[this._gravityEntityId,...this._tempEntityIds];this._config?.show_device_info&&(this._signalEntityId&&t.push(this._signalEntityId),this._batteryEntityId&&t.push(this._batteryEntityId));const e=new Date(Date.now()-864e5),i=new Date(e.getTime()+36e5);try{const s=await this.hass.callWS({type:"history/history_during_period",start_time:e.toISOString(),end_time:i.toISOString(),entity_ids:t,minimal_response:!0,no_attributes:!0}),r={};for(const e of t){const t=s[e];if(t&&t.length>0){const i=parseFloat(t[0].s);isNaN(i)||(r[e]=i)}}this._historicalValues=r}catch(t){console.error("[fermentation-tracker] failed to fetch 24h history",t)}}async _fetchOriginalGravity(){if(!this.hass||!this._gravityEntityId)return;const t=new Date(Date.now()-60*this._resolvedRangeHours*60*1e3),e=new Date(t.getTime()+36e5);try{const i=(await this.hass.callWS({type:"history/history_during_period",start_time:t.toISOString(),end_time:e.toISOString(),entity_ids:[this._gravityEntityId],minimal_response:!0,no_attributes:!0}))[this._gravityEntityId];if(i&&i.length>0){const t=parseFloat(i[0].s);this._originalGravity=isNaN(t)?void 0:t}else this._originalGravity=void 0}catch(t){console.error("[fermentation-tracker] failed to fetch OG",t)}}async _createHistoryCard(t,e,i){this._historyCardKey=i;const s=await(window.loadCardHelpers?.());if(!s)return;const r="apex"===t?this._buildApexConfig():{type:"history-graph",entities:e,hours_to_show:this._resolvedRangeHours},n=s.createCardElement(r);n.hass=this.hass,this._historyCard=n}_buildApexConfig(){const t=[],e=[];return this._gravityEntityId&&(t.push({entity:this._gravityEntityId,name:"Gravity",yaxis_id:"gravity",stroke_width:2,float_precision:4}),e.push({id:"gravity",decimals:4,apex_config:{tickAmount:4}})),this._tempEntityIds.length>0&&(this._tempEntityIds.forEach(e=>{t.push({entity:e,yaxis_id:"temperature",stroke_width:2,float_precision:1})}),e.push({id:"temperature",decimals:1,opposite:!0,apex_config:{tickAmount:4}})),{type:"custom:apexcharts-card",graph_span:`${this._resolvedRangeHours}h`,header:{show:!1},yaxis:e,series:t}}_buildApexDeviceInfoConfig(){const t=[],e=[];return this._signalEntityId&&(t.push({entity:this._signalEntityId,name:"Signal",yaxis_id:"signal",stroke_width:2,float_precision:0}),e.push({id:"signal",decimals:0,apex_config:{tickAmount:4}})),this._batteryEntityId&&(t.push({entity:this._batteryEntityId,name:"Battery",yaxis_id:"battery",stroke_width:2,float_precision:2}),e.push({id:"battery",decimals:2,opposite:!0,apex_config:{tickAmount:4}})),{type:"custom:apexcharts-card",graph_span:`${this._resolvedRangeHours}h`,header:{show:!1},yaxis:e,series:t}}async _createDeviceInfoCard(t,e){this._deviceInfoCardKey=e;const i=await(window.loadCardHelpers?.());if(!i)return;const s=i.createCardElement(this._buildApexDeviceInfoConfig());s.hass=this.hass,this._deviceInfoCard=s}render(){if(!this._config)return K;if(!this._config.device_id)return z`
        <ha-card>
          <div class="unconfigured">
            <ha-icon icon="mdi:flask-outline"></ha-icon>
            <p>Click the edit icon to select your fermentation device.</p>
          </div>
        </ha-card>
      `;const t=this._gravityEntityId?this.hass.states[this._gravityEntityId]:void 0,e=t?parseFloat(t.state):void 0,i=this.hass.devices[this._config.device_id],s=i?.name_by_user??i?.name??"Fermentation Vessel",r=this._config.name??s,n=this._config.gravity_unit,o=this._formatGravityConverted(e,n),a=this._originalGravity,h=a&&e?$t(a,e):void 0,c=a&&e?bt(a,e):void 0,d=this._gravityEntityId?this._historicalValues[this._gravityEntityId]:void 0,l=void 0!==e&&void 0!==d?e-d:void 0,_=a&&d?$t(a,d):void 0,p=void 0!==h&&void 0!==_?h-_:void 0,u=a&&d?bt(a,d):void 0,y=void 0!==c&&void 0!==u?c-u:void 0,f=this._tempEntityIds.map(t=>{const e=this.hass.states[t];if(!e)return null;const i=parseFloat(e.state);if(isNaN(i))return null;const s="string"==typeof e.attributes.unit_of_measurement?e.attributes.unit_of_measurement:"°C",r=this.hass.entities[t]?.entity_id===t?e.attributes.friendly_name:void 0;return{id:t,name:"string"==typeof r?r:t,value:i,uom:s}}).filter(t=>null!==t),g=f[0],v=this._signalEntityId?this.hass.states[this._signalEntityId]:void 0,m=v?parseFloat(v.state):void 0,$="string"==typeof v?.attributes.unit_of_measurement?v.attributes.unit_of_measurement:"dB",b=this._signalEntityId?this._historicalValues[this._signalEntityId]:void 0,A=void 0!==m&&void 0!==b?m-b:void 0,E=this._batteryEntityId?this.hass.states[this._batteryEntityId]:void 0,S=E?parseFloat(E.state):void 0,w="string"==typeof E?.attributes.unit_of_measurement?E.attributes.unit_of_measurement:"V",C=this._batteryEntityId?this._historicalValues[this._batteryEntityId]:void 0,I=void 0!==S&&void 0!==C?S-C:void 0,x=g?this._historicalValues[g.id]:void 0,O=g&&void 0!==x?g.value-x:void 0;return z`
      <ha-card>
        <div class="card-header">
          <div class="name">${r}</div>
        </div>
        <div class="card-content">
          <div class="primary-metrics">
            <div class="metric gravity">
              <span class="metric-label">Gravity</span>
              <span class="metric-value">
                ${void 0===e||isNaN(e)?"—":e.toFixed(4)}
              </span>
              ${this._renderDelta(l,4,"down-good")}
              ${void 0!==o?z`<span class="metric-secondary">${o}</span>`:K}
            </div>
            <div class="metric temperature">
              <span class="metric-label">Temperature</span>
              <span class="metric-value">
                ${g?`${g.value.toFixed(1)} ${g.uom}`:"—"}
              </span>
              ${this._renderDelta(O,1,"neutral")}
            </div>
          </div>

          ${a?z`
                <div class="secondary-metrics">
                  <div class="metric">
                    <span class="metric-label">OG</span>
                    <span class="metric-value">${a.toFixed(3)}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Attenuation</span>
                    <span class="metric-value">
                      ${void 0!==h?`${h.toFixed(1)}%`:"—"}
                    </span>
                    ${this._renderDelta(p,1,"up-good","%")}
                  </div>
                  <div class="metric abv">
                    <span class="metric-label">ABV</span>
                    <span class="metric-value">
                      ${void 0!==c?`${c.toFixed(2)}%`:"—"}
                    </span>
                    ${this._renderDelta(y,2,"up-good","%")}
                  </div>
                </div>
              `:K}

          ${this._config.show_device_info?z`
                <div class="secondary-metrics">
                  <div class="metric">
                    <span class="metric-label">Signal</span>
                    <span class="metric-value">
                      ${void 0===m||isNaN(m)?"—":`${m.toFixed(0)} ${$}`}
                    </span>
                    ${this._renderDelta(A,0,"neutral",` ${$}`)}
                  </div>
                  <div class="metric">
                    <span class="metric-label">Battery</span>
                    <span class="metric-value">
                      ${void 0===S||isNaN(S)?"—":`${S.toFixed(2)} ${w}`}
                    </span>
                    ${this._renderDelta(I,2,"neutral",` ${w}`)}
                  </div>
                </div>
              `:K}

          ${!1!==this._config.show_graph?"apex"!==this._config.chart_type||customElements.get("apexcharts-card")?z`
                  ${this._historyCard?z`<div class="graph-wrapper">${this._historyCard}</div>`:K}
                  ${this._deviceInfoCard?z`<div class="graph-wrapper">${this._deviceInfoCard}</div>`:K}
                `:z`<div class="graph-missing">
                  ApexCharts not installed. Install
                  <a
                    href="https://github.com/RomRider/apexcharts-card"
                    target="_blank"
                    rel="noopener"
                    >apexcharts-card</a
                  >
                  via HACS or switch chart style back to default.
                </div>`:K}
        </div>
      </ha-card>
    `}_renderDelta(t,e,i,s=""){if(!1===this._config?.show_delta_24h)return K;if(void 0===t||isNaN(t))return K;const r="Change in the last 24 hours";if(0===t)return z`<span class="delta" title=${r}>±0${s}</span>`;const n=t>0;let o="delta";return"up-good"===i?o+=n?" good":" bad":"down-good"===i&&(o+=n?" bad":" good"),z`<span class="${o}" title=${r}>
      ${n?"▲":"▼"} ${n?"+":"−"}${Math.abs(t).toFixed(e)}${s}
    </span>`}_formatGravityConverted(t,e){if(void 0!==t&&!isNaN(t)&&e)return"Plato"===e?`${mt(t).toFixed(1)} °P`:"Brix"===e?`${function(t){return mt(t)}(t).toFixed(1)} °Bx`:void 0}};t([_t({attribute:!1})],Et.prototype,"hass",void 0),t([_t({type:Boolean})],Et.prototype,"preview",void 0),t([pt()],Et.prototype,"_config",void 0),t([pt()],Et.prototype,"_gravityEntityId",void 0),t([pt()],Et.prototype,"_tempEntityIds",void 0),t([pt()],Et.prototype,"_signalEntityId",void 0),t([pt()],Et.prototype,"_batteryEntityId",void 0),t([pt()],Et.prototype,"_historyCard",void 0),t([pt()],Et.prototype,"_deviceInfoCard",void 0),t([pt()],Et.prototype,"_historicalValues",void 0),t([pt()],Et.prototype,"_originalGravity",void 0),t([pt()],Et.prototype,"_resolvedRangeHours",void 0),Et=At=t([ct("fermentation-tracker-card")],Et),window.customCards??=[],window.customCards.push({type:"fermentation-tracker-card",name:"Fermentation Tracker",description:"Displays live data from iSpindel, Tilt Hydrometer and other fermentation devices",preview:!0,documentationURL:"https://github.com/agentgonzo/homeassistant-fermentation-tracker"});const St=t=>{switch(t.name){case"device_id":return"Fermentation Device";case"name":return"Card title (optional)";case"gravity_unit":return"Also show gravity as";case"time_range":return"Time range";case"time_range_custom_hours":return"Custom range (hours)";case"show_graph":return"Show trend graph";case"show_delta_24h":return"Show 24h change indicators";case"show_device_info":return"Show additional device information";case"chart_type":return"Chart style";case"gravity_entity":return"Gravity entity (auto-detected if blank)";case"temperature_entity":return"Temperature entities (auto-detected if blank)";case"signal_strength_entity":return"Signal strength entity (auto-detected if blank)";case"battery_entity":return"Battery / voltage entity (auto-detected if blank)";default:return t.name}};let wt=class extends at{static{this.styles=o`
    :host {
      display: block;
    }
    ha-form {
      display: block;
      padding: 16px 0;
    }
  `}setConfig(t){this._config=t}_measurementSensorsForDevice(t){return Object.values(this.hass.entities).filter(e=>e.device_id===t&&e.entity_id.startsWith("sensor.")&&!e.hidden&&"measurement"===this.hass.states[e.entity_id]?.attributes.state_class).map(t=>t.entity_id)}_buildSchema(t){const e=[{name:"device_id",required:!0,selector:{device:{}}}];return t&&e.push({name:"name",selector:{text:{}}},{name:"gravity_unit",selector:{select:{mode:"dropdown",options:[{value:"",label:"SG only"},{value:"Plato",label:"+ Plato (°P)"},{value:"Brix",label:"+ Brix (°Bx)"}]}}},{name:"time_range",selector:{select:{mode:"dropdown",options:[{value:"auto",label:"Auto (since fermentation start)"},{value:"1d",label:"Last 24 hours"},{value:"3d",label:"Last 3 days"},{value:"7d",label:"Last 7 days"},{value:"14d",label:"Last 14 days"},{value:"30d",label:"Last 30 days"},{value:"custom",label:"Custom"}]}}},{name:"time_range_custom_hours",selector:{number:{min:1,max:720,step:1,mode:"box"}}},{name:"show_graph",selector:{boolean:{}}},{name:"show_delta_24h",selector:{boolean:{}}},{name:"show_device_info",selector:{boolean:{}}},{name:"chart_type",selector:{select:{mode:"dropdown",options:[{value:"default",label:"Default (HA history graph)"},{value:"apex",label:"ApexCharts (dual axis, requires apexcharts-card)"}]}}},{name:"gravity_entity",selector:{entity:{include_entities:this._measurementSensorsForDevice(t)}}},{name:"temperature_entity",selector:{entity:{multiple:!0,filter:{device_class:"temperature"}}}},{name:"signal_strength_entity",selector:{entity:{filter:{device_id:t,device_class:"signal_strength"}}}},{name:"battery_entity",selector:{entity:{filter:{device_id:t,device_class:"voltage"}}}}),e}render(){if(!this.hass||!this._config)return K;const t=this._buildSchema(this._config.device_id),e=Object.fromEntries(Object.entries(this._config).filter(([,t])=>void 0!==t));return z`
      <ha-form
        .hass=${this.hass}
        .data=${e}
        .schema=${t}
        .computeLabel=${St}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(t){if(t.stopPropagation(),!this._config)return;const e={...this._config,...t.detail.value};for(const t of Object.keys(e))""!==e[t]&&null!==e[t]||(e[t]=void 0);e.device_id!==this._config.device_id&&(e.gravity_entity=void 0,e.temperature_entity=void 0),this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}};t([_t({attribute:!1})],wt.prototype,"hass",void 0),t([pt()],wt.prototype,"_config",void 0),wt=t([ct("fermentation-tracker-card-editor")],wt);var Ct=Object.freeze({__proto__:null,get FermentationCardEditor(){return wt}});
