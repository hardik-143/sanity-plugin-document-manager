import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useProjectId} from 'sanity'
import styled, {css, keyframes} from 'styled-components'

import type {DocEntry, ResolvedConfig} from '../types'
import {makeClient} from '../utils/client'

/* ─────────────────────────────────────────────────────────────
   Theme
   ───────────────────────────────────────────────────────────── */

type ThemeMode = 'light' | 'dark' | 'system'

const themeVars = {
  light: {
    '--dm-bg': '#f4f6f8',
    '--dm-card': '#ffffff',
    '--dm-text': '#1a202c',
    '--dm-text-2': '#64748b',
    '--dm-text-3': '#94a3b8',
    '--dm-border': '#e2e8f0',
    '--dm-border-2': '#f1f5f9',
    '--dm-input': '#f8fafc',
    '--dm-accent': '#0d9488',
    '--dm-accent-hover': '#0f766e',
    '--dm-accent-subtle': 'rgba(13,148,136,0.08)',
    '--dm-accent-ring': 'rgba(13,148,136,0.12)',
    '--dm-hover': '#f8fafc',
    '--dm-shadow': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '--dm-shadow-lg': '0 8px 24px rgba(0,0,0,0.08)',
    '--dm-btn-bg': '#ffffff',
    '--dm-btn-text': '#475569',
    '--dm-btn-border': '#e2e8f0',
    '--dm-btn-hover': '#f1f5f9',
    '--dm-delete': '#ef4444',
    '--dm-delete-hover': '#dc2626',
    '--dm-row-active': '#f0fdfa',
    '--dm-row-active-border': '#99f6e4',
    '--dm-draft-dot': '#f59e0b',
    '--dm-ok-bg': '#ecfdf5',
    '--dm-ok-text': '#065f46',
    '--dm-err-bg': '#fef2f2',
    '--dm-err-text': '#991b1b',
    '--dm-spinner': '#0d9488',
    '--dm-spinner-track': '#e2e8f0',
    '--dm-picker-bg': '#ffffff',
    '--dm-picker-border': '#e2e8f0',
    '--dm-fab-bg': '#ffffff',
    '--dm-fab-border': '#e2e8f0',
    '--dm-dataset-active': '#0d9488',
    '--dm-dataset-active-text': '#ffffff',
    '--dm-dataset-bg': '#f1f5f9',
    '--dm-dataset-text': '#64748b',
  } as Record<string, string>,
  dark: {
    '--dm-bg': '#0f1117',
    '--dm-card': '#1a1d27',
    '--dm-text': '#e2e8f0',
    '--dm-text-2': '#94a3b8',
    '--dm-text-3': '#64748b',
    '--dm-border': '#2d3348',
    '--dm-border-2': '#232738',
    '--dm-input': '#232738',
    '--dm-accent': '#2dd4bf',
    '--dm-accent-hover': '#5eead4',
    '--dm-accent-subtle': 'rgba(45,212,191,0.08)',
    '--dm-accent-ring': 'rgba(45,212,191,0.15)',
    '--dm-hover': '#232738',
    '--dm-shadow': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
    '--dm-shadow-lg': '0 8px 24px rgba(0,0,0,0.4)',
    '--dm-btn-bg': '#232738',
    '--dm-btn-text': '#e2e8f0',
    '--dm-btn-border': '#2d3348',
    '--dm-btn-hover': '#2d3348',
    '--dm-delete': '#ef4444',
    '--dm-delete-hover': '#dc2626',
    '--dm-row-active': '#0f2a27',
    '--dm-row-active-border': '#115e59',
    '--dm-draft-dot': '#fbbf24',
    '--dm-ok-bg': '#052e16',
    '--dm-ok-text': '#86efac',
    '--dm-err-bg': '#450a0a',
    '--dm-err-text': '#fca5a5',
    '--dm-spinner': '#2dd4bf',
    '--dm-spinner-track': '#2d3348',
    '--dm-picker-bg': '#1a1d27',
    '--dm-picker-border': '#2d3348',
    '--dm-fab-bg': '#1a1d27',
    '--dm-fab-border': '#2d3348',
    '--dm-dataset-active': '#2dd4bf',
    '--dm-dataset-active-text': '#042f2e',
    '--dm-dataset-bg': '#232738',
    '--dm-dataset-text': '#94a3b8',
  } as Record<string, string>,
}

/* ─────────────────────────────────────────────────────────────
   Dynamic type badge colors
   ───────────────────────────────────────────────────────────── */

const TYPE_PALETTE = [
  {bg: '#dbeafe', text: '#1e40af'},
  {bg: '#dcfce7', text: '#166534'},
  {bg: '#fce7f3', text: '#9d174d'},
  {bg: '#ffedd5', text: '#9a3412'},
  {bg: '#ede9fe', text: '#5b21b6'},
  {bg: '#ccfbf1', text: '#115e59'},
  {bg: '#fef9c3', text: '#854d0e'},
  {bg: '#e0e7ff', text: '#3730a3'},
  {bg: '#fce4ec', text: '#880e4f'},
  {bg: '#e0f2f1', text: '#004d40'},
  {bg: '#f3e5f5', text: '#6a1b9a'},
  {bg: '#fff3e0', text: '#e65100'},
]

const DARK_TYPE_PALETTE = [
  {bg: '#1e3a5f', text: '#93c5fd'},
  {bg: '#14532d', text: '#86efac'},
  {bg: '#500724', text: '#f9a8d4'},
  {bg: '#431407', text: '#fdba74'},
  {bg: '#2e1065', text: '#c4b5fd'},
  {bg: '#042f2e', text: '#5eead4'},
  {bg: '#422006', text: '#fde047'},
  {bg: '#1e1b4b', text: '#a5b4fc'},
  {bg: '#4a0404', text: '#fda4af'},
  {bg: '#022c22', text: '#6ee7b7'},
  {bg: '#3b0764', text: '#d8b4fe'},
  {bg: '#431407', text: '#fb923c'},
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.abs(h * 31 + s.charCodeAt(i))
  return h
}

function getTypeColor(type: string, dark: boolean): {bg: string; text: string} {
  const palette = dark ? DARK_TYPE_PALETTE : TYPE_PALETTE
  return palette[hashString(type) % palette.length]
}

/* ─────────────────────────────────────────────────────────────
   Styled components
   ───────────────────────────────────────────────────────────── */

const Root = styled.div`
  width: 100%;
  min-height: 100%;
  background: var(--dm-bg);
  padding: 24px 28px 80px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--dm-text);
  overflow: auto;
  position: relative;
`

/* ── Header ── */

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
`

const TitleBlock = styled.div``

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--dm-text);
  letter-spacing: -0.3px;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--dm-text-2);
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

/* ── Stat pills (compact, inline in header) ── */

const StatPills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`

const Pill = styled.div<{$color?: string}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background: var(--dm-card);
  box-shadow: var(--dm-shadow);
  font-size: 12px;
  color: var(--dm-text-2);
  white-space: nowrap;

  strong {
    font-weight: 700;
    color: ${(p) => p.$color || 'var(--dm-text)'};
    font-size: 14px;
  }
`

/* ── Dataset tabs ── */

const DatasetBar = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`

const DatasetTab = styled.button<{$active?: boolean}>`
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;

  ${(p) =>
    p.$active
      ? css`
          background: var(--dm-dataset-active);
          color: var(--dm-dataset-active-text);
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
        `
      : css`
          background: var(--dm-dataset-bg);
          color: var(--dm-dataset-text);
          &:hover {
            background: var(--dm-btn-hover);
          }
        `}
`

/* ── Search bar (full-width, prominent) ── */

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 12px;
`

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--dm-text-3);
  display: flex;
  pointer-events: none;
`

const SearchInput = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 16px 0 40px;
  border: 1px solid var(--dm-border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--dm-text);
  background: var(--dm-card);
  box-sizing: border-box;
  box-shadow: var(--dm-shadow);
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &::placeholder {
    color: var(--dm-text-3);
  }

  &:focus {
    border-color: var(--dm-accent);
    box-shadow:
      var(--dm-shadow),
      0 0 0 3px var(--dm-accent-ring);
  }
`

/* ── Filter row ── */

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
`

const Select = styled.select`
  height: 34px;
  padding: 0 30px 0 10px;
  border: 1px solid var(--dm-border);
  border-radius: 8px;
  font-size: 12px;
  color: var(--dm-text-2);
  background: var(--dm-card)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")
    no-repeat right 10px center;
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--dm-accent);
    box-shadow: 0 0 0 3px var(--dm-accent-ring);
  }
`

const ToggleChip = styled.button<{$on?: boolean}>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  ${(p) =>
    p.$on
      ? css`
          background: var(--dm-accent-subtle);
          border: 1px solid var(--dm-accent);
          color: var(--dm-accent);
        `
      : css`
          background: var(--dm-card);
          border: 1px solid var(--dm-border);
          color: var(--dm-text-3);
          &:hover {
            border-color: var(--dm-accent);
            color: var(--dm-text-2);
          }
        `}
`

const FilterSpacer = styled.div`
  flex: 1;
`

const CountLabel = styled.span`
  font-size: 12px;
  color: var(--dm-text-3);
`

/* ── Table ── */

const TableCard = styled.div`
  background: var(--dm-card);
  border-radius: 12px;
  box-shadow: var(--dm-shadow);
  overflow: hidden;
`

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--dm-input);
  border-bottom: 1px solid var(--dm-border);
  font-size: 10px;
  font-weight: 700;
  color: var(--dm-text-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  gap: 12px;
`

const Row = styled.div<{$active?: boolean}>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid var(--dm-border-2);
  border-left: 3px solid ${(p) => (p.$active ? 'var(--dm-accent)' : 'transparent')};
  background: ${(p) => (p.$active ? 'var(--dm-row-active)' : 'transparent')};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(p) => (p.$active ? 'var(--dm-row-active)' : 'var(--dm-hover)')};
  }
`

const ColCheck = styled.div`
  width: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`

const ColTitle = styled.div`
  flex: 2;
  min-width: 0;
`

const CellName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--dm-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CellId = styled.div`
  font-size: 10px;
  color: var(--dm-text-3);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ColType = styled.div`
  width: 140px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`

const TypeBadge = styled.span<{$bg: string; $color: string}>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  white-space: nowrap;
`

const DraftDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dm-draft-dot);
  flex-shrink: 0;
  title: 'Draft';
`

const ColDate = styled.div`
  width: 100px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--dm-text-3);

  @media (max-width: 900px) {
    display: none;
  }
`

/* ── Pagination ── */

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid var(--dm-border-2);
  font-size: 12px;
  color: var(--dm-text-3);
`

const PageBtns = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`

const PageBtn = styled.button<{$active?: boolean}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition:
    background 0.12s,
    color 0.12s;

  ${(p) =>
    p.$active
      ? css`
          background: var(--dm-accent);
          color: #fff;
        `
      : css`
          background: transparent;
          color: var(--dm-text-2);
          &:hover:not(:disabled) {
            background: var(--dm-btn-hover);
          }
        `}

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`

/* ── Floating action bar (appears when items selected) ── */

const FloatingBar = styled.div`
  position: sticky;
  bottom: 16px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--dm-fab-bg);
  border: 1px solid var(--dm-fab-border);
  border-radius: 14px;
  padding: 10px 20px;
  box-shadow: var(--dm-shadow-lg);
  z-index: 10;
  margin: 16px auto 0;
  width: fit-content;
`

const FabText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--dm-text);
`

const FabDeleteBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--dm-delete);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  height: 34px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--dm-delete-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const FabClearBtn = styled.button`
  background: transparent;
  color: var(--dm-text-2);
  font-size: 12px;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.12s;

  &:hover {
    color: var(--dm-text);
  }
`

/* ── Buttons ── */

const spin = keyframes`to { transform: rotate(360deg); }`

const GhostBtn = styled.button<{$spin?: boolean}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--dm-btn-bg);
  color: var(--dm-btn-text);
  font-size: 12px;
  font-weight: 500;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--dm-btn-border);
  cursor: pointer;
  box-shadow: var(--dm-shadow);
  transition:
    background 0.12s,
    border-color 0.12s;

  svg {
    animation: ${(p) =>
      p.$spin
        ? css`
            ${spin} 0.7s linear infinite
          `
        : 'none'};
  }

  &:hover:not(:disabled) {
    background: var(--dm-btn-hover);
    border-color: var(--dm-text-3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

/* ── Status ── */

const StatusMsg = styled.div<{$ok: boolean}>`
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
  background: ${(p) => (p.$ok ? 'var(--dm-ok-bg)' : 'var(--dm-err-bg)')};
  color: ${(p) => (p.$ok ? 'var(--dm-ok-text)' : 'var(--dm-err-text)')};
`

/* ── Loading / Empty ── */

const LoadingWrap = styled.div`
  padding: 56px 24px;
  text-align: center;
  color: var(--dm-text-2);
  font-size: 13px;
`

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid var(--dm-spinner-track);
  border-top-color: var(--dm-spinner);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  margin: 0 auto 10px;
`

const EmptyWrap = styled.div`
  padding: 56px 24px;
  text-align: center;
`

const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.4;
`

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--dm-text-2);
  margin-bottom: 4px;
`

const EmptyText = styled.div`
  font-size: 12px;
  color: var(--dm-text-3);
`

/* ── Theme Picker ── */

const ThemePicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--dm-picker-bg);
  border: 1px solid var(--dm-picker-border);
  border-radius: 8px;
  padding: 2px;
`

const ThemeBtn = styled.button<{$active?: boolean; $kind: 'light' | 'dark' | 'system'}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;

  ${(p) =>
    p.$active
      ? p.$kind === 'light'
        ? css`
            background: #fff7ed;
            border: 1.5px solid #f97316;
            color: #ea580c;
            box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.12);
          `
        : p.$kind === 'dark'
          ? css`
              background: #eef2ff;
              border: 1.5px solid #6366f1;
              color: #4f46e5;
              box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
            `
          : css`
              background: #ecfdf5;
              border: 1.5px solid #10b981;
              color: #059669;
              box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.12);
            `
      : css`
          background: transparent;
          border: 1.5px solid transparent;
          color: var(--dm-text-3);

          &:hover {
            color: var(--dm-text-2);
            background: var(--dm-hover);
          }
        `}

  svg {
    width: 13px;
    height: 13px;
  }
`

/* ─────────────────────────────────────────────────────────────
   Icons (inline SVG — no external deps)
   ───────────────────────────────────────────────────────────── */

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const MonitorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const RefreshIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

const SearchIconSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
)

/* ─────────────────────────────────────────────────────────────
   Pagination helper
   ───────────────────────────────────────────────────────────── */

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({length: total}, (_, i) => i)
  const pages: (number | '...')[] = [0]
  let start = Math.max(1, current - 1)
  let end = Math.min(total - 2, current + 1)
  if (current <= 2) {
    start = 1
    end = 3
  }
  if (current >= total - 3) {
    start = total - 4
    end = total - 2
  }
  if (start > 1) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 2) pages.push('...')
  pages.push(total - 1)
  return pages
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */

type SortKey = 'updated' | 'created' | 'title' | 'type'

export function DocumentManagerTool({config}: {config: ResolvedConfig}) {
  const projectId = useProjectId()
  const token =
    typeof process !== 'undefined'
      ? (process.env.SANITY_STUDIO_WRITE_TOKEN ?? process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN)
      : undefined

  const {pageSize: defaultPageSize, apiVersion, excludeTypes, defaultDataset} = config

  // ── State ──
  const [datasets, setDatasets] = useState<string[]>([])
  const [selectedDataset, setSelectedDataset] = useState('')
  const [loadingDatasets, setLoadingDatasets] = useState(true)
  const [docs, setDocs] = useState<DocEntry[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [types, setTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState('_all')
  const [searchQuery, setSearchQuery] = useState('')
  const [includeDrafts, setIncludeDrafts] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{text: string; tone: 'ok' | 'err'} | null>(null)
  const [page, setPage] = useState(0)
  const [sortBy, setSortBy] = useState<SortKey>('updated')
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // ── Theme ──
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('doc-manager-theme')
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    } catch {
      /* ignore */
    }
    return 'system'
  })
  const [sysDark, setSysDark] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = (e: MediaQueryListEvent) => setSysDark(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const isDark = themeMode === 'system' ? sysDark : themeMode === 'dark'
  const currentVars = themeVars[isDark ? 'dark' : 'light']

  const setTheme = useCallback((m: ThemeMode) => {
    setThemeMode(m)
    try {
      localStorage.setItem('doc-manager-theme', m)
    } catch {
      /* ignore */
    }
  }, [])

  // ── Fetch datasets ──
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/datasets`, {
          headers: {Authorization: `Bearer ${token}`},
        })
        const data: {name: string}[] = await res.json()
        const names = data.map((d) => d.name).sort()
        setDatasets(names)
        if (defaultDataset && names.includes(defaultDataset)) setSelectedDataset(defaultDataset)
        else if (names.length) setSelectedDataset(names[0])
      } catch {
        setStatusMsg({text: 'Failed to load datasets', tone: 'err'})
      } finally {
        setLoadingDatasets(false)
      }
    })()
  }, [projectId, apiVersion, token, defaultDataset])

  // ── Fetch documents ──
  const fetchDocuments = useCallback(
    async (ds: string, manual = false) => {
      if (!ds) return
      if (manual) setIsRefreshing(true)
      else setLoadingDocs(true)
      setSelected(new Set())
      setSelectedType('_all')
      setSearchQuery('')
      setPage(0)
      try {
        const client = makeClient({projectId, dataset: ds, apiVersion, token})
        const result = await client.fetch<DocEntry[]>(
          `*[!(_id in path("_.**"))] | order(_updatedAt desc) {_id, _type, _createdAt, _updatedAt, title, name}`,
        )
        setDocs(result)
        const allTypes = [...new Set(result.map((d) => d._type))].sort()
        setTypes(excludeTypes.length ? allTypes.filter((t) => !excludeTypes.includes(t)) : allTypes)
      } catch {
        setStatusMsg({text: 'Failed to load documents', tone: 'err'})
      } finally {
        setLoadingDocs(false)
        setIsRefreshing(false)
      }
    },
    [projectId, apiVersion, token, excludeTypes],
  )

  useEffect(() => {
    fetchDocuments(selectedDataset)
  }, [selectedDataset, fetchDocuments])

  // ── Filter + sort + paginate ──
  const filteredDocs = useMemo(() => {
    let list = docs
    if (excludeTypes.length) list = list.filter((d) => !excludeTypes.includes(d._type))
    if (!includeDrafts) list = list.filter((d) => !d._id.startsWith('drafts.'))
    if (selectedType !== '_all') list = list.filter((d) => d._type === selectedType)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (d) =>
          (d.title || '').toLowerCase().includes(q) ||
          (d.name || '').toLowerCase().includes(q) ||
          d._id.toLowerCase().includes(q) ||
          d._type.toLowerCase().includes(q),
      )
    }
    // Sort
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'title': {
          const at = (a.title || a.name || a._id).toLowerCase()
          const bt = (b.title || b.name || b._id).toLowerCase()
          return at.localeCompare(bt)
        }
        case 'type':
          return a._type.localeCompare(b._type)
        case 'created':
          return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
        case 'updated':
        default:
          return new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
      }
    })
    return list
  }, [docs, selectedType, searchQuery, includeDrafts, excludeTypes, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize))
  const pagedDocs = useMemo(
    () => filteredDocs.slice(page * pageSize, (page + 1) * pageSize),
    [filteredDocs, page, pageSize],
  )

  useEffect(() => {
    setPage(0)
    setSelected(new Set())
  }, [selectedType, searchQuery, includeDrafts, sortBy, pageSize])

  // ── Selection ──
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const ids = pagedDocs.map((d) => d._id)
      const allIn = ids.every((id) => prev.has(id))
      const n = new Set(prev)
      ids.forEach((id) => (allIn ? n.delete(id) : n.add(id)))
      return n
    })
  }, [pagedDocs])

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!selected.size) return
    if (!window.confirm(`Delete ${selected.size} document(s)? This cannot be undone.`)) return
    setDeleting(true)
    setStatusMsg(null)
    try {
      const client = makeClient({projectId, dataset: selectedDataset, apiVersion, token})
      let tx = client.transaction()
      selected.forEach((id) => {
        tx = tx.delete(id)
      })
      await tx.commit()
      setDocs((prev) => prev.filter((d) => !selected.has(d._id)))
      setStatusMsg({text: `Deleted ${selected.size} document(s) successfully`, tone: 'ok'})
      setSelected(new Set())
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setStatusMsg({text: `Delete failed: ${msg}`, tone: 'err'})
    } finally {
      setDeleting(false)
    }
  }, [selected, selectedDataset, projectId, apiVersion, token])

  // ── Stats ──
  const stats = useMemo(() => {
    const published = filteredDocs.filter((d) => !d._id.startsWith('drafts.')).length
    const drafts = filteredDocs.filter((d) => d._id.startsWith('drafts.')).length
    return {total: docs.length, filtered: filteredDocs.length, published, drafts}
  }, [docs, filteredDocs])

  const allPageSelected = pagedDocs.length > 0 && pagedDocs.every((d) => selected.has(d._id))

  // ── Render ──

  if (loadingDatasets) {
    return (
      <Root style={currentVars as React.CSSProperties}>
        <LoadingWrap>
          <Spinner />
          Loading datasets…
        </LoadingWrap>
      </Root>
    )
  }

  return (
    <Root style={currentVars as React.CSSProperties}>
      {/* Header */}
      <Header>
        <TitleBlock>
          <Title>{config.titleEmoji} {config.title}</Title>
          <Subtitle>Manage documents across datasets</Subtitle>
        </TitleBlock>
        <HeaderActions>
          <ThemePicker>
            <ThemeBtn
              $kind="light"
              $active={themeMode === 'light'}
              onClick={() => setTheme('light')}
              title="Light"
            >
              <SunIcon />
            </ThemeBtn>
            <ThemeBtn
              $kind="dark"
              $active={themeMode === 'dark'}
              onClick={() => setTheme('dark')}
              title="Dark"
            >
              <MoonIcon />
            </ThemeBtn>
            <ThemeBtn
              $kind="system"
              $active={themeMode === 'system'}
              onClick={() => setTheme('system')}
              title="System"
            >
              <MonitorIcon />
            </ThemeBtn>
          </ThemePicker>
          <GhostBtn
            onClick={() => fetchDocuments(selectedDataset, true)}
            disabled={loadingDocs || isRefreshing}
            $spin={isRefreshing}
          >
            <RefreshIcon />
            Refresh
          </GhostBtn>
        </HeaderActions>
      </Header>

      {/* Status */}
      {statusMsg && <StatusMsg $ok={statusMsg.tone === 'ok'}>{statusMsg.text}</StatusMsg>}

      {/* Dataset tabs */}
      {datasets.length > 1 && (
        <DatasetBar>
          {datasets.map((ds) => (
            <DatasetTab
              key={ds}
              $active={ds === selectedDataset}
              onClick={() => setSelectedDataset(ds)}
            >
              {ds}
            </DatasetTab>
          ))}
        </DatasetBar>
      )}

      {/* Stat pills */}
      {!loadingDocs && (
        <StatPills>
          <Pill>
            <strong>{stats.total}</strong> <span>total</span>
          </Pill>
          <Pill>
            <strong>{stats.filtered}</strong> <span>filtered</span>
          </Pill>
          <Pill $color="#10b981">
            <strong>{stats.published}</strong> <span>published</span>
          </Pill>
          <Pill $color="#f59e0b">
            <strong>{stats.drafts}</strong> <span>drafts</span>
          </Pill>
          <Pill $color="var(--dm-accent)">
            <strong>{types.length}</strong> <span>types</span>
          </Pill>
        </StatPills>
      )}

      {/* Search */}
      <SearchBar>
        <SearchIcon>
          <SearchIconSvg />
        </SearchIcon>
        <SearchInput
          placeholder="Search by title, name, ID, or type…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBar>

      {/* Filter row */}
      <FilterRow>
        <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="_all">All types ({docs.length})</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t} ({docs.filter((d) => d._type === t).length})
            </option>
          ))}
        </Select>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
          <option value="updated">Sort: Last updated</option>
          <option value="created">Sort: Newest first</option>
          <option value="title">Sort: Title A-Z</option>
          <option value="type">Sort: Type A-Z</option>
        </Select>

        <ToggleChip $on={includeDrafts} onClick={() => setIncludeDrafts((v) => !v)}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: includeDrafts ? 'var(--dm-draft-dot)' : 'var(--dm-text-3)',
            }}
          />
          Drafts
        </ToggleChip>

        <FilterSpacer />

        <CountLabel>
          {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
        </CountLabel>
      </FilterRow>

      {/* Table */}
      {loadingDocs ? (
        <TableCard>
          <LoadingWrap>
            <Spinner />
            Loading documents…
          </LoadingWrap>
        </TableCard>
      ) : filteredDocs.length === 0 ? (
        <TableCard>
          <EmptyWrap>
            <EmptyIcon>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{color: 'var(--dm-text-3)'}}
              >
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
                <line x1="10" y1="13" x2="10" y2="13" />
                <line x1="14" y1="17" x2="14" y2="17" />
              </svg>
            </EmptyIcon>
            <EmptyTitle>No documents found</EmptyTitle>
            <EmptyText>Try adjusting your filters or search query.</EmptyText>
          </EmptyWrap>
        </TableCard>
      ) : (
        <TableCard>
          {/* Header row */}
          <RowHeader>
            <ColCheck>
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleSelectAll}
                style={{cursor: 'pointer'}}
              />
            </ColCheck>
            <ColTitle>Title / Name / ID</ColTitle>
            <ColType>Type</ColType>
            <ColDate>Created</ColDate>
            <ColDate>Updated</ColDate>
          </RowHeader>

          {/* Rows */}
          {pagedDocs.map((doc) => {
            const isActive = selected.has(doc._id)
            const rawName = doc.title || doc.name || doc._id
            const displayName = typeof rawName === 'string' ? rawName : String(rawName)
            const isDraft = doc._id.startsWith('drafts.')
            const tc = getTypeColor(doc._type, isDark)
            return (
              <Row key={doc._id} $active={isActive} onClick={() => toggleSelect(doc._id)}>
                <ColCheck>
                  <input type="checkbox" checked={isActive} readOnly style={{cursor: 'pointer'}} />
                </ColCheck>
                <ColTitle>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    {isDraft && <DraftDot title="Draft" />}
                    <CellName title={displayName}>{displayName}</CellName>
                  </div>
                  {(doc.title || doc.name) && <CellId>{doc._id}</CellId>}
                </ColTitle>
                <ColType>
                  <TypeBadge $bg={tc.bg} $color={tc.text}>
                    {doc._type}
                  </TypeBadge>
                </ColType>
                <ColDate>{new Date(doc._createdAt).toLocaleDateString()}</ColDate>
                <ColDate>{new Date(doc._updatedAt).toLocaleDateString()}</ColDate>
              </Row>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationBar>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{height: 28, fontSize: 11}}
                >
                  {[25, 50, 100, 200].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </Select>
              </div>
              <PageBtns>
                <PageBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </PageBtn>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`e${i}`} style={{padding: '0 2px', color: 'var(--dm-text-3)'}}>
                      …
                    </span>
                  ) : (
                    <PageBtn key={p} $active={p === page} onClick={() => setPage(p)}>
                      {p + 1}
                    </PageBtn>
                  ),
                )}
                <PageBtn
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </PageBtn>
              </PageBtns>
              <CountLabel>
                Page {page + 1} of {totalPages}
              </CountLabel>
            </PaginationBar>
          )}
        </TableCard>
      )}

      {/* Floating action bar */}
      {selected.size > 0 && (
        <FloatingBar>
          <FabText>{selected.size} selected</FabText>
          <FabDeleteBtn onClick={handleDelete} disabled={deleting}>
            <TrashIcon />
            Delete
          </FabDeleteBtn>
          <FabClearBtn onClick={() => setSelected(new Set())}>Clear</FabClearBtn>
        </FloatingBar>
      )}
    </Root>
  )
}
