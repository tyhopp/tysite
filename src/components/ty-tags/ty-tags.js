!customElements.get('ty-tags') &&
  customElements.define(
    'ty-tags',
    class extends HTMLElement {
      get categories() {
        return this.getAttribute('categories').split(/,\s/g);
      }

      connectedCallback() {
        const categoryFragment = new DocumentFragment();

        this.categories.forEach((category) => {
          const categoryElement = document.createElement('span');
          categoryElement.textContent = category;
          categoryFragment.appendChild(categoryElement);
        });

        this.appendChild(categoryFragment);
      }
    }
  );
