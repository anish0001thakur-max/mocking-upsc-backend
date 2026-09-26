// Run with: npm run init-db
// Creates mocking_upsc.sqlite, applies schema, and seeds sample questions.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'mocking_upsc.sqlite');
const db = new Database(DB_PATH);

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const seedQuestions = [
  ['Polity', 'Directive Principles', 'medium', "The concept of 'Directive Principles of State Policy' in the Indian Constitution was borrowed from the constitution of:", 'Ireland', 'Canada', 'South Africa', 'Australia', 'A', "DPSPs were inspired by the Irish Constitution's non-justiciable guiding principles."],
  ['Geography', 'Rivers', 'easy', "Which river is known as the 'Sorrow of Bihar' due to its recurrent flooding?", 'Gandak', 'Kosi', 'Son', 'Bagmati', 'B', 'The Kosi frequently changes course and floods North Bihar.'],
  ['History', 'Colonial policies', 'medium', "The 'Doctrine of Lapse' was a policy associated with which Governor-General?", 'Lord Curzon', 'Lord Bentinck', 'Lord Dalhousie', 'Lord Canning', 'C', 'Lord Dalhousie used the doctrine to annex princely states without a natural heir.'],
  ['Economy', 'Monetary policy', 'medium', 'Repo rate is the rate at which:', 'Commercial banks lend to the public', 'RBI lends short-term funds to commercial banks', 'Commercial banks lend to each other', 'RBI borrows from the government', 'B', 'Repo rate is the rate at which RBI lends to commercial banks against securities.'],
  ['Polity', 'Fundamental Rights', 'easy', 'Which Article of the Indian Constitution deals with the abolition of untouchability?', 'Article 15', 'Article 17', 'Article 21', 'Article 25', 'B', 'Article 17 abolishes untouchability and forbids its practice in any form.'],
  ['Geography', 'Physical geography', 'medium', 'The Tropic of Cancer does NOT pass through which of these Indian states?', 'Gujarat', 'Chhattisgarh', 'Punjab', 'West Bengal', 'C', 'The Tropic of Cancer passes through 8 states; Punjab is not among them.'],
  ['History', 'Freedom movement', 'easy', "The 'Quit India Movement' was launched in which year?", '1930', '1940', '1942', '1947', 'C', 'Quit India was launched on 8 August 1942.'],
  ['Polity', 'Constitutional features', 'hard', 'Which of the following is classified as a unitary feature of the Indian Constitution?', 'Independent judiciary', 'Single citizenship', 'Bicameral legislature', 'Written constitution', 'B', 'India has single citizenship for the whole country, a unitary feature despite a federal structure.'],
  ['Economy', 'Budget & fiscal policy', 'medium', 'Fiscal deficit refers to:', 'Total expenditure minus total receipts excluding borrowings', 'Total revenue minus tax revenue', 'Total borrowings minus interest payments', 'Total imports minus total exports', 'A', 'Fiscal deficit is the gap the government must borrow to fill.'],
  ['Economy', 'International bodies', 'easy', 'The headquarters of the International Solar Alliance is located in:', 'New York, USA', 'Gurugram, India', 'Geneva, Switzerland', 'Nairobi, Kenya', 'B', 'ISA headquarters is in Gurugram, Haryana, India.']
];

const insert = db.prepare(`
  INSERT INTO questions
    (subject, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const countRow = db.prepare('SELECT COUNT(*) AS n FROM questions').get();
if (countRow.n === 0) {
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(seedQuestions);
  console.log(`Seeded ${seedQuestions.length} sample questions.`);
} else {
  console.log(`Questions table already has ${countRow.n} rows — skipped seeding.`);
}

console.log('Database ready at', DB_PATH);
db.close();
