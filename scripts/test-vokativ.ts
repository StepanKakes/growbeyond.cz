import { vokativ } from 'vokativ';

const testNames = [
    { input: 'Petr', expected: 'Petře' },
    { input: 'Jana', expected: 'Jano' },
    { input: 'Lukáš', expected: 'Lukáši' },
    { input: 'Martin', expected: 'Martine' },
    { input: 'Lucie', expected: 'Lucie' },
    { input: 'Zuzana', expected: 'Zuzano' },
    { input: 'Jiří', expected: 'Jiří' },
    { input: 'Alena', expected: 'Aleno' },
];

console.log('Testing Czech Vocative Conversion:');
console.log('-----------------------------------');

let passed = 0;
testNames.forEach(({ input, expected }) => {
    const rawResult = vokativ(input);
    const result = rawResult.charAt(0).toUpperCase() + rawResult.slice(1);
    const isCorrect = result === expected;
    if (isCorrect) {
        passed++;
        console.log(`✅ ${input} -> ${result}`);
    } else {
        console.log(`❌ ${input} -> Expected: ${expected}, Got: ${result}`);
    }
});

console.log('-----------------------------------');
console.log(`Result: ${passed}/${testNames.length} passed.`);

if (passed === testNames.length) {
    process.exit(0);
} else {
    process.exit(1);
}
