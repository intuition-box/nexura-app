import TabNavigation from '../TabNavigation';

export default function TabNavigationExample() {
  return <TabNavigation onTabChange={(tab) => console.log('Tab changed to:', tab)} />;
}