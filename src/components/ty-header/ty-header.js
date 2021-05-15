class TyHeader extends HTMLElement {
  constructor() {
    super();
    this._setCurrentNav = this._setCurrentNav.bind(this);
  }

  get template() {
    const templateString = `
      <a class="ty-header-nav" href="/" title="Work">
        <img class="ty-header-nav-img" src="../../assets/svg/emoji-card-box.svg" alt="Card box emoji"></img>
      </a>
      <a class="ty-header-nav" href="/notes" title="Notes">
        <img class="ty-header-nav-img" src="../../assets/svg/emoji-hand-writing.svg" alt="Hand writing emoji"></img>
      </a>
    `;
    const template = document
      .createRange()
      .createContextualFragment(templateString);
    return template;
  }

  connectedCallback() {
    if (!this.children.length) {
      this.appendChild(this.template);
    }
    this._setCurrentNav();
    this._setListeners(true);
    this._initialized = true;
  }

  disconnectedCallback() {
    this._setListeners(false);
  }

  _setCurrentNav() {
    const navs = this.querySelectorAll('.ty-header-nav');
    Array.from(navs).forEach((nav) => {
      const origin = `${window.location.origin}`;
      const pathname = `${window.location.pathname}`;
      const isCurrentRoute =
        nav.href === `${origin}/`
          ? nav.href === `${origin}${pathname}` // If index, compare strictly
          : `${origin}${pathname}`.includes(nav.href); // If other route, compare inclusively
      nav.classList[isCurrentRoute ? 'add' : 'remove'](
        'ty-header-nav--current'
      );
    });
  }

  _setListeners(flag) {
    const fnName = flag ? 'addEventListener' : 'removeEventListener';
    window[fnName]('popstate', this._setCurrentNav);
  }
}

customElements.define('ty-header', TyHeader);
