import { Interaction } from '../types';

let sessionInteractions: Interaction[] = [];

export const recordInteraction = (interaction: Interaction) => {
  sessionInteractions.push(interaction);
  console.log('Session Interactions:', sessionInteractions);
};

export const getSessionInteractions = () => [...sessionInteractions];

export const clearSession = () => {
  sessionInteractions = [];
};
