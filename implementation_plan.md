# Implementation Plan: Supabase Integration for 나비 Categories

## Summary
Update all 나비 application pages to use Supabase data instead of localStorage. The project already has excellent Supabase infrastructure (services, hooks, types) but some pages are still using localStorage (`useAppState`).

## Scope
### In Scope
- Update 8 pages to use Supabase hooks instead of localStorage
- Ensure unified search works across all Supabase tables
- Maintain backward compatibility with localStorage fallback
- Test that 469 시세체크, 1,299 기업정보, 660 거래내역, 280 진행리스트 records display properly

### Out of Scope
- Changing existing Supabase service layer (already comprehensive)
- Modifying authentication or permissions
- Database schema changes

## Planned Changes
| File | Action | Purpose |
|------|--------|---------|
| src/pages/PriceCheckPage.tsx | Modify | Switch from useAppState to usePriceChecks hook |
| src/pages/ClientRequestsPage.tsx | Modify | Switch from useAppState to useClientRequests hook |
| src/pages/CompanyInfoPage.tsx | Modify | Switch from useAppState to useCompanies hook |
| src/pages/TransactionPage.tsx | Modify | Switch from useAppState to useTransactions hook |
| src/pages/TaskListPage.tsx | Modify | Switch from useAppState to useTasks hook |
| src/pages/AccountInfoPage.tsx | Modify | Switch from useAppState to useAccounts hook |
| src/pages/DiaryPage.tsx | Modify | Switch from useAppState to useDiaryEntries hook |
| src/App.tsx | Modify | Update search to use globalSearch from Supabase service |

## Technical Approach
1. **Replace Data Sources**: Change `useAppState()` calls to appropriate Supabase hooks (`usePriceChecks`, `useCompanies`, etc.)
2. **Update CRUD Operations**: Replace `setState` calls with hook methods (`create`, `update`, `delete`)
3. **Add Status Indicators**: Show Supabase connection status and loading states
4. **Maintain Search Integration**: Ensure search navigation still works with new data sources
5. **Preserve Fallback**: Keep localStorage fallback behavior intact through hooks

## Implementation Pattern
For each page:
```typescript
// Before
const { priceChecks, setPriceChecks } = useAppState();

// After  
const { data: priceChecks, create: createPriceCheck, update: updatePriceCheck, delete: deletePriceCheck, loading, isSupabaseActive } = usePriceChecks();
```

## Estimated Complexity
**Medium** — Systematic refactoring with existing infrastructure. Low risk due to fallback systems already in place.

## Risk Assessment
- **Data Migration Risk**: Low — hooks handle fallback to localStorage automatically
- **Breaking Changes Risk**: Low — existing UI patterns preserved
- **Performance Risk**: Medium — Large datasets (1,299 companies) may need pagination consideration