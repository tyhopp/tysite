!customElements.get('ty-date') &&
  customElements.define(
    'ty-date',
    class extends HTMLElement {
      connectedCallback() {
        const date = new Date(this.getAttribute('datetime'));
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        this.textContent = formattedDate;
      }
    }
  );
