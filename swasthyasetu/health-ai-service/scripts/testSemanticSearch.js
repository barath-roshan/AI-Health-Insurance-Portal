require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { connectMongoDB, closeMongoDB } = require('../src/config/mongodb');
const { semanticSearch } = require('../src/retrieval/vectorSearch');
const { evaluateRetrieval } = require('../src/retrieval/retrievalEvaluator');
const logger = require('../src/utils/logger');

async function main() {
  try {
    logger.info('==================================================');
    logger.info('STEP 11 & 12: SEMANTIC SEARCH EVALUATION SUITE');
    logger.info('==================================================');

    await connectMongoDB();

    const testQueriesPath = path.resolve(__dirname, '../data/evaluation/retrieval_test_queries.json');
    if (!fs.existsSync(testQueriesPath)) {
      throw new Error(`Test queries file not found at: ${testQueriesPath}`);
    }

    const testQueries = JSON.parse(fs.readFileSync(testQueriesPath, 'utf8'));
    logger.info(`Loaded ${testQueries.length} evaluation queries from ${testQueriesPath}\n`);

    let countRelevant = 0;
    let countUncertain = 0;
    let countIrrelevant = 0;

    let totalTop1Score = 0;
    let totalTop3ScoreSum = 0;
    let totalTop3Count = 0;

    let recallAt1Sum = 0;
    let recallAt3Sum = 0;
    let recallAt5Sum = 0;
    let labeledQueriesCount = 0;

    let top1SuccessCount = 0;
    let top3SuccessCount = 0;

    for (let i = 0; i < testQueries.length; i++) {
      const qObj = testQueries[i];
      const queryText = qObj.query;
      const expectedIds = Array.isArray(qObj.expected_scheme_ids) ? qObj.expected_scheme_ids : [];

      console.log('--------------------------------------------------');
      console.log(`[Query ${i + 1}/${testQueries.length}] [${qObj.category}]`);
      console.log(`Query: "${queryText}"`);

      // 1. Run Semantic Search
      const searchResults = await semanticSearch(queryText, { topK: 5 });

      // 2. Display Top Results
      if (searchResults.length === 0) {
        console.log('  No results returned.');
      } else {
        searchResults.forEach((res, rank) => {
          console.log(`  ${rank + 1}. [${res.schemeId}] ${res.schemeName} (${res.stateOrRegion})`);
          console.log(`     Score: ${res.score ? res.score.toFixed(4) : 'N/A'} | Status: ${res.verificationStatus}`);
        });
      }

      // 3. Evaluate Decision
      const evaluation = evaluateRetrieval(searchResults);
      console.log(`\n  Evaluator Decision: ${evaluation.status}`);
      console.log(`  Confidence: ${evaluation.confidence}`);
      console.log(`  Reason: ${evaluation.reason}`);

      // Count decision statuses
      if (evaluation.status === 'RELEVANT') countRelevant++;
      else if (evaluation.status === 'UNCERTAIN') countUncertain++;
      else countIrrelevant++;

      // Track similarity scores
      if (searchResults.length > 0) {
        const top1Score = searchResults[0].score || 0;
        totalTop1Score += top1Score;

        const top3Slice = searchResults.slice(0, 3);
        top3Slice.forEach(r => {
          totalTop3ScoreSum += (r.score || 0);
          totalTop3Count++;
        });
      }

      // Calculate Recall@K if ground truth labels exist
      if (expectedIds.length > 0) {
        labeledQueriesCount++;

        const top1Ids = searchResults.slice(0, 1).map(r => r.schemeId);
        const top3Ids = searchResults.slice(0, 3).map(r => r.schemeId);
        const top5Ids = searchResults.slice(0, 5).map(r => r.schemeId);

        const hits1 = expectedIds.filter(id => top1Ids.includes(id)).length;
        const hits3 = expectedIds.filter(id => top3Ids.includes(id)).length;
        const hits5 = expectedIds.filter(id => top5Ids.includes(id)).length;

        const rec1 = hits1 / expectedIds.length;
        const rec3 = hits3 / expectedIds.length;
        const rec5 = hits5 / expectedIds.length;

        recallAt1Sum += rec1;
        recallAt3Sum += rec3;
        recallAt5Sum += rec5;

        if (hits1 > 0) top1SuccessCount++;
        if (hits3 > 0) top3SuccessCount++;
      }
      console.log('--------------------------------------------------\n');
    }

    // 4. Print Overall Retrieval Quality Report
    const avgTop1Similarity = testQueries.length > 0 ? (totalTop1Score / testQueries.length).toFixed(4) : 0;
    const avgTop3Similarity = totalTop3Count > 0 ? (totalTop3ScoreSum / totalTop3Count).toFixed(4) : 0;

    const top1SuccessRate = labeledQueriesCount > 0 ? ((top1SuccessCount / labeledQueriesCount) * 100).toFixed(2) + '%' : 'N/A';
    const top3SuccessRate = labeledQueriesCount > 0 ? ((top3SuccessCount / labeledQueriesCount) * 100).toFixed(2) + '%' : 'N/A';

    const recallAt1Avg = labeledQueriesCount > 0 ? (recallAt1Sum / labeledQueriesCount).toFixed(4) : 'N/A';
    const recallAt3Avg = labeledQueriesCount > 0 ? (recallAt3Sum / labeledQueriesCount).toFixed(4) : 'N/A';
    const recallAt5Avg = labeledQueriesCount > 0 ? (recallAt5Sum / labeledQueriesCount).toFixed(4) : 'N/A';

    console.log('==================================================');
    console.log('RETRIEVAL QUALITY REPORT');
    console.log('==================================================');
    console.log(`Total queries evaluated:  ${testQueries.length}`);
    console.log(`  Relevant status count:  ${countRelevant}`);
    console.log(`  Uncertain status count: ${countUncertain}`);
    console.log(`  Irrelevant status count:${countIrrelevant}`);
    console.log('--------------------------------------------------');
    console.log(`Average Top-1 Similarity: ${avgTop1Similarity}`);
    console.log(`Average Top-3 Similarity: ${avgTop3Similarity}`);
    console.log('--------------------------------------------------');
    console.log(`Evaluated Labeled Queries: ${labeledQueriesCount}`);
    console.log(`Top-1 Retrieval Success:   ${top1SuccessRate}`);
    console.log(`Top-3 Retrieval Success:   ${top3SuccessRate}`);
    console.log(`Recall@1:                   ${recallAt1Avg}`);
    console.log(`Recall@3:                   ${recallAt3Avg}`);
    console.log(`Recall@5:                   ${recallAt5Avg}`);
    console.log('==================================================\n');

  } catch (error) {
    logger.error('Semantic search test suite failed:', error.message);
    process.exitCode = 1;
  } finally {
    await closeMongoDB();
  }
}

main();
