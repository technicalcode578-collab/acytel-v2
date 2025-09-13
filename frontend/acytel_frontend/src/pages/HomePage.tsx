import { Component, onMount } from 'solid-js';
import { ResponsiveHomeScreen } from '../widgets/HomeScreen/ResponsiveHomeScreen';

const HomePage: Component = () => {
  onMount(() => {
    console.log("🏠 HomePage fully loaded - Universe No. 1 achieved!");
  });

  return (
    <div class="min-h-screen">
      <ResponsiveHomeScreen />
    </div>
  );
};

export default HomePage;