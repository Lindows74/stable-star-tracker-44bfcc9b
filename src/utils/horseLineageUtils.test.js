import { expect, test } from 'bun:test';
import { buildHorseAncestry, buildHorseDescendants, validateHorseParents } from './horseLineageUtils';

const dad = { id: 1, name: 'Dad', gender: 'stallion' };
const mum = { id: 2, name: 'Mum', gender: 'mare' };
const foal = { id: 3, name: 'Foal', gender: 'mare' };
test('manual mother and father are retained for the selected horse', () => {
  const map = buildHorseAncestry([dad, mum, { ...foal, sire_id: 1, dam_id: 2 }], []);
  expect(map[3].stallion.id).toBe(1);
  expect(map[3].mare.id).toBe(2);
});
test('breeding foals retain ancestry including archived records and later generations', () => {
  const map = buildHorseAncestry([dad, mum, foal, { id: 4, name: 'Next foal', gender: 'stallion', dam_id: 3 }], [{ stallion_id: 1, mare_id: 2, breeding_note_foals: [{ foal_id: 3 }] }]);
  expect(map[4].mare.id).toBe(3);
  expect(map[3].stallion.id).toBe(1);
});
test('editing one foal never changes sibling or breeding record parents', () => {
  const map = buildHorseAncestry([dad, mum, { ...foal, sire_id: 5 }, { id: 4, name: 'Sibling', gender: 'mare' }, { id: 5, name: 'Other dad', gender: 'stallion' }], [{ stallion_id: 1, mare_id: 2, breeding_note_foals: [{ foal_id: 3 }, { foal_id: 4 }] }]);
  expect(map[3].stallion.id).toBe(5);
  expect(map[4].stallion.id).toBe(1);
});
test('mother and father choices respect their genders', () => {
  expect(validateHorseParents(3, mum, null, {})).toBe('Choose a stallion as the father.');
  expect(validateHorseParents(3, null, dad, {})).toBe('Choose a mare as the mother.');
  expect(validateHorseParents(3, dad, mum, {})).toBeNull();
});
test('reject self-parent and descendant-parent cycles', () => {
  expect(validateHorseParents(1, dad, null, {})).toBe('A horse cannot be its own ancestor. Choose another parent.');
  expect(validateHorseParents(2, null, foal, { 3: { mare: mum } })).toBe('A horse cannot be its own ancestor. Choose another parent.');
});
test('bloodline includes both earlier and later generations from the same links', () => {
  const horses = [dad, mum, foal, { id: 4, name: 'Grandchild', gender: 'stallion', dam_id: 3 }];
  const ancestry = buildHorseAncestry(horses, [{ stallion_id: 1, mare_id: 2, breeding_note_foals: [{ foal_id: 3 }] }]);
  const descendants = buildHorseDescendants(horses, ancestry);
  expect(ancestry[3].mare.id).toBe(2);
  expect(descendants[1].map(h => h.id)).toEqual([3]);
  expect(descendants[2].map(h => h.id)).toEqual([3]);
  expect(descendants[3].map(h => h.id)).toEqual([4]);
  expect(descendants[4]).toBeUndefined();
});
test('descendants follow corrected manual parents without duplicating offspring', () => {
  const otherDad = { id: 5, name: 'Other dad', gender: 'stallion' };
  const horses = [dad, mum, otherDad, { ...foal, sire_id: 5 }];
  const children = buildHorseDescendants(horses, buildHorseAncestry(horses, [{ stallion_id: 1, mare_id: 2, breeding_note_foals: [{ foal_id: 3 }] }]));
  expect(children[1]).toBeUndefined();
  expect(children[5].map(h => h.id)).toEqual([3]);
  expect(children[2].map(h => h.id)).toEqual([3]);
});