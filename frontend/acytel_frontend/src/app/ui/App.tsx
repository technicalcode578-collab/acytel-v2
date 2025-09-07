// File: src/app/ui/App.tsx
import type { Component } from 'solid-js';
import { AppRouter } from '../providers/router';
import styles from '../styles/App.module.css';
import logo from '../assets/logo.svg';

const App: Component = () => {
  return (
    <div>
      <AppRouter />
    </div>
  );
};

export default App;