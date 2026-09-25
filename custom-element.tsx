import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Wix Custom Element entry point.
 *
 * This intentionally uses Light DOM: the existing Nain Music application relies
 * on its global Tailwind/CSS rules and DOM-based behaviors.
 */
const ELEMENT_NAME = 'nain-music-app';

let widgetInstanceCount = 0;

class NainMusicAppElement extends HTMLElement {
  private root: Root | null = null;
  private mountNode: HTMLDivElement | null = null;

  connectedCallback() {
    if (this.root) return;

    this.setAttribute('data-nain-music-widget-host', 'true');
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.minHeight = '100px';

    widgetInstanceCount += 1;

    this.mountNode = document.createElement('div');
    this.mountNode.className = 'nain-music-widget-root';
    this.mountNode.style.width = '100%';
    this.mountNode.style.minHeight = '100%';
    this.appendChild(this.mountNode);

    this.root = createRoot(this.mountNode);
    this.root.render(<App />);
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    if (this.mountNode) {
      this.mountNode.remove();
      this.mountNode = null;
    }

    widgetInstanceCount = Math.max(0, widgetInstanceCount - 1);
    if (widgetInstanceCount === 0) {
      document.querySelector('style[data-nain-music-widget-runtime]')?.remove();
    }
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, NainMusicAppElement);
}
