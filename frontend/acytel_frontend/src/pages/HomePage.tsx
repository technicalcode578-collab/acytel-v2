// File: src/pages/HomePage.tsx
import { Component, createSignal, onMount } from 'solid-js';
import styles from './HomePage.module.css';

const QuickPickCard = (props: { imgText: string; color: string; title: string }) => (
  <div class={styles.pickCard}>
    <img 
      src={`https://placehold.co/80x80/${props.color}/white?text=${props.imgText}`} 
      alt={props.title} 
      class={styles.pickImage}
    />
    <span class={styles.pickTitle}>{props.title}</span>
  </div>
);

export const HomePage: Component = () => {
  const [greeting, setGreeting] = createSignal('Good morning');

  onMount(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good morning');
    else if (currentHour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  });

  return (
    <div class={styles.pageWrapper}>
      <h1 class={styles.greeting}>{greeting()}</h1>
      <div class={styles.quickPicksGrid}>
        <QuickPickCard imgText="L" color="7e22ce" title="Liked Songs" />
        <QuickPickCard imgText="DP" color="1d4ed8" title="Daily Mix 1" />
        <QuickPickCard imgText="CH" color="be123c" title="Chill Hits" />
        <QuickPickCard imgText="RW" color="15803d" title="Rap Workout" />
      </div>
      {/* Additional sections like "Made For You" will be added here */}
    </div>
  );
};