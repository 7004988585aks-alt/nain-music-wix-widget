import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const ELEMENT_NAME = 'nain-music-app';

class NainMusicAppElement extends HTMLElement {
  private root: Root | null = null;
  private mountNode: HTMLDivElement | null = null;

  connectedCallback() {
    if (this.root) return;

    this.setAttribute('data-nain-music-widget-host', 'true');
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.minHeight = '100px';

    this.mountNode = document.createElement('div');
    this.mountNode.className = 'nain-music-widget-root';
    this.mountNode.style.width = '100%';
    this.mountNode.style.minHeight = '100%';
    this.appendChild(this.mountNode);

    this.root = createRoot(this.mountNode);
    this.root.render(<App />);
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;

    this.mountNode?.remove();
    this.mountNode = null;
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, NainMusicAppElement);
}
