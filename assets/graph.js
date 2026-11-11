// Hand-traced corridor centerline: entrance beside 125, past 115, then 102 door.
// Route terminates at threshold, never uses a straight line to room center.
export const nodes={entry:[170,532],lower:[254,532],junction:[254,380],approach:[356,380],door102:[356,393]};
export const edges=[['entry','lower'],['lower','junction'],['junction','approach'],['approach','door102']];
export const destinations={'102':'door102'};
