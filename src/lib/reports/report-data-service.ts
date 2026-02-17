/**
 * Report Data Service
 * 
 * Fetches and consolidates all test results for a participant
 * or multiple participants for unified/comparative reports.
 */

import { supabase } from '@/integrations/backend/client';
import { ParticipantTestData, ComparisonData } from './test-adapter';
import { getTestAdapter, getAllAdapters } from './test-adapter-registry';

/**
 * Fetch all completed test results for a single participant
 */
export async function fetchParticipantTestData(participantId: string): Promise<ParticipantTestData | null> {
  // Fetch participant info
  const { data: participant, error: pError } = await supabase
    .from('participants')
    .select('id, name, email, company_id, companies(name)')
    .eq('id', participantId)
    .single();

  if (pError || !participant) {
    console.error('Error fetching participant:', pError);
    return null;
  }

  // Fetch all completed tests with results
  const { data: testData, error: tError } = await supabase
    .from('participant_tests')
    .select(`
      id,
      status,
      completed_at,
      test_type_id,
      test_types(slug, name, icon)
    `)
    .eq('participant_id', participantId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });

  if (tError) {
    console.error('Error fetching participant tests:', tError);
    return null;
  }

  const tests: ParticipantTestData['tests'] = [];

  for (const pt of (testData || [])) {
    const slug = (pt.test_types as any)?.slug;
    if (!slug) continue;

    const adapter = getTestAdapter(slug);
    if (!adapter) continue;

    // Fetch the test result
    const { data: resultData } = await supabase
      .from('test_results')
      .select('*')
      .eq('participant_test_id', pt.id)
      .single();

    if (!resultData) continue;

    const summary = adapter.getSummary(resultData);
    const keyTraits = adapter.getKeyTraits(resultData);
    const comparisonMetrics = adapter.getComparisonMetrics(resultData);

    tests.push({
      slug,
      displayName: adapter.displayName,
      completedAt: pt.completed_at || '',
      result: resultData,
      adapter,
      summary,
      keyTraits,
      comparisonMetrics,
    });
  }

  return {
    participantId: participant.id,
    participantName: participant.name,
    participantEmail: participant.email,
    company: (participant as any).companies?.name || undefined,
    tests,
  };
}

/**
 * Fetch comparison data for multiple participants on the same test type
 */
export async function fetchComparisonData(
  participantIds: string[],
  testSlug: string
): Promise<ComparisonData | null> {
  const adapter = getTestAdapter(testSlug);
  if (!adapter) return null;

  // Get test_type_id from slug
  const { data: testType } = await supabase
    .from('test_types')
    .select('id, name')
    .eq('slug', testSlug)
    .single();

  if (!testType) return null;

  const participants: ComparisonData['participants'] = [];

  for (const pid of participantIds) {
    // Fetch participant name
    const { data: participant } = await supabase
      .from('participants')
      .select('id, name')
      .eq('id', pid)
      .single();

    if (!participant) continue;

    // Fetch the completed test for this participant and test type
    const { data: ptData } = await supabase
      .from('participant_tests')
      .select('id')
      .eq('participant_id', pid)
      .eq('test_type_id', testType.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!ptData) continue;

    // Fetch the result
    const { data: resultData } = await supabase
      .from('test_results')
      .select('*')
      .eq('participant_test_id', ptData.id)
      .single();

    if (!resultData) continue;

    participants.push({
      id: participant.id,
      name: participant.name,
      metrics: adapter.getComparisonMetrics(resultData),
      summary: adapter.getSummary(resultData),
    });
  }

  return {
    testSlug,
    testDisplayName: adapter.displayName,
    participants,
  };
}

/**
 * Fetch all completed test results for multiple participants (for multi-participant unified comparison)
 */
export async function fetchMultiParticipantData(
  participantIds: string[]
): Promise<ParticipantTestData[]> {
  const results: ParticipantTestData[] = [];
  
  for (const pid of participantIds) {
    const data = await fetchParticipantTestData(pid);
    if (data && data.tests.length > 0) {
      results.push(data);
    }
  }

  return results;
}
