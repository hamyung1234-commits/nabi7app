# Implementation Plan: 3-Feature Update for 나비 (Nabi) App

## Summary
Implementing 3 interconnected features: real-time category counts, detailed item modals, and search result navigation with auto-opening details.

## Scope
### In Scope
- Real-time category count badges from Supabase
- Row click handlers for detail modals across all categories
- Search result click → navigate + highlight + auto-open modal
- All 9 categories: CustomerPage, CompanyInfoPage, TransactionPage, PriceCheckPage, ClientRequestsPage, TaskListPage, AccountInfoPage, MemoPage, DiaryPage

### Out of Scope
- New data structures or database schema changes
- Authentication or permission changes
- UI/UX redesign beyond modal implementation

## Planned Changes
| File | Action | Purpose |
|------|--------|---------|
| src/lib/supabaseService.ts | Modify | Add count service functions |
| src/components/Sidebar.tsx | Modify | Add count badges to menu items |
| src/App.tsx | Modify | Add highlight state and search result handling |
| src/components/Header.tsx | Modify | Update search click handlers |
| src/pages/*.tsx (9 files) | Modify | Add row click handlers and detail modals |
| src/types/index.ts | Modify | Add new type definitions |

## Technical Approach
1. **Count Service**: Create Supabase count queries for each table
2. **Modal System**: Implement detail modals for each category with edit/delete actions  
3. **Search Integration**: Map search results to categories with highlighting system
4. **State Management**: Use React state for modal visibility, selected items, and highlights

## Estimated Complexity
**Medium** — Multiple file changes but following existing patterns

## Risk Assessment
- **State sync risk**: Count updates need immediate reflection → use refresh triggers
- **Modal performance**: Large data sets → implement virtualization if needed
- **Search navigation**: Category mapping consistency → centralized mapping object