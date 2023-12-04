'use client';

class CalendarWidget extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = '<p>Calendar Widget</p>';
    }
}

customElements.define('mask-calendar-widget', CalendarWidget);
