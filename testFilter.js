import { checkExplicitContent } from './src/utils/explicitFilter.ts';

console.log('class execution:', checkExplicitContent('class execution'));
console.log('Sussex:', checkExplicitContent('Sussex'));
console.log('Essex:', checkExplicitContent('Essex'));
console.log('m i d d l e s e x:', checkExplicitContent('m i d d l e s e x'));
