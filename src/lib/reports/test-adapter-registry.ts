/**
 * Test Adapter Registry
 * 
 * Central registry for all test adapters. To add a new test:
 * 1. Create an adapter file in ./adapters/ implementing TestAdapter
 * 2. Import and register it here
 * 3. That's it! The unified and comparative reports will automatically include it.
 */

import { TestAdapter } from './test-adapter';
import { ciAdapter } from './adapters/ci-adapter';
import { discAdapter } from './adapters/disc-adapter';
import { soulPlanAdapter } from './adapters/soul-plan-adapter';
import { astralChartAdapter } from './adapters/astral-chart-adapter';

const adapterRegistry = new Map<string, TestAdapter>();

// Register all adapters
[ciAdapter, discAdapter, soulPlanAdapter, astralChartAdapter].forEach(adapter => {
  adapterRegistry.set(adapter.slug, adapter);
});

/**
 * Get the adapter for a specific test type by slug
 */
export function getTestAdapter(slug: string): TestAdapter | undefined {
  return adapterRegistry.get(slug);
}

/**
 * Get all registered adapters
 */
export function getAllAdapters(): TestAdapter[] {
  return Array.from(adapterRegistry.values());
}

/**
 * Check if an adapter exists for a given slug
 */
export function hasAdapter(slug: string): boolean {
  return adapterRegistry.has(slug);
}

/**
 * Register a new adapter (for dynamic registration)
 */
export function registerAdapter(adapter: TestAdapter): void {
  adapterRegistry.set(adapter.slug, adapter);
}
